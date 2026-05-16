import paramiko, os, sys

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

print("Certbot for main domain only:", flush=True)
rc, out, err = run(
    "certbot --nginx -d ongudai-camp.ru --non-interactive --agree-tos --email admin@ongudai-camp.ru --redirect 2>&1",
    120,
)
if rc == 0:
    print("SSL installed!", flush=True)
else:
    print(f"Failed: {err[:300]}", flush=True)

print(flush=True)
run('curl -s -o /dev/null -w "%{http_code}" https://ongudai-camp.ru/en/ 2>&1')
client.close()
