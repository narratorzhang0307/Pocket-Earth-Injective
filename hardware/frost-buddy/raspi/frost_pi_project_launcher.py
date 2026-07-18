#!/usr/bin/env python3
"""Two-level Whisplay launcher for the projects under ``/home/pi``.

The launcher subscribes to the existing Sunset Radio foreground button stream
without importing or modifying Sunset Radio. Holding the orange button stops
only its display process, acquires Whisplay foreground, and opens a safe project
menu. The radio API and music playback service remain independent.
"""

from __future__ import annotations

import os
import json
import random
import signal
import subprocess
import sys
import threading
import time
import unicodedata
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from frost_pi_device_driver import rgb565_bytes
from frost_pi_sunset_bridge import (
    catalog_groups,
    load_catalog as load_sunset_catalog,
    queue_city as queue_sunset_city,
    queue_track as queue_sunset_track,
    random_track as choose_random_sunset_track,
    upcoming_sunsets,
)


WIDTH = 240
HEIGHT = 280
INK = (10, 10, 12)
PAPER = (245, 244, 239)
GREEN = (0, 244, 139)
ORANGE = (255, 126, 52)
MAGENTA = (255, 20, 199)
CYAN = (30, 202, 255)
GREY = (101, 105, 112)
SOCKET_PATH = os.environ.get("WHISPLAY_DAEMON_SOCKET", "/tmp/whisplay-daemon.sock")
RUNTIME_PATH = os.environ.get("WHISPLAY_RUNTIME", "/home/pi/Whisplay/runtime")
SNAPSHOT_PATH = Path(os.environ.get("FROST_MIRROR_PATH", "/run/pocket-earth-edge/live.png"))
LONG_PRESS_SECONDS = float(os.environ.get("POCKET_LAUNCHER_LONG_PRESS_SECONDS", "1.2"))
DOUBLE_CLICK_SECONDS = float(os.environ.get("POCKET_LAUNCHER_DOUBLE_CLICK_SECONDS", "0.85"))
FOREGROUND_GRACE_SECONDS = float(os.environ.get("POCKET_LAUNCHER_FOREGROUND_GRACE_SECONDS", "0.0"))
FOREGROUND_POLL_SECONDS = float(os.environ.get("POCKET_LAUNCHER_FOREGROUND_POLL_SECONDS", "0.25"))
STARTUP_GRACE_SECONDS = float(os.environ.get("POCKET_LAUNCHER_STARTUP_GRACE_SECONDS", "1.0"))

SAFE_FOREGROUND_APPS = {
    "sunset-radio-status",
    "pocket-earth-launcher",
    "pocket-earth-edge",
}
VENDOR_APPS = {
    "whisplay-bluetooth",
    "whisplay-wifi",
    "whisplay-volume",
    "whisplay-jump",
    "whisplay-flappy-bird",
    "whisplay-play-mp4",
    "whisplay-run-test",
    "dummy-test",
}

PROJECTS = (
    {"key": "sunset", "label": "SUNSET RADIO", "path": "/home/pi/sunset-radio", "accent": ORANGE},
    {"key": "pocket", "label": "POCKET EARTH", "path": "/home/pi/pocket-earth", "accent": GREEN},
)

AGENTS = (
    {"key": "identity", "label": "FROST 身份", "meta": "ERC-8004 · AGENT 43-47", "accent": GREEN},
    {"key": "knowledge", "label": "公共知识", "meta": "8 TOPICS · VERIFIED EDITION", "accent": CYAN},
    {"key": "ai", "label": "AI NEWS", "meta": "DAILY CURATION AGENT", "accent": MAGENTA},
    {"key": "finance", "label": "FINANCE", "meta": "MARKET KNOWLEDGE AGENT", "accent": ORANGE},
    {"key": "verify", "label": "FACT VERIFIER", "meta": "SOURCE CROSS-CHECK", "accent": CYAN},
    {"key": "dispatch", "label": "链上见闻", "meta": "INJECTIVE PUBLIC PROOF", "accent": GREEN},
)

SUNSET_MODES = (
    {"key": "catalog", "label": "歌曲目录", "meta": "按时区、城市与曲目选择", "accent": ORANGE},
    {"key": "sunset", "label": "日落时刻", "meta": "跟随此刻最近的真实日落", "accent": MAGENTA},
    {"key": "dice", "label": "随机骰子", "meta": "让今夜替你选一城一曲", "accent": CYAN},
)

CONTENT_CACHE_PATH = Path(
    os.environ.get(
        "POCKET_EARTH_CONTENT_CACHE",
        str(Path(__file__).with_name("frost_pi_content_cache.json")),
    )
)


def load_content_cache() -> dict:
    try:
        payload = json.loads(CONTENT_CACHE_PATH.read_text(encoding="utf-8"))
        if payload.get("schema") == "pocket-earth-edge-content-cache/v1":
            return payload
    except (OSError, ValueError, TypeError):
        pass
    return {
        "schema": "pocket-earth-edge-content-cache/fallback",
        "buffer": [],
        "identity": {"agentIds": [43, 44, 45, 46, 47], "residences": []},
        "knowledgeEdition": {"date": "OFFLINE", "revision": 0, "factCount": 0, "records": []},
        "signals": {"date": "OFFLINE", "ai": [], "finance": []},
        "verification": {"stages": ["主张受理", "证据侦察", "调查方", "质疑方", "确定性裁决", "版次入库"]},
        "chainDispatch": {"publicEarthResidences": 0, "knowledgeRevision": 0, "eventKinds": []},
    }


