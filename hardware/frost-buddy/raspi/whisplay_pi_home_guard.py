#!/usr/bin/env python3
"""Hide Whisplay's vendor app desktop when Pocket Earth's PI HOME is installed.

The vendor Bluetooth, Wi-Fi, volume, and demo implementations remain intact and
callable for maintenance. Only the generic on-device app list is suppressed, so
foreground gaps retain the previous frame until ``pocket-earth-launcher`` takes
ownership. The installer is idempotent and keeps one recoverable source backup.
"""

from __future__ import annotations

import argparse
import os
import py_compile
import shutil
import tempfile
from pathlib import Path


DEFAULT_TARGET = Path("/home/pi/Whisplay/daemon/whisplay_daemon.py")
MARKER = "POCKET_EARTH_PI_HOME_GUARD"
NEEDLE = "    def _render_desktop(self):\n        self.last_frame = None\n"
REPLACEMENT = (
    "    def _render_desktop(self):\n"
    f"        # {MARKER}: PI HOME is the only user-facing project switcher.\n"
    "        if \"pocket-earth-launcher\" in self.apps:\n"
    "            return\n"
    "        self.last_frame = None\n"
)


def backup_path(target: Path) -> Path:
    return target.with_suffix(target.suffix + ".pre-pocket-earth")


def guarded(target: Path) -> bool:
    return target.is_file() and MARKER in target.read_text(encoding="utf-8")


def install(target: Path) -> None:
    source = target.read_text(encoding="utf-8")
    if MARKER in source:
        py_compile.compile(str(target), doraise=True)
        return
    if source.count(NEEDLE) != 1:
        raise RuntimeError("unsupported Whisplay daemon: desktop renderer anchor changed")
    backup = backup_path(target)
    if not backup.exists():
        shutil.copy2(target, backup)
    updated = source.replace(NEEDLE, REPLACEMENT, 1)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=target.parent, delete=False) as handle:
        handle.write(updated)
        temporary = Path(handle.name)
    temporary.chmod(target.stat().st_mode)
    os.replace(temporary, target)
    py_compile.compile(str(target), doraise=True)


def restore(target: Path) -> None:
    backup = backup_path(target)
    if not backup.is_file():
        raise RuntimeError(f"backup not found: {backup}")
    shutil.copy2(backup, target)
    py_compile.compile(str(target), doraise=True)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser()
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--install", action="store_true")
    action.add_argument("--check", action="store_true")
    action.add_argument("--restore", action="store_true")
    parser.add_argument("--target", type=Path, default=DEFAULT_TARGET)
    args = parser.parse_args(argv)
    if args.install:
        install(args.target)
    elif args.restore:
        restore(args.target)
        print(f"PI HOME desktop guard was restored from backup in {args.target}")
        return 0
    if not guarded(args.target):
        print(f"PI HOME desktop guard is not installed in {args.target}")
        return 2
    print(f"PI HOME desktop guard is installed in {args.target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
