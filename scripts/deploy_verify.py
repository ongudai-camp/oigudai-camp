import paramiko
import os

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(
    "109.172.36.104",
    username="root",
    password=os.environ.get("BEGET_PASSWORD", ""),
    timeout=15,
)


def run(cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    last = (out or err).split("\n")[-3:]
    print(" | ".join(last)[:200])
    return exit_status, out, err


print("Marking migration as resolved...")
run(
    "cd /opt/ongudai-camp && npx prisma migrate resolve --applied 20260515000000_add_user_identity_fields 2>&1",
    30,
)

print()
for path in ["/", "/en", "/ru", "/api/user/profile"]:
    code, out, err = run(
        f'curl -s -o /dev/null -w "%{{http_code}}" http://127.0.0.1:3000{path} 2>&1',
        10,
    )
    print(f"  {path} -> {out}", flush=True)

print()
run("pm2 show ongudai-camp 2>&1", 10)

client.close()
