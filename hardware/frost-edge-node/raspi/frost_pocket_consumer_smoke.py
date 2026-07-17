#!/usr/bin/env python3
"""Offline smoke for the Frost Edge Node sidecar (HW-01). Stdlib only.

Covers:
1. fixture replay produces exactly the frozen adapter's action sequence;
2. contract violations (unknown field / unknown kind) are rejected, no actions;
3. mock HTTP feed: Bearer token sent, cursor persisted only after success,
   `after` param echoed back, 204 handled, 401 reported;
4. sink failure keeps the cursor;
5. the token never appears in logs.
"""

import io
import json
import sys
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import frost_pocket_consumer as consumer  # noqa: E402
from frost_pocket_actions import EmitJsonSink  # noqa: E402

FIXTURE = HERE.parent / "fixtures" / "demo-events.jsonl"
TOKEN = "smoke-secret-token-abc123"

CHECKS = []


def check(name, condition, detail=""):
    CHECKS.append((name, bool(condition), detail))
    print(f"{'PASS' if condition else 'FAIL'}  {name}" + (f"  [{detail}]" if detail and not condition else ""))


def test_fixture_replay(adapter):
    out = io.StringIO()
    code = consumer.replay_files([str(FIXTURE)], EmitJsonSink(adapter, out), adapter)
    lines = [json.loads(l) for l in out.getvalue().splitlines() if l.strip()]
    expected = []
    for raw in FIXTURE.read_text(encoding="utf-8").splitlines():
        if raw.strip():
            expected.extend(adapter.event_to_actions(adapter.load_event(raw)))
    check("replay exit code 0", code == 0)
    check("replay action count", len(lines) == len(expected) == 6, f"{len(lines)} vs {len(expected)}")
    check("replay actions identical to frozen adapter", lines == expected)
    types = [a["type"] for a in lines]
    check("replay action order", types == ["state", "tts", "display"] * 2, str(types))


def test_reject_bad_events(adapter):
    bad = [
        json.dumps({"version": "0.1.0", "kind": "chain_dispatch", "eventId": "x1"}),
        json.dumps({"version": "0.1.0", "kind": "shell_exec", "title": "nope"}),
    ]
    with tempfile.NamedTemporaryFile("w", suffix=".jsonl", delete=False, encoding="utf-8") as fh:
        fh.write("\n".join(bad) + "\n")
        bad_path = fh.name
    out = io.StringIO()
    code = consumer.replay_files([bad_path], EmitJsonSink(adapter, out), adapter)
    check("bad events exit code 2", code == 2)
    check("bad events emit no actions", out.getvalue() == "")


class _FeedHandler(BaseHTTPRequestHandler):
    event_line = ""
    seen = []

    def do_GET(self):
        parsed = urlparse(self.path)
        query = parse_qs(parsed.query)
        auth = self.headers.get("Authorization", "")
        type(self).seen.append({"after": query.get("after", [""])[0], "auth": auth})
        if auth != f"Bearer {TOKEN}":
            self.send_response(401)
            self.end_headers()
            return
        if query.get("after", [""])[0] == "cursor-1":
            self.send_response(204)
            self.end_headers()
            return
        body = self.event_line.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/x-ndjson")
        self.send_header("X-Frost-Next-Cursor", "cursor-1")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):  # keep smoke output clean
        pass


class _FailingSink:
    def dispatch(self, actions):
        raise RuntimeError("simulated device failure")


def test_http_feed(adapter):
    _FeedHandler.event_line = FIXTURE.read_text(encoding="utf-8").splitlines()[1]  # chain_dispatch
    _FeedHandler.seen = []
    server = HTTPServer(("127.0.0.1", 0), _FeedHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    url = f"http://127.0.0.1:{server.server_port}/api/frost-feed"
    try:
        with tempfile.TemporaryDirectory() as tmp:
            cursor_file = Path(tmp) / "cursor"
            cfg = consumer.Config(url, TOKEN, cursor_file, interval=0.05, timeout=5)

            # 1) sink failure: no cursor movement
            status, _ = None, None
            try:
                consumer.poll_once(cfg, _FailingSink(), adapter)
            except Exception:
                pass
            check("cursor kept on sink failure", not cursor_file.exists())

            # 2) success: actions emitted, cursor saved from response header
            out = io.StringIO()
            status, kind = consumer.poll_once(cfg, EmitJsonSink(adapter, out), adapter)
            check("live poll delivers event", status == consumer.EVENT and kind == "chain_dispatch")
            check("cursor persisted after success", cursor_file.read_text(encoding="utf-8").strip() == "cursor-1")
            check("live actions emitted", len(out.getvalue().splitlines()) == 3)

            # 3) next poll sends after=cursor-1 and receives 204
            status, _ = consumer.poll_once(cfg, EmitJsonSink(adapter, io.StringIO()), adapter)
            check("after-cursor poll returns empty", status == consumer.EMPTY)
            check("after param echoed", _FeedHandler.seen[-1]["after"] == "cursor-1")

            # 4) wrong token -> auth error, cursor untouched
            bad_cfg = consumer.Config(url, "wrong-token", cursor_file, timeout=5)
            status, detail = consumer.poll_once(bad_cfg, EmitJsonSink(adapter, io.StringIO()), adapter)
            check("401 reported as auth error", status == consumer.AUTH_ERROR)
            check("cursor unchanged after 401", cursor_file.read_text(encoding="utf-8").strip() == "cursor-1")

            # 5) token never logged
            captured = io.StringIO()
            real_stderr, sys.stderr = sys.stderr, captured
            try:
                consumer._log(cfg, f"pretend dump: Bearer {TOKEN}")
            finally:
                sys.stderr = real_stderr
            check("token redacted in logs", TOKEN not in captured.getvalue())
    finally:
        server.shutdown()


def main():
    adapter = consumer.load_adapter()
    test_fixture_replay(adapter)
    test_reject_bad_events(adapter)
    test_http_feed(adapter)
    failed = [name for name, ok, _ in CHECKS if not ok]
    print(f"\n{len(CHECKS) - len(failed)}/{len(CHECKS)} checks passed")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
