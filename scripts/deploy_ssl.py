import paramiko, os

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("109.172.36.104", username="root", password=os.environ.get("BEGET_PASSWORD", ""), timeout=15)

def run(cmd, timeout=60):
    sys.stdout.write(f"  {cmd[:70]}... ")
    sys.stdout.flush()
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    last = (out or err).split("\n")[-3:]
    print(" | ".join(last)[:200])
    return exit_status, out, err

import sys

print("Checking DNS resolution from server:")
run("dig +short ongudai-camp.ru A 2>/dev/null || host ongudai-camp.ru 2>&1 | head -5")
run("dig +short www.ongudai-camp.ru A 2>/dev/null || host www.ongudai-camp.ru 2>&1 | head -5")

print("\nRunning certbot...")
rc, out, err = run(
    "certbot --nginx -d ongudai-camp.ru -d www.ongudai-camp.ru "
    "--non-interactive --agree-tos --email admin@ongudai-camp.ru --redirect 2>&1",
    120,
)
if "Congratulations" in out or "successfully" in out.lower():
    print("\nSSL успешно установлен! 🎉")
else:
    print(f"\nCertbot не смог: {err[:300]}")

print("\nФинальный тест:")
run("curl -s -o /dev/null -w '%{http_code}' https://ongudai-camp.ru/en/ 2>&1")
run("curl -s -o /dev/null -w '%{http_code}' http://ongudai-camp.ru/en/ 2>&1")

client.close()
