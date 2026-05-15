import paramiko
import os

HOST = "109.172.36.104"
USER = "root"
PASSWORD = os.environ.get("BEGET_PASSWORD", "")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=15)

def run(cmd, timeout=120):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    return exit_status, out, err

print("1. Adding swap...")
rc, out, err = run("swapon --show | grep /swapfile || (fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile)", 30)
print(out[:200] or err[:200])

print("\n2. Free memory:")
rc, out, err = run("free -h")
print(out)

print("\n3. Building Docker image as ghcr.io/ongudai-camp/oigudai-camp:latest...")
rc, out, err = run("cd /opt/ongudai-camp && docker build -t ghcr.io/ongudai-camp/oigudai-camp:latest . 2>&1", 600)
print(out[-500:] if out else err[-500:])

if rc == 0:
    print("\n4. Starting with docker compose...")
    rc, out, err = run("cd /opt/ongudai-camp && docker compose -f docker-compose.prod.yml up -d --remove-orphans 2>&1", 60)
    print(out[:300] if out else err[:300])

    print("\n5. DB migrations...")
    rc, out, err = run("cd /opt/ongudai-camp && docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy 2>&1", 60)
    print(out[:300] if out else err[:300])

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
    sftp = client.open_sftp()
    with sftp.open("/etc/nginx/sites-available/ongudai-camp.ru", "w") as f:
        f.write(nginx_conf)
    sftp.close()
    rc, out, err = run("ln -sf /etc/nginx/sites-available/ongudai-camp.ru /etc/nginx/sites-enabled/ 2>&1", 10)
    rc, out, err = run("rm -f /etc/nginx/sites-enabled/default && nginx -t && systemctl reload nginx 2>&1", 15)
    print(out[:300] if out else err[:300])

    print("\n7. App status...")
    rc, out, err = run("docker compose -f /opt/ongudai-camp/docker-compose.prod.yml ps 2>&1", 15)
    print(out[:500])

else:
    print(f"\nBuild failed! Exit code: {rc}")

client.close()
print("\n=== Done ===")
