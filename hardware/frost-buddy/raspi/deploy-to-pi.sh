#!/usr/bin/env bash
set -euo pipefail

PI_HOST="${1:-sunset-pi}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STAGE="$(ssh "$PI_HOST" 'mktemp -d /tmp/pocket-earth-edge.XXXXXX')"

cleanup() {
  ssh "$PI_HOST" "test -n '$STAGE' && test '$STAGE' != / && rm -rf -- '$STAGE'" >/dev/null 2>&1 || true
}
trap cleanup EXIT

FILES=(
  frost_pi_event_adapter.py
  frost_pi_feed_client.py
  frost_pi_device_driver.py
  frost_pi_device_driver_smoke.py
  pocket-earth-edge.service
)

for file in "${FILES[@]}"; do
  test -f "$SCRIPT_DIR/$file"
done

scp -q "${FILES[@]/#/$SCRIPT_DIR/}" "$PI_HOST:$STAGE/"

ssh "$PI_HOST" "set -euo pipefail
  sudo install -d -m 0755 -o pi -g pi /opt/pocket-earth-edge
  sudo install -m 0644 -o pi -g pi '$STAGE/frost_pi_event_adapter.py' /opt/pocket-earth-edge/
  sudo install -m 0644 -o pi -g pi '$STAGE/frost_pi_feed_client.py' /opt/pocket-earth-edge/
  sudo install -m 0644 -o pi -g pi '$STAGE/frost_pi_device_driver.py' /opt/pocket-earth-edge/
  sudo install -m 0644 -o pi -g pi '$STAGE/frost_pi_device_driver_smoke.py' /opt/pocket-earth-edge/
  sudo install -m 0644 '$STAGE/pocket-earth-edge.service' /etc/systemd/system/pocket-earth-edge.service
  cd /opt/pocket-earth-edge
  /usr/bin/python3 frost_pi_device_driver_smoke.py
  sudo systemctl daemon-reload
  if sudo test -f /etc/pocket-earth-edge.env; then
    sudo systemctl enable --now pocket-earth-edge.service
  else
    echo 'Pocket Earth code installed; /etc/pocket-earth-edge.env is required before service start.'
  fi
"

echo "Pocket Earth Edge code installed on $PI_HOST."