CONTENT_CACHE = load_content_cache()

FONT_REGULAR = (
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
)
FONT_BOLD = (
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
)
FONT_MONO = (
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
)
FONT_UNIVERSAL = (
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
    "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansThai-Bold.ttf",
    "/usr/share/fonts/truetype/noto/NotoSansThai-Regular.ttf",
    "/usr/share/fonts/truetype/noto/NotoSansArabic-Bold.ttf",
    "/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    "/usr/share/fonts/opentype/unifont/unifont.otf",
    "/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf",
)


def font(size: int, family: str = "regular"):
    candidates = FONT_BOLD if family == "bold" else FONT_MONO if family == "mono" else FONT_REGULAR
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def _font_supports_text(selected, text: str) -> bool:
    try:
        missing = (selected.getmask(chr(0x10FFFF)).size, bytes(selected.getmask(chr(0x10FFFF))))
        for character in str(text or ""):
            if (
                character.isspace()
                or character in "·—–-/+':,.!?()[]"
                or unicodedata.category(character).startswith("M")
            ):
                continue
            mask = selected.getmask(character)
            if not any(bytes(mask)) or (mask.size, bytes(mask)) == missing:
                return False
        return True
    except (AttributeError, OSError, ValueError):
        return False


def font_for_text(text: str, size: int, family: str = "regular"):
    selected = font(size, family)
    if _font_supports_text(selected, text):
        return selected
    for candidate in FONT_UNIVERSAL:
        if not Path(candidate).exists():
            continue
        fallback = ImageFont.truetype(candidate, size)
        if _font_supports_text(fallback, text):
            return fallback
    return selected


def cjk_font_status() -> tuple[bool, str]:
    """Prove that the selected regular font contains real Chinese glyphs."""
    selected = font(16, "regular")
    path = str(getattr(selected, "path", "PIL-default"))
    try:
        missing = (selected.getmask(chr(0x10FFFF)).size, bytes(selected.getmask(chr(0x10FFFF))))
        for character in "口袋地球身份知识链上见闻事实核验":
            mask = selected.getmask(character)
            if not any(bytes(mask)) or (mask.size, bytes(mask)) == missing:
                return False, path
    except (AttributeError, OSError, ValueError):
        return False, path
    return True, path


def save_snapshot(image: Image.Image) -> None:
    SNAPSHOT_PATH.parent.mkdir(parents=True, exist_ok=True)
    temporary = SNAPSHOT_PATH.with_suffix(".launcher.tmp.png")
    image.save(temporary, format="PNG")
    temporary.replace(SNAPSHOT_PATH)


def draw_header(draw: ImageDraw.ImageDraw, title: str, accent) -> None:
    draw.rectangle((0, 0, WIDTH, 39), fill=INK)
    draw.text((11, 8), title, font=font_for_text(title, 15, "mono"), fill=PAPER)
    draw.rectangle((211, 8, 229, 30), fill=accent, outline=PAPER, width=1)


def render_root(selected: int) -> Image.Image:
    image = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
    draw = ImageDraw.Draw(image)
    draw_header(draw, "PI HOME", GREEN)
    draw.text((12, 49), "/home/pi", font=font(11, "mono"), fill=GREY)
    draw.text((12, 69), "选择一个项目", font=font(18, "bold"), fill=INK)
    for index, project in enumerate(PROJECTS):
        y = 105 + index * 62
        active = index == selected
        fill = project["accent"] if active else PAPER
        draw.rectangle((11, y, 229, y + 50), fill=fill, outline=INK, width=3)
        draw.text((20, y + 9), ("> " if active else "  ") + project["label"], font=font(13, "mono"), fill=INK)
        draw.text((22, y + 31), project["path"].replace("/home/pi/", "~/"), font=font(9, "mono"), fill=INK if active else GREY)
    draw.text((12, 246), "CLICK: MOVE  HOLD: OPEN", font=font(8, "mono"), fill=INK)
    draw.text((12, 263), "2X: BACK TO RADIO", font=font(8, "mono"), fill=GREY)
    return image


def render_agents(selected: int) -> Image.Image:
    image = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
    draw = ImageDraw.Draw(image)
    draw_header(draw, "POCKET EARTH", GREEN)
    draw.text((12, 48), "AGENTS  /home/pi/pocket-earth", font=font(9, "mono"), fill=GREY)

    visible = 4
    start = min(max(0, selected - 1), max(0, len(AGENTS) - visible))
    for row, index in enumerate(range(start, min(start + visible, len(AGENTS)))):
        agent = AGENTS[index]
        y = 69 + row * 45
        active = index == selected
        fill = agent["accent"] if active else PAPER
        draw.rectangle((10, y, 230, y + 37), fill=fill, outline=INK, width=2)
        draw.text((17, y + 5), ("> " if active else "  ") + agent["label"], font=font(12, "bold"), fill=INK)
        draw.text((20, y + 23), agent["meta"], font=font(7, "mono"), fill=INK if active else GREY)

    draw.text((12, 254), f"{selected + 1}/{len(AGENTS)} CLICK: MOVE  HOLD: OPEN", font=font(7, "mono"), fill=INK)
    draw.text((12, 267), "2X: BACK TO PI HOME", font=font(8, "mono"), fill=GREY)
    return image


