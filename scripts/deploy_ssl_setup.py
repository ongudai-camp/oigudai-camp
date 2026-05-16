import paramiko, os

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("109.172.36.104", username="root", password=os.environ.get("BEGET_PASSWORD", ""), timeout=15)

def run(cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    print(out[:500] or err[:500])

print("Check Nginx response headers:")
run("curl -sI http://127.0.0.1:80/en 2>&1 | head -10")

print("\nCheck app port 3000 headers:")
run("curl -sI http://127.0.0.1:3000/en 2>&1 | head -10")

print("\nInstall certbot for SSL...")
run("apt-get install -y -qq certbot python3-certbot-nginx 2>&1 | tail -3")

client.close()
