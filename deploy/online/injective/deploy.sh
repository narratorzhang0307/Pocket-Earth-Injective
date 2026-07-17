#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-pocketearth-injective.throughtheglass.art}"
APP_DIR="${APP_DIR:-~/pocket-earth-injective}"
APP_NAME="${APP_NAME:-pocket-earth-injective}"
API_PORT="${API_PORT:-3018}"
PEM="${PEM:?请设置 PEM=部署私钥路径}"
REMOTE="${REMOTE:?请设置 REMOTE=root@服务器IP或SSH别名}"
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
SSH=(ssh -i "$PEM" -o StrictHostKeyChecking=no)

if [[ "$DOMAIN" == *"_"* ]]; then
  echo "拒绝部署：浏览器 HTTPS 域名不得使用下划线：$DOMAIN" >&2
  exit 1
fi

if [[ "$APP_NAME" != "pocket-earth-injective" || "$API_PORT" != "3018" ]]; then
  echo "拒绝部署：决赛站点必须使用独立进程 pocket-earth-injective 与端口 3018" >&2
  exit 1
fi

chmod 600 "$PEM"

"${SSH[@]}" "$REMOTE" "test -f $APP_DIR/.env"
remote_port="$("${SSH[@]}" "$REMOTE" "sed -n 's/^API_PORT=//p' $APP_DIR/.env | tail -n 1")"
if [[ "$remote_port" != "$API_PORT" ]]; then
  echo "拒绝部署：$APP_DIR/.env 必须包含 API_PORT=$API_PORT" >&2
  exit 1
fi

PEM="$PEM" \
REMOTE="$REMOTE" \
APP_DIR="$APP_DIR" \
APP_NAME="$APP_NAME" \
"$ROOT/deploy/online/deploy.sh"

"${SSH[@]}" "$REMOTE" "curl -fsS http://127.0.0.1:$API_PORT/healthz"

echo "独立应用已更新；nginx 与证书仍需按 deploy/online/injective/README.md 单独验收。"