def short_hash(value: str, head: int = 8, tail: int = 6) -> str:
    text = str(value or "")
    return f"{text[:head]}…{text[-tail:]}" if len(text) > head + tail + 1 else text


def _content_pages(agent: dict) -> list[dict]:
    key = agent["key"]
    identity = CONTENT_CACHE.get("identity", {})
    edition = CONTENT_CACHE.get("knowledgeEdition", {})
    records = {item.get("topic"): item for item in edition.get("records", [])}
    signals = CONTENT_CACHE.get("signals", {})
    buffer = CONTENT_CACHE.get("buffer", [])
    verifier = CONTENT_CACHE.get("verification", {})
    dispatch = CONTENT_CACHE.get("chainDispatch", {})

    buffer_lines = [
        f"{item.get('date', '')[5:]}  {item.get('state', '').upper()}  {item.get('signalCount', 0)} ITEMS"
        for item in buffer[:3]
    ]
    if key == "identity":
        residences = identity.get("residences", [])
        return [
            {
                "tag": "LIVE IDENTITY",
                "title": "FROST 链上身份",
                "badge": "INJECTIVE · 1439",
                "lines": ["AGENT #43–47 已公开注册", "身份持久、可验证、可审计", f"REG {short_hash(identity.get('registry'))}"],
            },
            {
                "tag": "PUBLIC EARTH",
                "title": "五个分身已有门牌",
                "badge": "5 RESIDENCES",
                "lines": [f"#{item.get('agentId')}  {item.get('doorplate')}  {item.get('zone')}" for item in residences[:4]],
            },
            {
                "tag": "BOUNDARY",
                "title": "链上放身份",
                "badge": "PRIVATE BY DEFAULT",
                "lines": ["端侧留人生与原始记忆", "门牌不是现实地址", "没有土地稀缺、拍卖或炒作"],
            },
        ]
    if key == "knowledge":
        return [
            {
                "tag": "DAILY EDITION",
                "title": f"{edition.get('date')} · REV {edition.get('revision')}",
                "badge": f"{edition.get('factCount', 0)} FACTS · ANCHORED",
                "lines": [f"ROOT {short_hash(edition.get('editionRoot'))}", f"BLOCK {edition.get('blockNumber', '—')}", "资源包在 App · 根在 Injective"],
            },
            *_record_pages(records),
            {
                "tag": "3-DAY BUFFER",
                "title": "快开，也诚实标新鲜度",
                "badge": "HIT / MISS / CHAIN",
                "lines": buffer_lines or ["暂无日期缓存"],
            },
        ]
    if key in {"ai", "finance"}:
        verified = records.get(key, {})
        candidates = signals.get(key, [])
        topic_title = "AI 已核验知识" if key == "ai" else "金融已核验知识"
        pages = [{
            "tag": "VERIFIED · 07-17",
            "title": topic_title,
            "badge": f"TRUTH {verified.get('truthScore', '—')} · {verified.get('sourceCount', 0)} SOURCES",
            "lines": [verified.get("claim", "等待下一版次"), verified.get("sourceLabel", "")],
        }]
        pages.extend({
            "tag": f"SIGNAL {index + 1}/{len(candidates)} · 07-15",
            "title": item.get("headline", "公开信号"),
            "badge": f"IMPORTANCE {item.get('importance', '—')} · 待核验",
            "lines": [item.get("claim", ""), f"SOURCE · {item.get('publisher', 'PUBLIC')}"],
        } for index, item in enumerate(candidates))
        pages.append({
            "tag": "CACHE PROVENANCE",
            "title": "候选不冒充事实",
            "badge": "37 SIGNALS · 8 TOPICS",
            "lines": ["07-15 保留排序回执与来源", "只有复核后的记录进入 Merkle 版次", "07-16 缺失会明确显示 MISS"],
        })
        return pages
    if key == "verify":
        stages = verifier.get("stages", [])
        return [
            {
                "tag": "VERIFIER NETWORK",
                "title": "六阶段事实核验",
                "badge": "FACTATLAS KERNEL",
                "lines": [" → ".join(stages[:3]), " → ".join(stages[3:]), "候选信号不会直接写入版次"],
            },
            *_record_pages(records, proof=True),
            {
                "tag": "INTEGRITY RULE",
                "title": "证据可修订，历史不覆盖",
                "badge": "APPEND-ONLY",
                "lines": ["Record Hash 固定证据快照", "Merkle Proof 证明所属版次", "新证据追加新 revision"],
            },
        ]
    return [
        {
            "tag": "CHAIN DISPATCH",
            "title": "Frost 的链上见闻",
            "badge": "PUBLIC EVENT · LIVE",
            "lines": [f"公共地球 {dispatch.get('publicEarthResidences', 0)} 个门牌", f"知识版次 REV {dispatch.get('knowledgeRevision', 0)}", f"BLOCK {dispatch.get('knowledgeBlock', '—')}"],
        },
        {
            "tag": "PHYSICAL LOOP",
            "title": "公开事实回到房间",
            "badge": "SCREEN · LED · TTS",
            "lines": ["链上事件 → 白名单 JSONL", "小屏证据卡 → LED 转色", "本地播报 → 手机镜像"],
        },
        {
            "tag": "PRIVACY",
            "title": "设备只消费公开事件",
            "badge": "NO KEY · NO SIGNING",
            "lines": ["不碰私钥，不代签钱包", "不读取原始画像与私人坐标", "白天出门，夜里带回见闻"],
        },
    ]


