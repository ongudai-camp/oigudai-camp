import paramiko, os

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("109.172.36.104", username="root", password=os.environ.get("BEGET_PASSWORD", ""), timeout=15)

def run(cmd, timeout=15):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    print(out[:500] or err[:500])

print("Services on port 80/443:")
run("ss -tlnp | grep -E ':(80|443|3000) '")

print("\nInstalled web servers:")
run("dpkg -l | grep -E 'nginx|apache|caddy|traefik|haproxy' 2>/dev/null; which nginx apache2 httpd caddy 2>/dev/null || echo 'none found'")

print("\nUFW/firewall:")
run("ufw status 2>/dev/null || echo 'ufw not active'")

print("\nPort 80 curl local:")
run("curl -sI http://127.0.0.1:80/ 2>&1 | head -5 || echo 'nothing on 80'")

print("\nPM2 status:")
run("pm2 list 2>&1")

print("\nMemory:")
run("free -h")

client.close()
