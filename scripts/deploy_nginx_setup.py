import paramiko, os

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("109.172.36.104", username="root", password=os.environ.get("BEGET_PASSWORD", ""), timeout=15)


def run(cmd, timeout=60):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    print(out[-300:] or err[-300:])
    return exit_status


print("Installing Nginx...", flush=True)
run("apt-get update -qq && apt-get install -y -qq nginx", 120)

print("\nConfiguring Nginx...", flush=True)
sftp = client.open_sftp()
with sftp.open("/etc/nginx/sites-available/ongudai-camp", "w") as f:
    f.write(
        """server {
    listen 80;
    server_name ongudai-camp.ru www.ongudai-camp.ru 109.172.36.104;
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
}
"""
    )
sftp.close()

run(
    "rm -f /etc/nginx/sites-enabled/default && ln -sf /etc/nginx/sites-available/ongudai-camp /etc/nginx/sites-enabled/"
)
rc = run("nginx -t 2>&1")
if rc == 0:
    run("systemctl reload nginx 2>&1")
    print("Nginx started!", flush=True)

print("\nTesting port 80...", flush=True)
run('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:80/en/', 15)
client.close()
