import paramiko
import os
import sys
import time

HOST = "109.172.36.104"
USER = "root"
PASSWORD = os.environ.get("BEGET_PASSWORD", "")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=15)

def run(cmd, timeout=300):
    sys.stdout.write(f"  {cmd[:70]}... ")
    sys.stdout.flush()
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    lines = [l for l in out.split("\n") if l.strip()]
    last = lines[-5:] if lines else ["(no output)"]
    summary = " | ".join(last)[:200]
    safe = summary.encode("ascii", errors="replace").decode()
    print(safe)
    if exit_status != 0:
        print(f"  FAILED rc={exit_status}: {err[:200]}")
    return exit_status, out, err

print("[6/9] Building Next.js...", flush=True)
rc, out, err = run("cd /opt/ongudai-camp && NODE_OPTIONS='--max-old-space-size=512' npm run build", 900)
if rc != 0:
    print("BUILD FAILED - stopping", flush=True)
    client.close()
    sys.exit(1)

print("\n[7/9] DB migrations...", flush=True)
run("cd /opt/ongudai-camp && npx prisma migrate deploy", 60)

print("\n[8/9] Starting PM2...", flush=True)
run("cd /opt/ongudai-camp && pm2 delete ongudai-camp 2>/dev/null; PORT=3000 pm2 start npm --name ongudai-camp -- start", 30)
run("pm2 save", 15)

print("\n[9/9] Testing...", flush=True)
time.sleep(5)
run('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/', 15)
run("pm2 list", 10)

print("\n=== DONE ===", flush=True)
client.close()
