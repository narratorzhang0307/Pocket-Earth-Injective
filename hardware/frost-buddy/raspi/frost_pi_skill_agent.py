#!/usr/bin/env python3
"""Pocket Earth Frost Buddy Raspberry Pi skill router.

This is a small, standalone Pi-side companion to frost-hardware-bridge.mjs.
It borrows the safe shape of the Sunset Radio Pi skill-agent pattern:
understand a loose voice request, validate it against a tiny skill registry,
then emit either a canonical music command or a public hardware event.

It does not import the Sunset Radio daemon and it never signs transactions.
"""

import json
import re
import sys

BRIDGE_VERSION = "0.1.0"
REGISTRY_URL = "https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e"

SECRET_RE = re.compile(
    r"0x[0-9a-f]{64}|INJ_PRIVATE_KEY|PRIVATE_KEY|DASHSCOPE_API_KEY|PINATA_JWT",
    re.I,
)

SAFE_EVENT_KEYS = {
    "version",
    "kind",
    "source",
    "state",
    "priority",
    "title",
    "body",
    "speak",
    "agentIds",
    "scanUrl",
    "track",
    "createdAt",
}


def _text(value, limit=180):
    return re.sub(r"\s+", " ", str(value or "")).strip()[:limit]


def _assert_public_event(event):
    extra = set(event) - SAFE_EVENT_KEYS
    if extra:
        raise ValueError(f"unsupported hardware event keys: {sorted(extra)}")
    if SECRET_RE.search(json.dumps(event, ensure_ascii=False)):
        raise ValueError("hardware event must not contain secrets or profile hashes")


def _const(command):
    return lambda args=None: command


SKILLS = [
    {
        "name": "next_track",
        "desc": "skip to the next music-agent track",
        "patterns": [r"下一首|换一首|换歌|跳过|skip|next"],
        "to_command": _const("下一首"),
    },
    {
        "name": "prev_track",
        "desc": "go back to the previous track",
        "patterns": [r"上一首|回上一首|刚才那首|previous|prev|back"],
        "to_command": _const("上一首"),
    },
    {
        "name": "pause",
        "desc": "pause or stop playback",
        "patterns": [r"暂停|停一下|别放了|别播了|安静|pause|stop"],
        "to_command": _const("暂停"),
    },
    {
        "name": "replay",
        "desc": "replay the current track",
        "patterns": [r"重播|再放一遍|再听一遍|从头|repeat|replay"],
        "to_command": _const("重播"),
    },
    {
        "name": "volume_up",
        "desc": "turn hardware audio up",
        "patterns": [r"太小声|大声点|大一点|听不清|听不见|louder|volume\s*up"],
        "to_command": _const("声音大一点"),
    },
    {
        "name": "volume_down",
        "desc": "turn hardware audio down",
        "patterns": [r"太吵|太大声|小声点|小一点|轻一点|quieter|softer|volume\s*down"],
        "to_command": _const("声音小一点"),
    },
    {
        "name": "music_now_playing",
        "desc": "speak the current music-agent now-playing line",
        "patterns": [r"现在.*(播|放|听)|播什么|哪首|now playing|current track"],
        "event": "music_now_playing",
    },
    {
        "name": "chain_dispatch",
        "desc": "speak public Injective chain sights from Pocket Earth public-plaza",
        "patterns": [r"链上见闻|链上.*(播报|报告|消息)|Injective|public[- ]?plaza|agent.*广场"],
        "event": "chain_dispatch",
    },
    {
        "name": "help",
        "desc": "list the hardware Frost Buddy abilities",
        "patterns": [r"帮助|怎么用|能做什么|技能|help|commands?"],
        "to_command": _const("帮助"),
    },
]

SKILL_BY_NAME = {skill["name"]: skill for skill in SKILLS}
SKILL_SYSTEM = (
    "You route Raspberry Pi Frost Buddy voice requests. Choose only one skill "
    "from this registry and return JSON: {\"skill\":\"name-or-none\",\"args\":{},\"reply\":\"short zh\"}.\n"
    + "\n".join(f"- {skill['name']}: {skill['desc']}" for skill in SKILLS)
)


def _parse_json(raw):
    if isinstance(raw, dict):
        return raw
    text = str(raw or "").strip()
    if not text:
        return {}
    try:
        return json.loads(text)
    except (TypeError, ValueError):
        pass
    match = re.search(r"\{.*\}", text, re.S)
    if not match:
        return {}
    try:
        return json.loads(match.group(0))
    except (TypeError, ValueError):
        return {}


