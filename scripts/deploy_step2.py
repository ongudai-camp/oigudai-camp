import paramiko
import os
import secrets

HOST = "109.172.36.104"
USER = "root"
PASSWORD = os.environ.get("BEGET_PASSWORD", "")

identity_key = secrets.token_hex(32)

env_content = f'''DATABASE_URL="postgresql://postgres.wrlykrjyegmwpcnggysq:Omon_Ra7905277@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://wrlykrjyegmwpcnggysq.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybHlrcmp5ZWdtd3BjbmdneXNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3ODc1MzEsImV4cCI6MjA5NDM2MzUzMX0.vwxjfNcRhDCAMHJ3UAvDvQQdKSRpO-M35wr8Bc0olPs"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybHlrcmp5ZWdtd3BjbmdneXNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc4NzUzMSwiZXhwIjoyMDk0MzYzNTMxfQ.nXaLpqjzfsRlReWV0CSnZrRsxXYACmXozHBrHvEMfGI"
AUTH_SECRET="a4154c1c953b4ec501d653896ac8bfc61f20c3aeb082093027c221753fc3b343"
NEXTAUTH_URL="https://ongudai-camp.ru"
IDENTITY_ENCRYPTION_KEY="{identity_key}"
'''

print(f"Identity key: {identity_key[:16]}...")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=15)

sftp = client.open_sftp()
with sftp.open("/opt/ongudai-camp/.env", "w") as f:
    f.write(env_content)
sftp.close()
print(".env written")

stdin, stdout, stderr = client.exec_command("cat /opt/ongudai-camp/.env", timeout=10)
print(stdout.read().decode().strip())
client.close()
