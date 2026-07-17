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
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

if [[ "$DOMAIN" == *"_"* ]]; then
  echo "拒绝部署：浏览器 HTTPS 域名不得使用下划线：$DOMAIN" >&2
  exit 1
fi

if [[ "$APP_NAME" != "pocket-earth-injective" || "$API_PORT" != "3018" ]]; then
  echo "拒绝部署：决赛站点必须使用独立进程 pocket-earth-injective 与端口 3018" >&2
  exit 1
fi

chmod 600 "$PEM"

cd "$ROOT"
echo "==> 本机构建比赛站点 ..."
npm run build

echo "==> 组装最小生产运行包 ..."
mkdir -p \
  "$STAGE/hardware/frost-buddy" \
  "$STAGE/frost-agent/provider-compat" \
  "$STAGE/src/app/lib/chronicle" \
  "$STAGE/INJECTIVE-INTEGRATION" \
  "$STAGE/vendor/injective-agent-sdk"
cp -R dist "$STAGE/dist"
cp server.mjs injective-service.mjs frost-feed-service.mjs "$STAGE/"
cp hardware/frost-buddy/frost-hardware-bridge.mjs "$STAGE/hardware/frost-buddy/"
cp frost-agent/provider-compat/runtime.mjs "$STAGE/frost-agent/provider-compat/"
cp -R knowledge "$STAGE/knowledge"
cp src/app/lib/chronicle/kernel.mjs "$STAGE/src/app/lib/chronicle/"
cp \
  INJECTIVE-INTEGRATION/chain-proof-data.mjs \
  INJECTIVE-INTEGRATION/public-earth-data.mjs \
  INJECTIVE-INTEGRATION/public-earth-manifest.json \
  INJECTIVE-INTEGRATION/public-earth-deployment.json \
  INJECTIVE-INTEGRATION/knowledge-edition-proof.json \
  "$STAGE/INJECTIVE-INTEGRATION/"
cp deploy/online/injective/package.runtime.json "$STAGE/package.json"
cp deploy/online/injective/ecosystem.config.cjs "$STAGE/ecosystem.config.cjs"
cp deploy/online/injective/sdk-package.runtime.json "$STAGE/vendor/injective-agent-sdk/package.json"
cp -R INJECTIVE-INTEGRATION/_research/repos/injective-agent-sdk/packages/sdk/dist "$STAGE/vendor/injective-agent-sdk/dist"

"${SSH[@]}" "$REMOTE" "test -f $APP_DIR/.env"
remote_port="$("${SSH[@]}" "$REMOTE" "sed -n 's/^API_PORT=//p' $APP_DIR/.env | tail -n 1")"
if [[ "$remote_port" != "$API_PORT" ]]; then
  echo "拒绝部署：$APP_DIR/.env 必须包含 API_PORT=$API_PORT" >&2
  exit 1
fi

echo "==> 上传独立运行包（保留 .env / node_modules / var）..."
"${SSH[@]}" "$REMOTE" "mkdir -p $APP_DIR"
rsync -az --delete --no-owner --no-group \
  --exclude='.env' \
  --exclude='node_modules/' \
  --exclude='var/' \
  -e "ssh -i $PEM -o StrictHostKeyChecking=no" \
  "$STAGE/" "$REMOTE:$APP_DIR/"

echo "==> 安装服务器最小依赖并重载 Web + Daily Knowledge Worker ..."
"${SSH[@]}" "$REMOTE" "cd $APP_DIR && npm install --omit=dev --ignore-scripts --no-audit --no-fund && pm2 startOrReload ecosystem.config.cjs --update-env && pm2 save"

"${SSH[@]}" "$REMOTE" "curl -fsS http://127.0.0.1:$API_PORT/healthz"
"${SSH[@]}" "$REMOTE" "pm2 describe pocket-earth-injective-knowledge >/dev/null"

echo "独立 Web 与 Daily Knowledge Worker 已更新；nginx 与证书仍需按 deploy/online/injective/README.md 单独验收。"
