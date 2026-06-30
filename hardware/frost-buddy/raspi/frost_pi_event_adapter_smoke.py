#!/usr/bin/env python3
"""Offline smoke checks for frost_pi_event_adapter.py."""

import json
import subprocess
import sys
from pathlib import Path

import frost_pi_event_adapter as adapter

passed = 0


def check(condition, message):
    global passed
    if not condition:
        print("FAIL:", message)
        sys.exit(1)
    passed += 1


def load_sample(name):
    path = Path(__file__).resolve().parents[1] / "examples" / name
    return json.loads(path.read_text(encoding="utf-8"))


music_sample = load_sample("music-now-playing.sample.json")
chain_sample = load_sample("chain-dispatch.sample.json")

music = {
    "version": "0.1.0",
    "kind": "music_now_playing",
    "source": "music-agent",
    "state": "busy",
    "priority": "normal",
    "title": music_sample["track"]["title"],
    "body": f"{music_sample['track']['artist']} · {music_sample['city']['nameZh']}",
    "speak": f"Frost 正在播放 {music_sample['track']['title']}，来自 {music_sample['city']['nameZh']}。",
    "track": {
        "title": music_sample["track"]["title"],
        "artist": music_sample["track"]["artist"],
        "city": music_sample["city"]["nameZh"],
    },
    "createdAt": music_sample["createdAt"],
}
chain = {
    "version": "0.1.0",
    "kind": "chain_dispatch",
    "source": "injective-public-plaza",
    "state": "attention",
    "priority": "urgent",
    "title": "Injective chain dispatch",
    "body": chain_sample["body"],
    "speak": "Frost 在 Injective 链上遇见了 5 个 Pocket Earth agent。",
    "agentIds": [str(item) for item in chain_sample["agentIds"]],
    "scanUrl": chain_sample["scanUrl"],
    "createdAt": chain_sample["createdAt"],
}

for event in [music, chain]:
    parsed = adapter.load_event(json.dumps(event, ensure_ascii=False))
    actions = adapter.event_to_actions(parsed)
    types = [item["type"] for item in actions]
    check(types == ["state", "tts", "display"], f"{event['kind']} should emit state/tts/display actions")
    for action in actions:
        line = adapter.action_to_json_line(action)
        check(line.endswith("\n"), "actions should serialize as JSONL")
        check(json.loads(line)["version"] == adapter.ACTION_VERSION, "action JSONL version should round trip")

music_actions = adapter.event_to_actions(music)
music_display = [item for item in music_actions if item["type"] == "display"][0]
check(music_display["sourceKind"] == "music_now_playing", "music display keeps source kind")
check("Frost Radio" in music_display.get("subtitle", ""), "music display includes artist")

chain_actions = adapter.event_to_actions(chain)
chain_state = [item for item in chain_actions if item["type"] == "state"][0]
chain_tts = [item for item in chain_actions if item["type"] == "tts"][0]
chain_display = [item for item in chain_actions if item["type"] == "display"][0]
check(chain_state["state"] == "attention", "chain dispatch should set attention state")
check(chain_tts["priority"] == "urgent", "chain dispatch should keep urgent priority")
check(chain_display["agentIds"] == ["43", "44", "45", "46", "47"], "chain display keeps fleet ids")
check("blockscout.injective.network" in chain_display["scanUrl"], "chain display keeps public explorer URL")

raised = False
try:
    bad = dict(chain)
    bad["profileHash"] = "0x" + "a" * 64
    adapter.load_event(json.dumps(bad))
except ValueError:
    raised = True
check(raised, "unsupported key plus profile hash should be rejected")

raised = False
try:
    bad = dict(chain)
    bad["body"] = "leak 0x" + "b" * 64
    adapter.load_event(json.dumps(bad))
except ValueError:
    raised = True
check(raised, "bytes32-looking payload should be rejected")

proc = subprocess.run(
    [sys.executable, str(Path(__file__).with_name("frost_pi_event_adapter.py"))],
    input=json.dumps(chain, ensure_ascii=False) + "\n",
    text=True,
    capture_output=True,
    check=True,
)
cli_actions = [json.loads(line) for line in proc.stdout.splitlines()]
check([item["type"] for item in cli_actions] == ["state", "tts", "display"], "CLI should emit three action lines")
check(not proc.stderr.strip(), "CLI should not write stderr on valid input")

print(f"frost_pi_event_adapter smoke passed. ({passed} checks)")
