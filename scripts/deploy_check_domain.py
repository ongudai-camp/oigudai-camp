import paramiko, os

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("109.172.36.104", username="root", password=os.environ.get("BEGET_PASSWORD", ""), timeout=15)

def run(cmd, timeout=15):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    print(out[:800] or err[:800])

print("Check what's actually serving on ongudai-camp.ru:")
run("curl -sI https://ongudai-camp.ru/ 2>&1 | head -15")
print("---")
run("curl -sI http://ongudai-camp.ru/ 2>&1 | head -15")
print("---")
print("App response on port 3000 (en):")
run("curl -s http://127.0.0.1:3000/en/ 2>&1 | head -5")

client.close()
