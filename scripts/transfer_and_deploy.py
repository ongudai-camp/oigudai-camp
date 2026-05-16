import paramiko
import os
import sys
import time

HOST = "109.172.36.104"
USER = "root"
PASSWORD = os.environ.get("BEGET_PASSWORD", "")
LOCAL_IMAGE = "D:\\ongudai-camp.ru\\ongudai-camp\\ongudai-camp-image.tar"
REMOTE_IMAGE = "/opt/ongudai-camp/ongudai-camp-image.tar"

size_mb = os.path.getsize(LOCAL_IMAGE) / 1024 / 1024
print(f"Image size: {size_mb:.1f} MB")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Connecting...")
client.connect(HOST, username=USER, password=PASSWORD, timeout=15)
print("Connected!")

# Transfer
sftp = client.open_sftp()
def progress_callback(transferred, total):
    pct = transferred * 100 // total
    bar = "=" * (pct // 2) + ">" if pct < 100 else "=" * 50
    mb_done = transferred / 1024 / 1024
    mb_total = total / 1024 / 1024
    sys.stdout.write(f"\r  [{bar}] {pct}% ({mb_done:.0f}/{mb_total:.0f} MB)")
    sys.stdout.flush()

print("Uploading image to server (1-3 min)...")
t0 = time.time()
sftp.put(LOCAL_IMAGE, REMOTE_IMAGE, callback=progress_callback)
elapsed = time.time() - t0
sftp.close()
print(f"\nUploaded in {elapsed:.0f}s ({size_mb/elapsed*60:.0f} MB/min)")

def run(cmd, timeout=120):
    sys.stdout.write(f"  > {cmd[:60]}... ")
    sys.stdout.flush()
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    print("OK" if exit_status == 0 else f"FAIL (code {exit_status})")
    return exit_status, out, err

print("\nLoading Docker image...")
rc, out, err = run(f"docker load -i {REMOTE_IMAGE}", 120)
if out:
    print(f"  {out[:200]}")

print("\nTagging image...")
run("docker tag ongudai-camp:latest ghcr.io/ongudai-camp/oigudai-camp:latest", 10)

print("\nStopping PM2 and freeing port 3000...")
run("pm2 stop all && pm2 delete all", 10)
run("fuser -k 3000/tcp", 5)

print("\nStopping old containers...")
run("cd /opt/ongudai-camp && docker compose -f docker-compose.prod.yml down 2>&1", 30)

print("\nStarting new containers...")
rc, out, err = run("cd /opt/ongudai-camp && docker compose -f docker-compose.prod.yml up -d --remove-orphans 2>&1", 30)
print(f"  {out[:300] if out else err[:300]}")

print("\nContainer status...")
rc, out, err = run("docker compose -f /opt/ongudai-camp/docker-compose.prod.yml ps 2>&1", 15)
print(f"  {out[:500]}")

print("\nRunning DB migrations...")
rc, out, err = run("cd /opt/ongudai-camp && docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy 2>&1", 60)
print(f"  {out[:500] if out else err[:500]}")

print("\nTesting app...")
for retry in range(6):
    rc, out, err = run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/ 2>&1", 15)
    print(f"  Attempt {retry+1}: HTTP {out}")
    if out == "200":
        break
    time.sleep(5)

print("\n=== DONE ===")
client.close()