def _record_pages(records: dict, proof: bool = False) -> list[dict]:
    pages = []
    for topic in ("ai", "finance"):
        record = records.get(topic)
        if not record:
            continue
        pages.append({
            "tag": f"{'MERKLE PROOF' if proof else 'VERIFIED'} · {topic.upper()}",
            "title": record.get("title", topic.upper()),
            "badge": f"{record.get('verdict', 'SUPPORTED')} · TRUTH {record.get('truthScore', '—')}",
            "lines": [
                record.get("claim", "") if not proof else f"RECORD {short_hash(record.get('recordHash'))}",
                f"{record.get('sourceCount', 0)} SOURCES · {record.get('sourceLabel', '')}",
                "PROOF VERIFIED · EDITION REV 2" if proof else "已进入 07-17 每日知识版次",
            ],
        })
    return pages


def _wrapped_lines(draw: ImageDraw.ImageDraw, text: str, text_font, max_width: int, max_lines: int) -> list[str]:
    value = str(text or "").strip()
    if not value:
        return []
    units = value.split(" ") if " " in value and not any("\u4e00" <= char <= "\u9fff" for char in value) else list(value)
    separator = " " if units and len(units) < len(value) else ""
    lines, current = [], ""
    for unit in units:
        candidate = f"{current}{separator if current else ''}{unit}"
        if current and draw.textlength(candidate, font=text_font) > max_width:
            lines.append(current)
            current = unit
            if len(lines) >= max_lines:
                break
        else:
            current = candidate
    if len(lines) < max_lines and current:
        lines.append(current)
    truncated = len(lines) >= max_lines and "".join(lines).replace(" ", "") != value.replace(" ", "")
    if truncated and lines:
        while lines[-1] and draw.textlength(f"{lines[-1]}…", font=text_font) > max_width:
            lines[-1] = lines[-1][:-1]
        lines[-1] = f"{lines[-1]}…"
    return lines[:max_lines]


def _render_sunset_list(title: str, breadcrumb: str, items: list[dict], selected: int, accent=ORANGE) -> Image.Image:
    image = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
    draw = ImageDraw.Draw(image)
    draw_header(draw, title, accent)
    draw.text((12, 48), breadcrumb, font=font_for_text(breadcrumb, 8, "mono"), fill=GREY)
    if not items:
        draw.text((12, 92), "曲库正在载入", font=font(18, "bold"), fill=INK)
        draw.text((12, 124), "请确认日落电台资源目录可读", font=font(12), fill=GREY)
    else:
        visible = 4
        selected %= len(items)
        start = min(max(0, selected - 1), max(0, len(items) - visible))
        for row, index in enumerate(range(start, min(start + visible, len(items)))):
            item = items[index]
            y = 66 + row * 45
            active = index == selected
            fill = item.get("accent", accent) if active else PAPER
            draw.rectangle((10, y, 230, y + 37), fill=fill, outline=INK, width=2)
            label = str(item.get("label") or "—")
            label_text = ("> " if active else "  ") + label
            label_font = font_for_text(label_text, 11, "bold")
            label_lines = _wrapped_lines(draw, label_text, label_font, 204, 1)
            draw.text((17, y + 5), label_lines[0] if label_lines else "—", font=label_font, fill=INK)
            meta = str(item.get("meta") or "")
            meta_font = font_for_text(meta, 7, "mono")
            meta_lines = _wrapped_lines(draw, meta, meta_font, 202, 1)
            if meta_lines:
                draw.text((20, y + 23), meta_lines[0], font=meta_font, fill=INK if active else GREY)
    total = max(1, len(items))
    draw.text((12, 254), f"{selected % total + 1}/{len(items)} CLICK: MOVE  HOLD: OPEN", font=font(7, "mono"), fill=INK)
    draw.text((12, 267), "2X: BACK", font=font(8, "mono"), fill=GREY)
    return image


def render_sunset_modes(selected: int, catalog: list[dict]) -> Image.Image:
    total_tracks = sum(len(city.get("tracks", [])) for city in catalog)
    items = [dict(mode) for mode in SUNSET_MODES]
    items[0]["meta"] = f"{len(catalog)} 座城市 · {total_tracks} 首歌"
    return _render_sunset_list("SUNSET RADIO", "~/sunset-radio  /  选择模式", items, selected)


def render_sunset_groups(groups: list[dict], selected: int) -> Image.Image:
    items = [
        {"label": group["label"], "meta": f"{len(group['cities'])} 座城市", "accent": ORANGE}
        for group in groups
    ]
    return _render_sunset_list("歌曲目录", "按日落时区进入城市目录", items, selected)


def render_sunset_cities(cities: list[dict], selected: int) -> Image.Image:
    items = [
        {
            "label": f"{city['cityNameZh']}  {city['cityName']}",
            "meta": f"{len(city['tracks'])} TRACKS · UTC {city['tzOffset']:+g}",
            "accent": ORANGE,
        }
        for city in cities
    ]
    return _render_sunset_list("歌曲目录", "时区目录  /  选择城市", items, selected)


def render_sunset_tracks(city: dict | None, selected: int) -> Image.Image:
    city = city or {"cityNameZh": "—", "tracks": []}
    items = [
        {"label": track["title"], "meta": track.get("artist", ""), "accent": ORANGE}
        for track in city.get("tracks", [])
    ]
    return _render_sunset_list("歌曲目录", f"{city['cityNameZh']}  /  选择歌曲", items, selected)


