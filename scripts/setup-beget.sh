#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────
# Ongudai Camp — Beget VPS setup script
# Запускать один раз на свежем сервере
# ─────────────────────────────────────────────────

REPO="git@github.com:ongudai-camp/oigudai-camp.git"
APP_DIR="/opt/ongudai-camp"
DOMAIN="ongudai-camp.ru"

echo "=== 1. System packages ==="
apt-get update
apt-get install -y --no-install-recommends \
  nginx \
  certbot \
  python3-certbot-nginx \
  git \
  curl \
  docker.io \
  docker-compose-v2

systemctl enable --now docker

echo "=== 2. Clone repo ==="
mkdir -p "$APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull
else
  git clone "$REPO" "$APP_DIR"
fi

echo "=== 3. Create .env ==="
if [ ! -f "$APP_DIR/.env" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  echo ">>> Fill $APP_DIR/.env with real values, then re-run this script <<<"
  exit 1
fi

echo "=== 4. Pull Docker image ==="
cd "$APP_DIR"
git_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "latest")
TAG="$git_tag" docker compose -f docker-compose.prod.yml pull

echo "=== 5. Start app ==="
TAG="$git_tag" docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo "=== 6. Apply DB migrations ==="
docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

echo "=== 7. Nginx reverse proxy ==="
cat > /etc/nginx/sites-available/"$DOMAIN" <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/"$DOMAIN" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "=== 8. SSL (Let's Encrypt) ==="
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN --redirect || echo "Manual SSL setup needed: certbot --nginx -d $DOMAIN -d www.$DOMAIN"

echo ""
echo "=== Done! ==="
echo "App: https://$DOMAIN"
echo "Logs: docker compose -f $APP_DIR/docker-compose.prod.yml logs -f"
