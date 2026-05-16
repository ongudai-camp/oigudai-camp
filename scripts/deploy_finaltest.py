import paramiko, os, sys

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("109.172.36.104", username="root", password=os.environ.get("BEGET_PASSWORD", ""), timeout=15)

def run(cmd, timeout=15):
    sys.stdout.write(f"  {cmd[:70]}... ")
    sys.stdout.flush()
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    print((out or err)[:200])
    return out

print("Testing SSL site:", flush=True)
run("curl -sI -L https://ongudai-camp.ru/ 2>&1 | head -5")
run('curl -s -o /dev/null -w "%{http_code}" -L https://ongudai-camp.ru/en 2>&1')
print()
run('curl -s -o /dev/null -w "%{http_code}" -L https://ongudai-camp.ru/ru 2>&1')
print()
run("curl -s -o /dev/null -w '%{http_code}' http://ongudai-camp.ru/ -L 2>&1")
client.close()