def render_sunset_times(events: list[dict], selected: int) -> Image.Image:
    items = []
    for event in events:
        wait = int(event.get("minutesUntil") or 0)
        wait_text = f"{wait // 60}H {wait % 60:02d}M" if wait >= 60 else f"{wait} MIN"
        items.append(
            {
                "label": f"{event.get('cityNameZh')}  {event.get('userSunsetClock')}",
                "meta": f"距日落 {wait_text} · 当地 {event.get('cityLocalSunsetClock')}",
                "accent": MAGENTA,
            }
        )
    return _render_sunset_list("日落时刻", "北京时间  /  最近的真实日落", items, selected, accent=MAGENTA)


def _draw_dice(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], value: int, colour) -> None:
    left, top, right, bottom = box
    draw.rounded_rectangle(box, radius=7, outline=colour, width=3)
    cx, cy = (left + right) // 2, (top + bottom) // 2
    dx, dy = (right - left) // 4, (bottom - top) // 4
    points = {
        1: [(cx, cy)],
        2: [(cx - dx, cy - dy), (cx + dx, cy + dy)],
        3: [(cx - dx, cy - dy), (cx, cy), (cx + dx, cy + dy)],
        4: [(cx - dx, cy - dy), (cx + dx, cy - dy), (cx - dx, cy + dy), (cx + dx, cy + dy)],
        5: [(cx - dx, cy - dy), (cx + dx, cy - dy), (cx, cy), (cx - dx, cy + dy), (cx + dx, cy + dy)],
        6: [(cx - dx, cy - dy), (cx + dx, cy - dy), (cx - dx, cy), (cx + dx, cy), (cx - dx, cy + dy), (cx + dx, cy + dy)],
    }
    for x, y in points.get(max(1, min(6, value)), points[1]):
        draw.ellipse((x - 3, y - 3, x + 3, y + 3), fill=colour)


def render_sunset_dice(state) -> Image.Image:
    night = (4, 5, 6)
    amber = (246, 173, 85)
    image = Image.new("RGB", (WIDTH, HEIGHT), night)
    draw = ImageDraw.Draw(image)
    draw.text((63, 28), "T O N I G H T ' S  R O L L", font=font(7, "mono"), fill=(151, 104, 63))
    if state.dice_phase == "idle":
        draw.text((35, 72), "让我们扔一枚骰子吧", font=font(17, "bold"), fill=PAPER)
        draw.text((25, 106), "这是宇宙里的第一个骰子", font=font(15), fill=PAPER)
        draw.rectangle((30, 148, 210, 224), outline=amber, width=1)
        for x, y, sx, sy in ((30, 148, 1, 1), (210, 148, -1, 1), (30, 224, 1, -1), (210, 224, -1, -1)):
            draw.line((x, y, x + sx * 12, y), fill=amber, width=2)
            draw.line((x, y, x, y + sy * 12), fill=amber, width=2)
        _draw_dice(draw, (99, 162, 141, 204), 5, amber)
        draw.text((64, 210), "HOLD 1.2S TO ROLL", font=font(9, "mono"), fill=amber)
    else:
        draw.text((49, 58), state.dice_code, font=font(22, "mono"), fill=amber)
        message = "电台的指针，正在一座城上……" if state.dice_phase == "rolling" else "今晚已经被选定。"
        draw.text((31, 100), message, font=font(11), fill=(197, 193, 186))
        _draw_dice(draw, (91, 128, 149, 190), state.dice_value, amber)
        if state.dice_phase == "landed" and state.dice_city and state.dice_track:
            draw.text((12, 204), state.dice_city.get("cityNameZh", ""), font=font(14, "bold"), fill=PAPER)
            title = _wrapped_lines(draw, state.dice_track.get("title", ""), font(11), 216, 1)
            draw.text((12, 225), title[0] if title else "", font=font(11), fill=amber)
            draw.text((12, 246), "HOLD: PLAY", font=font(8, "mono"), fill=PAPER)
    draw.text((12, 265), "2X: BACK", font=font(8, "mono"), fill=(116, 112, 106))
    return image


def render_agent_page(agent: dict, page_index: int = 0) -> Image.Image:
    image = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
    draw = ImageDraw.Draw(image)
    draw_header(draw, "POCKET EARTH", agent["accent"])
    pages = _content_pages(agent)
    current = pages[page_index % len(pages)]
    draw.text((12, 49), current["tag"], font=font(9, "mono"), fill=GREY)
    title_lines = _wrapped_lines(draw, current["title"], font(18, "bold"), 216, 2)
    for index, line in enumerate(title_lines):
        draw.text((12, 67 + index * 22), line, font=font(18, "bold"), fill=INK)
    badge_y = 115 if len(title_lines) > 1 else 99
    draw.rectangle((11, badge_y, 229, badge_y + 28), fill=agent["accent"], outline=INK, width=2)
    draw.text((17, badge_y + 8), current["badge"], font=font(9, "mono"), fill=INK)

    y = badge_y + 39
    body_font = font(12, "regular")
    remaining = 5
    for raw in current.get("lines", []):
        lines = _wrapped_lines(draw, raw, body_font, 216, min(2, remaining))
        for line in lines:
            draw.text((12, y), line, font=body_font, fill=INK)
            y += 19
            remaining -= 1
        if remaining <= 0:
            break
        y += 2
    draw.text((12, 251), f"{page_index % len(pages) + 1}/{len(pages)}  CLICK: NEXT", font=font(8, "mono"), fill=INK)
    draw.text((12, 265), "2X: BACK", font=font(8, "mono"), fill=GREY)
    return image


