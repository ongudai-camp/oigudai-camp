import paramiko, os, sys

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("109.172.36.104", username="root", password=os.environ.get("BEGET_PASSWORD", ""), timeout=15)

def run(cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    return (out or err).split("\n")[-3:]

print("DNS check:", flush=True)
for domain in ["ongudai-camp.ru", "www.ongudai-camp.ru"]:
    out = run(f"dig +short {domain} A @8.8.8.8 2>/dev/null")
    print(f"  {domain} -> {out}")
    out = run(f"dig +short {domain} A @ns1.beget.com 2>/dev/null")
    print(f"  {domain} (beget ns) -> {out}")

client.close()
