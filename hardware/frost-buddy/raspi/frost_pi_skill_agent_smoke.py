#!/usr/bin/env python3
"""Offline smoke checks for frost_pi_skill_agent.py."""

import json
import re
import sys

import frost_pi_skill_agent as agent

passed = 0


def check(condition, message):
    global passed
    if not condition:
        print("FAIL:", message)
        sys.exit(1)
    passed += 1


names = [skill["name"] for skill in agent.SKILLS]
check(len(names) == len(set(names)), "skill names must be unique")
check({"next_track", "pause", "music_now_playing", "chain_dispatch"} <= set(names), "core skills must exist")

for text, expected in {
    "换一首吧": "next_track",
    "别放了": "pause",
    "现在播什么": "music_now_playing",
    "播报 Injective 链上见闻": "chain_dispatch",
    "你能做什么": "help",
}.items():
    got = agent.decide(text)["skill"]
    check(got == expected, f"{text} should route to {expected}, got {got}")

fake_pause = lambda system, prompt: '{"skill":"pause","args":{},"reply":"好"}'
check(agent.decide("随便停一下", brain_fn=fake_pause)["skill"] == "pause", "valid brain JSON should pass")

fake_hallucination = lambda system, prompt: '{"skill":"send_private_key","args":{}}'
check(agent.decide("换歌", brain_fn=fake_hallucination)["skill"] == "next_track", "hallucinated skill should fall back to keywords")
check(agent.validate_decision("not json")["skill"] == "none", "non-dict decision should be none")

command = agent.route("下一首")["command"]
check(command == "下一首", "next_track should produce canonical command")
check(re.search(r"下一首|next", command, re.I), "canonical command should match simple daemon route")

music = agent.route("现在播什么", context={"track": {"title": "Midnight City", "artist": "Frost Radio", "city": "布宜诺斯艾利斯"}})
check(music["type"] == "event", "now playing should emit an event")
check(music["event"]["kind"] == "music_now_playing", "music event kind")
check(music["event"]["track"]["city"] == "布宜诺斯艾利斯", "music event carries public city")

chain = agent.route("播报链上见闻")
check(chain["type"] == "event", "chain dispatch should emit an event")
check(chain["event"]["kind"] == "chain_dispatch", "chain event kind")
check(chain["event"]["agentIds"] == ["43", "44", "45", "46", "47"], "chain event fleet ids")
check("Injective 链上" in chain["event"]["speak"], "chain event speaks Injective")

json_line = agent.to_json_line(chain)
check(json_line.endswith("\n"), "event output should be JSONL")
check(json.loads(json_line)["kind"] == "chain_dispatch", "JSONL round trip")

posted = []
emitted = []
check(agent.apply("声音小一点", post_command_fn=posted.append, emit_event_fn=emitted.append), "apply command should return true")
check(posted == ["声音小一点"] and not emitted, "command apply should post only command")

posted.clear()
emitted.clear()
check(agent.apply("播报 Injective 链上见闻", post_command_fn=posted.append, emit_event_fn=emitted.append), "apply event should return true")
check(not posted and emitted and emitted[0]["kind"] == "chain_dispatch", "event apply should emit only event")

check(not agent.apply("今天心情不错", post_command_fn=posted.append, emit_event_fn=emitted.append), "unknown request should return false")

for event in [music["event"], chain["event"]]:
    serialized = json.dumps(event, ensure_ascii=False)
    check(not re.search(agent.SECRET_RE, serialized), "events must not contain secrets or profile hashes")

raised = False
try:
    agent.create_chain_event({"body": "bad 0x" + "a" * 64})
except ValueError:
    raised = True
check(raised, "secret-like hashes should be rejected from hardware events")

print(f"frost_pi_skill_agent smoke passed. ({passed} checks)")
