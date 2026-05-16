import paramiko, os

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("109.172.36.104", username="root", password=os.environ.get("BEGET_PASSWORD", ""), timeout=15)

def run(cmd, timeout=15):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    print(out[:500] or err[:500])

print("Nginx test:")
run("nginx -t 2>&1")

print("\nChecking nginx site config:")
run("ls -la /etc/nginx/sites-enabled/")

print("\nTrying domain curl:")
run("curl -s -o /dev/null -w '%{http_code}' http://ongudai-camp.ru/ 2>&1 || echo 'DNS not resolving'")

print("\nDirect IP:")
run("curl -s -o /dev/null -w '%{http_code}' http://109.172.36.104/ 2>&1")

client.close()