def validate_decision(decision):
    if not isinstance(decision, dict):
        return {"skill": "none", "args": {}, "reply": ""}
    name = str(decision.get("skill") or "none").strip()
    reply = _text(decision.get("reply"), 90)
    if name == "none" or name not in SKILL_BY_NAME:
        return {"skill": "none", "args": {}, "reply": reply}
    args = decision.get("args") if isinstance(decision.get("args"), dict) else {}
    return {"skill": name, "args": dict(args), "reply": reply}


def keyword_fallback(text):
    value = str(text or "")
    for skill in SKILLS:
        if any(re.search(pattern, value, re.I) for pattern in skill.get("patterns", [])):
            return {"skill": skill["name"], "args": {}, "reply": ""}
    return {"skill": "none", "args": {}, "reply": ""}


def decide(text, brain_fn=None):
    value = str(text or "").strip()
    if not value:
        return {"skill": "none", "args": {}, "reply": ""}
    if brain_fn:
        try:
            decision = validate_decision(_parse_json(brain_fn(SKILL_SYSTEM, value)))
            if decision["skill"] != "none":
                return decision
        except Exception:
            pass
    return validate_decision(keyword_fallback(value))


def create_music_event(context=None):
    context = context or {}
    track = context.get("track") if isinstance(context.get("track"), dict) else {}
    title = _text(context.get("title") or track.get("title") or "Frost Radio")
    artist = _text(context.get("artist") or track.get("artist") or "music-agent")
    city = _text(context.get("city") or track.get("city") or "口袋地球")
    event = {
        "version": BRIDGE_VERSION,
        "kind": "music_now_playing",
        "source": "music-agent",
        "state": "busy",
        "priority": "normal",
        "title": title,
        "body": _text(f"{artist} · {city}"),
        "speak": _text(context.get("speak") or f"Frost 正在播放 {title}，来自 {city}。", 120),
        "track": {"title": title, "artist": artist, "city": city},
        "createdAt": context.get("createdAt") or "2026-06-29T00:00:00.000Z",
    }
    _assert_public_event(event)
    return event


def create_chain_event(context=None):
    context = context or {}
    ids = context.get("agentIds") if isinstance(context.get("agentIds"), list) else [43, 44, 45, 46, 47]
    agent_ids = [str(item) for item in ids if str(item).strip()][:12]
    count = int(context.get("count") or len(agent_ids) or 0)
    event = {
        "version": BRIDGE_VERSION,
        "kind": "chain_dispatch",
        "source": "injective-public-plaza",
        "state": "attention",
        "priority": "urgent",
        "title": _text(context.get("title") or "Injective chain dispatch"),
        "body": _text(context.get("body") or f"builderCode=pocket-earth returned agentId {', '.join(agent_ids)} from Injective testnet."),
        "speak": _text(context.get("speak") or f"Frost 在 Injective 链上遇见了 {count} 个 Pocket Earth agent。", 120),
        "agentIds": agent_ids,
        "scanUrl": _text(context.get("scanUrl") or REGISTRY_URL, 240),
        "createdAt": context.get("createdAt") or "2026-06-29T00:00:01.000Z",
    }
    _assert_public_event(event)
    return event


def route(text, brain_fn=None, context=None):
    decision = decide(text, brain_fn=brain_fn)
    name = decision["skill"]
    if name == "none":
        return {"ok": False, "skill": "none", "type": "none", "reply": decision.get("reply", "")}
    skill = SKILL_BY_NAME[name]
    if "to_command" in skill:
        return {
            "ok": True,
            "skill": name,
            "type": "command",
            "command": skill["to_command"](decision.get("args") or {}),
            "reply": decision.get("reply", ""),
        }
    if skill.get("event") == "music_now_playing":
        return {"ok": True, "skill": name, "type": "event", "event": create_music_event(context)}
    if skill.get("event") == "chain_dispatch":
        return {"ok": True, "skill": name, "type": "event", "event": create_chain_event(context)}
    return {"ok": False, "skill": "none", "type": "none", "reply": ""}


def to_json_line(result):
    if result.get("type") != "event":
        raise ValueError("only event results can be serialized as JSONL")
    event = result["event"]
    _assert_public_event(event)
    return json.dumps(event, ensure_ascii=False, separators=(",", ":")) + "\n"


def apply(text, post_command_fn=None, emit_event_fn=None, brain_fn=None, context=None):
    result = route(text, brain_fn=brain_fn, context=context)
    if not result.get("ok"):
        return False
    if result["type"] == "command" and post_command_fn:
        post_command_fn(result["command"])
    if result["type"] == "event" and emit_event_fn:
        emit_event_fn(result["event"])
    return True


if __name__ == "__main__":
    query = " ".join(sys.argv[1:]) or "播报 Injective 链上见闻"
    routed = route(query)
    if routed.get("type") == "event":
        sys.stdout.write(to_json_line(routed))
    else:
        print(json.dumps(routed, ensure_ascii=False))