class MenuState:
    def __init__(self, sunset_catalog: list[dict] | None = None):
        self.level = "root"
        self.root_index = 1
        self.agent_index = 0
        self.page_index = 0
        self.sunset_catalog = sunset_catalog if sunset_catalog is not None else load_sunset_catalog()
        self.sunset_groups = catalog_groups(self.sunset_catalog)
        self.sunset_events = upcoming_sunsets(self.sunset_catalog, limit=24)
        self.sunset_mode_index = 0
        self.sunset_group_index = 0
        self.sunset_city_index = 0
        self.sunset_track_index = 0
        self.sunset_event_index = 0
        self.dice_phase = "idle"
        self.dice_value = 5
        self.dice_code = "0000 · 0000"
        self.dice_city = None
        self.dice_track = None

    def current_group(self) -> dict | None:
        if not self.sunset_groups:
            return None
        return self.sunset_groups[self.sunset_group_index % len(self.sunset_groups)]

    def current_city(self) -> dict | None:
        group = self.current_group()
        cities = group.get("cities", []) if group else []
        if not cities:
            return None
        return cities[self.sunset_city_index % len(cities)]

    def image(self) -> Image.Image:
        if self.level == "root":
            return render_root(self.root_index)
        if self.level == "sunset_modes":
            return render_sunset_modes(self.sunset_mode_index, self.sunset_catalog)
        if self.level == "sunset_groups":
            return render_sunset_groups(self.sunset_groups, self.sunset_group_index)
        if self.level == "sunset_cities":
            group = self.current_group()
            return render_sunset_cities(group.get("cities", []) if group else [], self.sunset_city_index)
        if self.level == "sunset_tracks":
            return render_sunset_tracks(self.current_city(), self.sunset_track_index)
        if self.level == "sunset_times":
            return render_sunset_times(self.sunset_events, self.sunset_event_index)
        if self.level == "sunset_dice":
            return render_sunset_dice(self)
        if self.level == "agents":
            return render_agents(self.agent_index)
        return render_agent_page(AGENTS[self.agent_index], self.page_index)

    def move(self) -> None:
        if self.level == "root":
            self.root_index = (self.root_index + 1) % len(PROJECTS)
        elif self.level == "agents":
            self.agent_index = (self.agent_index + 1) % len(AGENTS)
            self.page_index = 0
        elif self.level == "agent":
            self.page_index = (self.page_index + 1) % len(_content_pages(AGENTS[self.agent_index]))
        elif self.level == "sunset_modes":
            self.sunset_mode_index = (self.sunset_mode_index + 1) % len(SUNSET_MODES)
        elif self.level == "sunset_groups" and self.sunset_groups:
            self.sunset_group_index = (self.sunset_group_index + 1) % len(self.sunset_groups)
            self.sunset_city_index = 0
            self.sunset_track_index = 0
        elif self.level == "sunset_cities":
            group = self.current_group()
            cities = group.get("cities", []) if group else []
            if cities:
                self.sunset_city_index = (self.sunset_city_index + 1) % len(cities)
                self.sunset_track_index = 0
        elif self.level == "sunset_tracks":
            city = self.current_city()
            tracks = city.get("tracks", []) if city else []
            if tracks:
                self.sunset_track_index = (self.sunset_track_index + 1) % len(tracks)
        elif self.level == "sunset_times" and self.sunset_events:
            self.sunset_event_index = (self.sunset_event_index + 1) % len(self.sunset_events)

    def enter(self):
        if self.level == "root":
            if PROJECTS[self.root_index]["key"] == "sunset":
                self.level = "sunset_modes"
                return "draw"
            self.level = "agents"
        elif self.level == "agents":
            self.level = "agent"
            self.page_index = 0
        elif self.level == "sunset_modes":
            mode = SUNSET_MODES[self.sunset_mode_index]["key"]
            self.level = {"catalog": "sunset_groups", "sunset": "sunset_times", "dice": "sunset_dice"}[mode]
            if mode == "dice":
                self.dice_phase = "idle"
                self.dice_city = None
                self.dice_track = None
        elif self.level == "sunset_groups" and self.sunset_groups:
            self.level = "sunset_cities"
            self.sunset_city_index = 0
        elif self.level == "sunset_cities" and self.current_city():
            self.level = "sunset_tracks"
            self.sunset_track_index = 0
        elif self.level == "sunset_tracks":
            city = self.current_city()
            tracks = city.get("tracks", []) if city else []
            if tracks:
                return ("play_track", tracks[self.sunset_track_index % len(tracks)])
        elif self.level == "sunset_times" and self.sunset_events:
            return ("play_city", self.sunset_events[self.sunset_event_index % len(self.sunset_events)])
        elif self.level == "sunset_dice":
            if self.dice_phase == "landed" and self.dice_track:
                return ("play_track", self.dice_track)
            return "roll_dice"
        return "draw"

    def set_dice_frame(self) -> None:
        self.dice_phase = "rolling"
        self.dice_value = random.randint(1, 6)
        self.dice_code = f"{random.randrange(0x10000):04X} · {random.randrange(0x10000):04X}"

    def land_dice(self) -> None:
        self.dice_city, self.dice_track = choose_random_sunset_track(self.sunset_catalog)
        self.dice_phase = "landed"
        self.dice_value = random.randint(1, 6)

    def back(self) -> str:
        if self.level == "agent":
            self.level = "agents"
            self.page_index = 0
            return "draw"
        if self.level == "agents":
            self.level = "root"
            return "draw"
        if self.level == "sunset_tracks":
            self.level = "sunset_cities"
            return "draw"
        if self.level == "sunset_cities":
            self.level = "sunset_groups"
            return "draw"
        if self.level in {"sunset_groups", "sunset_times", "sunset_dice"}:
            self.level = "sunset_modes"
            return "draw"
        if self.level == "sunset_modes":
            self.level = "root"
            return "draw"
        return "sunset"


