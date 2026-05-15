import paramiko
import os
import sys

HOST = "109.172.36.104"
USER = "root"
PASSWORD = os.environ.get("BEGET_PASSWORD", "")
if not PASSWORD:
    print("ERROR: Set BEGET_PASSWORD env variable")
    sys.exit(1)

def run(client, cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    return exit_status, out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("Connecting...")
    client.connect(HOST, username=USER, password=PASSWORD, timeout=15)
    host = run(client, "hostname")[1]
    print(f"Connected to {host}")

    docker_img = "ghcr.io/ongudai-camp/oigudai-camp:latest"

    print("\n1. Cloning repo...")
    rc, out, err = run(client, "cd /opt && git clone git@github.com:ongudai-camp/oigudai-camp.git 2>/dev/null || (cd /opt/ongudai-camp && git pull)", 30)
    if "fatal" in err and "Could not read from remote repository" in err:
        print("Git SSH failed, using https instead...")
        run(client, "rm -rf /opt/ongudai-camp")
        rc, out, err = run(client, 'cd /opt && git clone https://github.com/ongudai-camp/oigudai-camp.git', 60)
        print(err or out)
    else:
        print(out or "OK")

    print("\n2. Checking .env file...")
    rc, out, err = run(client, "ls -la /opt/ongudai-camp/.env 2>/dev/null && echo 'EXISTS' || echo 'MISSING'")
    if "MISSING" in out:
        print(".env MISSING — copy .env.example, fill values, then re-run deploy")
        rc, out, err = run(client, "cp /opt/ongudai-camp/.env.example /opt/ongudai-camp/.env")
        print("Created .env from .env.example")
        print(">>> Fill /opt/ongudai-camp/.env with real values!")
    else:
        print(".env found")

    print(f"\n3. Pulling Docker image: {docker_img}")
    rc, out, err = run(client, f"cd /opt/ongudai-camp && docker pull {docker_img} 2>&1", 120)
    print(out[:500] if out else err[:500])

    print("\n4. Starting containers...")
    rc, out, err = run(client, "cd /opt/ongudai-camp && docker compose -f docker-compose.prod.yml up -d --remove-orphans 2>&1", 60)
    print(out[:500] if out else err[:500])

    print("\n5. DB migrations...")
    rc, out, err = run(client, "cd /opt/ongudai-camp && docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy 2>&1", 60)
    print(out[:500] if out else err[:500])

    print("\n6. Nginx setup...")
    nginx_conf = """server {
    listen 80;
    server_name ongudai-camp.ru www.ongudai-camp.ru;
    client_max_body_size 10m;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}"""
    # Write nginx config using a different approach to avoid $ issues
    cmds = [
        'cat > /etc/nginx/sites-available/ongudai-camp.ru << NGINXEOF\n'
        'server {\n'
        '    listen 80;\n'
        '    server_name ongudai-camp.ru www.ongudai-camp.ru;\n'
        '    client_max_body_size 10m;\n'
        '    location / {\n'
        '        proxy_pass http://127.0.0.1:3000;\n'
        '        proxy_http_version 1.1;\n'
        '        proxy_set_header Upgrade $http_upgrade;\n'
        '        proxy_set_header Connection "upgrade";\n'
        '        proxy_set_header Host $host;\n'
        '        proxy_set_header X-Real-IP $remote_addr;\n'
        '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n'
        '        proxy_set_header X-Forwarded-Proto $scheme;\n'
        '    }\n'
        '}\n'
        'NGINXEOF'
    ]
    rc, out, err = run(client, ' && '.join(cmds), 10)
    rc, out, err = run(client, "ln -sf /etc/nginx/sites-available/ongudai-camp.ru /etc/nginx/sites-enabled/ && rm -f /etc/nginx/sites-enabled/default && nginx -t && systemctl reload nginx 2>&1", 15)
    print(out[:500] if out else err[:500])

    print("\n7. SSL...")
    rc, out, err = run(client, "certbot --nginx -d ongudai-camp.ru -d www.ongudai-camp.ru --non-interactive --agree-tos --email admin@ongudai-camp.ru --redirect 2>&1 || echo 'SSL setup skipped — run manually'", 60)
    print(out[:500] if out else "SSL skipped")

    print("\n8. Checking app...")
    rc, out, err = run(client, "docker compose -f /opt/ongudai-camp/docker-compose.prod.yml ps 2>&1", 15)
    print(out[:500] if out else err[:500])

    print("\n=== Done! ===")
    print(f"App: http://109.172.36.104:3000 (or https://ongudai-camp.ru after DNS + SSL)")

finally:
    client.close()
