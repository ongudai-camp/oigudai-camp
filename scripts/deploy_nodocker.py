import paramiko
import os
import sys
import time

HOST = "109.172.36.104"
USER = "root"
PASSWORD = os.environ.get("BEGET_PASSWORD", "")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Connecting...", flush=True)
client.connect(HOST, username=USER, password=PASSWORD, timeout=15)
print("Connected!", flush=True)

def run(cmd, timeout=300, show_out=True):
    sys.stdout.write(f"  {cmd[:70]}... ")
    sys.stdout.flush()
    t0 = time.time()
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    dt = time.time() - t0
    print(f"{dt:.0f}s exit={exit_status}")
    if exit_status != 0 and err:
        print(f"  ERR: {err[:300]}")
    if show_out and out:
        last = out[-300:].replace("\n", " | ").encode("ascii", "replace").decode()
        print(f"  OUT: {last}")
    return exit_status, out, err

# Pull latest code
print("\n[1/9] Pulling latest code...", flush=True)
run("cd /opt/ongudai-camp && git pull origin master", 30)

# Install Node.js
print("\n[2/9] Installing Node.js 20...", flush=True)
rc, out, err = run(
    'which node && node --version || '
    '(curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs)',
    180
)
run("node --version && npm --version", 15)

# Install PM2
print("\n[3/9] Installing PM2...", flush=True)
run("npm install -g pm2", 60)

# npm ci
print("\n[4/9] Installing deps...", flush=True)
run("cd /opt/ongudai-camp && npm ci", 180)

# Prisma generate
print("\n[5/9] Prisma generate...", flush=True)
run("cd /opt/ongudai-camp && npx prisma generate", 30)

# Build
print("\n[6/9] Building Next.js (this takes 2-5 min)...", flush=True)
run('cd /opt/ongudai-camp && NODE_OPTIONS="--max-old-space-size=512" npm run build', 900)

# Migrations
print("\n[7/9] DB migrations...", flush=True)
run("cd /opt/ongudai-camp && npx prisma migrate deploy", 60)

# Start with PM2
print("\n[8/9] Starting PM2...", flush=True)
run("cd /opt/ongudai-camp && pm2 delete ongudai-camp 2>/dev/null; PORT=3000 pm2 start npm --name ongudai-camp -- start", 30)
run("pm2 save", 15)
run("pm2 startup systemd -u root --hp /root 2>/dev/null", 15)

# Test
print("\n[9/9] Testing app...", flush=True)
time.sleep(3)
run('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>&1', 15)
run("pm2 list", 10)

print("\n=== DONE ===", flush=True)
client.close()