class ProjectLauncher:
    def __init__(self):
        if RUNTIME_PATH not in sys.path:
            sys.path.insert(0, RUNTIME_PATH)
        from whisplay_client import WhisplayDaemonProxy

        self.lock = threading.RLock()
        self.state = MenuState()
        self.active = False
        self.transitioning = False
        self.press_timer = None
        self.click_timer = None
        self.click_count = 0
        self.long_fired = False
        self.ignore_next_release = False
        self.started_at = time.monotonic()
        self.fallback_suspended_until = self.started_at + STARTUP_GRACE_SECONDS
        self.empty_foreground_since = None
        self.recovery_requested_for = ""
        self.recovery_requested_at = 0.0

        self.board = WhisplayDaemonProxy(
            socket_path=SOCKET_PATH,
            app_id="pocket-earth-launcher",
            display_name="PI Home",
            icon="PI",
            launch_command="sudo -n systemctl kill --kill-whom=main -s SIGUSR1 pocket-earth-launcher.service",
            launch_cwd="/home/pi/pocket-earth",
            # Keep PI HOME at desktop index zero. The vendor desktop otherwise
            # defaults to Bluetooth whenever foreground ownership has a gap.
            priority=1000,
            persist=True,
        )
        self.board.register()
        self.board.on_button_press(self._launcher_press)
        self.board.on_button_release(self._launcher_release)
        self.board.on_focus_revoked(self._launcher_focus_revoked)
        self.board.start_event_listener()

        self.sunset_watch = WhisplayDaemonProxy(
            socket_path=SOCKET_PATH,
            app_id="sunset-radio-status",
            persist=False,
        )
        self.sunset_watch.on_button_press(self._sunset_press)
        self.sunset_watch.on_button_release(self._sunset_release)
        self.sunset_watch.start_event_listener()

    @staticmethod
    def _systemctl(action: str, unit: str, *, no_block: bool = False) -> None:
        command = ["sudo", "-n", "systemctl"]
        if no_block:
            command.append("--no-block")
        command.extend([action, unit])
        subprocess.run(
            command,
            check=False,
            timeout=15,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

    def _cancel_press_timer(self) -> None:
        if self.press_timer:
            self.press_timer.cancel()
        self.press_timer = None

    def _arm_long(self, callback) -> None:
        self._cancel_press_timer()
        self.long_fired = False
        self.press_timer = threading.Timer(LONG_PRESS_SECONDS, callback)
        self.press_timer.daemon = True
        self.press_timer.start()

    def _sunset_press(self) -> None:
        with self.lock:
            if not self.active and not self.transitioning:
                self._arm_long(self.enter_home)

    def _sunset_release(self) -> None:
        with self.lock:
            self._cancel_press_timer()

    def _launcher_press(self) -> None:
        with self.lock:
            if self.active:
                self._arm_long(self._long_back)

    def _launcher_release(self) -> None:
        with self.lock:
            self._cancel_press_timer()
            if self.ignore_next_release:
                self.ignore_next_release = False
                return
            if self.long_fired or not self.active:
                self.long_fired = False
                return
            self.click_count += 1
            print(
                f"pocket-launcher: click {self.click_count} "
                f"(window={DOUBLE_CLICK_SECONDS:.2f}s level={self.state.level})",
                flush=True,
            )
            if self.click_timer:
                self.click_timer.cancel()
            self.click_timer = threading.Timer(DOUBLE_CLICK_SECONDS, self._settle_clicks)
            self.click_timer.daemon = True
            self.click_timer.start()

    def _launcher_focus_revoked(self, _payload=None) -> None:
        with self.lock:
            self.active = False
            self.empty_foreground_since = time.monotonic()

    def _settle_clicks(self) -> None:
        with self.lock:
            count = self.click_count
            self.click_count = 0
            self.click_timer = None
            if not self.active:
                return
            if count >= 2:
                print(f"pocket-launcher: back by {count} clicks", flush=True)
                result = self.state.back()
                if result == "sunset":
                    self.leave_to_sunset()
                    return
            else:
                self.state.move()
            self.draw()

    def _long_back(self) -> None:
        with self.lock:
            if not self.active:
                return
            self.long_fired = True
            if self.state.level != "agent":
                print("pocket-launcher: open by hold", flush=True)
                result = self.state.enter()
            else:
                print("pocket-launcher: detail page has no deeper level", flush=True)
                result = "draw"
            self._handle_result(result)

    def _handle_result(self, result) -> None:
        if result == "sunset":
            self.leave_to_sunset()
            return
        if result == "roll_dice":
            self._animate_dice()
            return
        if isinstance(result, tuple) and len(result) == 2:
            action, payload = result
            try:
                if action == "play_track":
                    queue_sunset_track(payload, self.state.sunset_catalog)
                elif action == "play_city":
                    queue_sunset_city(payload)
                else:
                    raise ValueError(f"unknown Sunset action: {action}")
                print(f"pocket-launcher: queued {action}", flush=True)
                self.board.set_rgb_fade(255, 126, 52, duration_ms=250)
                self.leave_to_sunset()
            except Exception as exc:
                print(f"pocket-launcher: Sunset command failed: {exc}", flush=True)
                self.draw()
            return
        self.draw()

    def _animate_dice(self) -> None:
        if not self.state.sunset_catalog:
            self.draw()
            return
        for _ in range(24):
            self.state.set_dice_frame()
            self.draw()
            time.sleep(0.08)
        self.state.land_dice()
        self.draw()

    def _foreground_app(self) -> str:
        try:
            return str(self.board._send_request("health.ping").get("payload", {}).get("foreground_app_id") or "")
        except Exception:
            return ""

    def _request_vendor_exit(self, app_id: str) -> None:
        now = time.monotonic()
        if self.recovery_requested_for == app_id and now - self.recovery_requested_at < 2.5:
            return
        self.recovery_requested_for = app_id
        self.recovery_requested_at = now
        try:
            self.board._send_request("app.exit.request", {"app_id": app_id})
            print(f"pocket-launcher: recovering foreground from {app_id}", flush=True)
        except Exception as exc:
            print(f"pocket-launcher: could not exit {app_id}: {exc}", flush=True)

    def maintain_foreground(self) -> None:
        """Prevent the user from falling through to vendor or demo screens."""
        with self.lock:
            if self.transitioning:
                return
            now = time.monotonic()
            if now < self.fallback_suspended_until:
                return
            foreground = self._foreground_app()
            if self.active and foreground != "pocket-earth-launcher":
                # The daemon can revoke focus independently (for example its
                # built-in quad-click exit). Trust live ownership, not the
                # process-local flag, or the launcher can remain falsely active
                # while the user is stranded on the vendor desktop.
                self.active = False
                self.board.release_focus()
            if foreground == "pocket-earth-launcher":
                self.active = True
                self.empty_foreground_since = None
                self.recovery_requested_for = ""
                return
            if foreground in SAFE_FOREGROUND_APPS:
                self.empty_foreground_since = None
                self.recovery_requested_for = ""
                return
            if foreground in VENDOR_APPS:
                self.empty_foreground_since = None
                self._request_vendor_exit(foreground)
                return
            if foreground:
                # Do not terminate an unknown third-party process. Raising PI
                # HOME to desktop index zero prevents it being launched by an
                # accidental hold; known vendor/demo apps are handled above.
                self.empty_foreground_since = None
                return
            if self.empty_foreground_since is None:
                self.empty_foreground_since = now
                return
            if now - self.empty_foreground_since >= FOREGROUND_GRACE_SECONDS:
                print("pocket-launcher: foreground gap recovered to PI HOME", flush=True)
                self.empty_foreground_since = None
                self.enter_home()

    def _release_sunset_focus_if_needed(self) -> None:
        if self._foreground_app() != "sunset-radio-status":
            return
        try:
            focus = self.sunset_watch._send_request("app.focus.acquire", {"app_id": "sunset-radio-status"}).get("payload", {})
            token = focus.get("session_token")
            if token:
                self.sunset_watch._send_request(
                    "app.focus.release",
                    {"app_id": "sunset-radio-status", "session_token": token},
                )
        except Exception:
            pass

    def enter_home(self, *_args) -> None:
        with self.lock:
            if self.active or self.transitioning:
                return
            self.transitioning = True
            self.long_fired = True
            self.ignore_next_release = True
        try:
            self._systemctl("stop", "sunset-radio-whisplay.service")
            self._release_sunset_focus_if_needed()
            self.board.acquire_foreground(timeout_sec=6.0)
            self.board.set_backlight(82)
            self.board.set_rgb_fade(0, 244, 139, duration_ms=300)
            with self.lock:
                self.state = MenuState()
                self.active = True
                self.draw()
        finally:
            with self.lock:
                if not self.active:
                    self._systemctl("restart", "sunset-radio-whisplay.service")
                self.transitioning = False

    def leave_to_sunset(self) -> None:
        self.active = False
        self.fallback_suspended_until = time.monotonic() + 6.0
        self.empty_foreground_since = None
        try:
            self.board.set_rgb_fade(0, 0, 0, duration_ms=250)
        finally:
            self.board.release_focus()
        self._systemctl("restart", "sunset-radio-whisplay.service")

    def draw(self) -> None:
        image = self.state.image()
        save_snapshot(image)
        self.board.draw_image(0, 0, WIDTH, HEIGHT, rgb565_bytes(image))

    def close(self) -> None:
        with self.lock:
            self._cancel_press_timer()
            if self.click_timer:
                self.click_timer.cancel()
            if self.active:
                self.board.release_focus()
                # Avoid a systemd stop cycle waiting on a nested restart job.
                self._systemctl("restart", "sunset-radio-whisplay.service", no_block=True)
            self.board.cleanup()
            self.sunset_watch.cleanup()


def main() -> int:
    launcher = ProjectLauncher()
    signal.signal(signal.SIGUSR1, launcher.enter_home)
    stopping = threading.Event()
    signal.signal(signal.SIGTERM, lambda *_args: stopping.set())
    signal.signal(signal.SIGINT, lambda *_args: stopping.set())
    try:
        while not stopping.wait(FOREGROUND_POLL_SECONDS):
            launcher.maintain_foreground()
    finally:
        launcher.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
