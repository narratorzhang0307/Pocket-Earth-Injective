#!/usr/bin/env python3
"""Offline smoke checks for the two-level Whisplay project launcher."""

from pathlib import Path
from tempfile import TemporaryDirectory

from frost_pi_project_launcher import AGENTS, MenuState, PROJECTS, SAFE_FOREGROUND_APPS, VENDOR_APPS, cjk_font_status


def main() -> int:
    state = MenuState()
    assert state.level == "root"
    assert [item["path"] for item in PROJECTS] == ["/home/pi/sunset-radio", "/home/pi/pocket-earth"]
    assert len(AGENTS) == 6
    assert "pocket-earth-edge" in SAFE_FOREGROUND_APPS
    assert {"whisplay-bluetooth", "whisplay-wifi"}.issubset(VENDOR_APPS)
    assert state.image().size == (240, 280)

    assert PROJECTS[state.root_index]["key"] == "pocket"
    assert state.enter() == "draw" and state.level == "agents"
    assert state.image().size == (240, 280)
    state.move()
    assert state.agent_index == 1
    assert state.enter() == "draw" and state.level == "agent"
    assert state.image().size == (240, 280)
    assert state.back() == "draw" and state.level == "agents"
    assert state.back() == "draw" and state.level == "root"
    assert state.back() == "sunset"

    with TemporaryDirectory() as directory:
        output = Path(directory) / "launcher.png"
        state.image().save(output)
        assert output.stat().st_size > 1024

    cjk_ok, cjk_font = cjk_font_status()
    if Path(cjk_font).exists() and ("wqy" in cjk_font.lower() or "cjk" in cjk_font.lower()):
        assert cjk_ok, f"Chinese glyph smoke failed for {cjk_font}"

    print(f"frost_pi_project_launcher smoke passed; cjkFont={cjk_font} cjkGlyphs={cjk_ok}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
