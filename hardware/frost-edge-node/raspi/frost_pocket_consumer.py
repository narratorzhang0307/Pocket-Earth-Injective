#!/usr/bin/env python3
"""Frost Edge Node sidecar consumer (HW-01).

Polls the Pocket Earth `/api/frost-feed` endpoint (Frost Hardware Event
Contract v0.1.0), validates every event through the frozen frost-buddy
adapter, and hands the resulting transport-neutral actions to a sink.
Runs fully offline with `--file`.

Boundaries (frozen by the dual-line plan):
- never imports Pocket Earth app code or any Injective SDK,
- never reads wallets, private keys, or personal profiles,
- never logs the feed token,
- the cursor advances only after every action of an event succeeded.
"""

import argparse
import importlib.util
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

DEFAULT_ADAPTER = (
    Path(__file__).resolve().parents[2] / "frost-buddy" / "raspi" / "frost_pi_event_adapter.py"
)
BRIDGE_VERSION = "0.1.0"
CURSOR_HEADER = "X-Frost-Next-Cursor"

EVENT = "event"
EMPTY = "empty"
AUTH_ERROR = "auth-error"
FEED_ERROR = "error"


def load_adapter(path=None):
    """Import the frozen frost-buddy adapter from its file path (read-only reuse)."""
    path = Path(path or os.environ.get("FROST_ADAPTER_PATH") or DEFAULT_ADAPTER)
    if path.is_dir():
        path = path / "frost_pi_event_adapter.py"
    spec = importlib.util.spec_from_file_location("frost_pi_event_adapter", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load frozen adapter at {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class Config:
    def __init__(self, feed_url, token, cursor_file, interval=2.5, max_backoff=60.0, timeout=10.0):
        self.feed_url = feed_url
        self.token = token
        self.cursor_file = Path(cursor_file) if cursor_file else None
        self.interval = interval
        self.max_backoff = max_backoff
        self.timeout = timeout


def _log(cfg, message):
    if cfg and cfg.token:
        message = message.replace(cfg.token, "<token>")
    print(f"frost_pocket_consumer: {message}", file=sys.stderr)


def read_cursor(cfg):
    if not cfg.cursor_file or not cfg.cursor_file.exists():
        return ""
    return cfg.cursor_file.read_text(encoding="utf-8").strip()


def save_cursor(cfg, cursor):
    if not cfg.cursor_file or not cursor:
        return
    cfg.cursor_file.parent.mkdir(parents=True, exist_ok=True)
    tmp = cfg.cursor_file.with_suffix(cfg.cursor_file.suffix + ".tmp")
    tmp.write_text(cursor + "\n", encoding="utf-8")
    os.replace(tmp, cfg.cursor_file)


def _first_jsonl_line(body):
    for line in body.splitlines():
        if line.strip():
            return line
    return ""


def poll_once(cfg, sink, adapter):
    """One feed poll. Returns (status, detail). Cursor moves only on full success."""
    query = {"limit": "1"}
    cursor = read_cursor(cfg)
    if cursor:
        query["after"] = cursor
    url = cfg.feed_url + ("&" if "?" in cfg.feed_url else "?") + urllib.parse.urlencode(query)
    request = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {cfg.token}",
            "Accept": "application/x-ndjson",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=cfg.timeout) as response:
            if response.status == 204:
                return EMPTY, ""
            body = response.read().decode("utf-8", errors="replace")
            next_cursor = response.headers.get(CURSOR_HEADER, "")
    except urllib.error.HTTPError as exc:
        if exc.code == 401:
            return AUTH_ERROR, "feed rejected token (check FROST_FEED_TOKEN env)"
        return FEED_ERROR, f"feed http {exc.code}"
    except (urllib.error.URLError, OSError, TimeoutError) as exc:
        return FEED_ERROR, f"feed unreachable: {getattr(exc, 'reason', exc)}"

    line = _first_jsonl_line(body)
    if not line:
        return EMPTY, ""
    event = adapter.load_event(line)  # raises ValueError on contract violation
    actions = adapter.event_to_actions(event)
    sink.dispatch(actions)  # raises on device failure; cursor must not advance then
    save_cursor(cfg, next_cursor)
    return EVENT, event.get("kind", "")


def run_loop(cfg, sink, adapter, once=False):
    backoff = cfg.interval
    while True:
        try:
            status, detail = poll_once(cfg, sink, adapter)
        except ValueError as exc:
            _log(cfg, f"rejected event (cursor kept): {exc}")
            status, detail = FEED_ERROR, "contract violation"
        except Exception as exc:  # device/sink failure: keep cursor, retry
            _log(cfg, f"action dispatch failed (cursor kept): {exc}")
            status, detail = FEED_ERROR, "sink failure"

        if status == EVENT:
            _log(cfg, f"delivered {detail} event")
            backoff = cfg.interval
            if once:
                return 0
            time.sleep(cfg.interval)
        elif status == EMPTY:
            backoff = cfg.interval
            if once:
                return 0
            time.sleep(cfg.interval)
        else:
            if detail:
                _log(cfg, detail)
            if once:
                return 1
            time.sleep(backoff)
            backoff = min(backoff * 2, cfg.max_backoff)


def replay_files(paths, sink, adapter):
    """Offline mode: run JSONL fixtures through the exact same pipeline."""
    failures = 0
    for path in paths:
        with open(path, "r", encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                try:
                    actions = adapter.event_to_actions(adapter.load_event(line))
                    sink.dispatch(actions)
                except ValueError as exc:
                    failures += 1
                    print(f"frost_pocket_consumer: rejected fixture line: {exc}", file=sys.stderr)
    return 2 if failures else 0


def build_parser():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--feed-url", default=os.environ.get("FROST_FEED_URL", ""))
    parser.add_argument("--token-env", default="FROST_FEED_TOKEN",
                        help="name of the env var holding the Bearer token")
    parser.add_argument("--cursor-file",
                        default=os.environ.get("FROST_CURSOR_FILE",
                                               str(Path.home() / ".frost-pocket" / "cursor")))
    parser.add_argument("--interval", type=float, default=2.5)
    parser.add_argument("--max-backoff", type=float, default=60.0)
    parser.add_argument("--once", action="store_true", help="poll at most once, then exit")
    parser.add_argument("--file", action="append", default=[],
                        help="offline JSONL fixture(s); disables HTTP polling")
    parser.add_argument("--sink", choices=["emit-json", "pi"], default="emit-json")
    parser.add_argument("--adapter", default=None, help="path to the frozen adapter (override)")
    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    adapter = load_adapter(args.adapter)
    from frost_pocket_actions import make_sink  # local module, stdlib only
    sink = make_sink(args.sink, adapter)

    if args.file:
        return replay_files(args.file, sink, adapter)

    token = os.environ.get(args.token_env, "")
    if not args.feed_url or not token:
        print("frost_pocket_consumer: need --feed-url (or FROST_FEED_URL) and "
              f"a token in ${args.token_env}; or use --file for offline replay",
              file=sys.stderr)
        return 2
    cfg = Config(args.feed_url, token, args.cursor_file, args.interval, args.max_backoff)
    return run_loop(cfg, sink, adapter, once=args.once)


if __name__ == "__main__":
    raise SystemExit(main())
