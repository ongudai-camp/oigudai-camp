import paramiko, os, time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(
    "109.172.36.104",
    username="root",
    password=os.environ.get("BEGET_PASSWORD", ""),
    timeout=15,
)


def run(cmd, timeout=15):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    print((out or err)[:500])


print("PM2 status:")
run("pm2 show ongudai-camp 2>&1 | head -20")

print("\nTesting app:")
time.sleep(2)
run('curl -s -o /dev/null -w "%{http_code}" -L https://ongudai-camp.ru/en/ 2>&1')

print("\nRecent logs:")
run("pm2 logs ongudai-camp --lines 5 --nostream 2>&1")

client.close()
