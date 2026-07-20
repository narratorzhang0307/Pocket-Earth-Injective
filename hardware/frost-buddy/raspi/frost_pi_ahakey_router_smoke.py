#!/usr/bin/env python3
"""Offline smoke checks for the AhaKey input router."""

from pathlib import Path
from tempfile import TemporaryDirectory

from frost_pi_ahakey_router import (
    INPUT_EVENT,
    KEY_ROUTES,
    find_ahakey_event_paths,
    parse_input_events,
    should_route_press,
)


def main() -> int:
    assert KEY_ROUTES == {183: "podcast", 184: "answers", 185: "sunset", 186: "home"}

    encoded = b"".join(
        INPUT_EVENT.pack(1, index, 1, code, 1)
        for index, code in enumerate(KEY_ROUTES)
    )
    events, remainder = parse_input_events(encoded + b"partial")
    assert remainder == b"partial"
    assert [code for event_type, code, value in events if event_type == 1 and value == 1] == list(KEY_ROUTES)

    last_presses: dict[int, float] = {}
    assert should_route_press(183, 1, 10.0, last_presses)
    assert not should_route_press(183, 1, 10.1, last_presses)
    assert not should_route_press(183, 2, 10.5, last_presses)
    assert not should_route_press(183, 0, 10.5, last_presses)
    assert should_route_press(183, 1, 10.5, last_presses)
    assert not should_route_press(99, 1, 11.0, last_presses)

    with TemporaryDirectory() as directory:
        root = Path(directory)
        name = root / "event4" / "device" / "name"
        name.parent.mkdir(parents=True)
        name.write_text("AhaKey 505C\n", encoding="utf-8")
        second = root / "event5" / "device" / "name"
        second.parent.mkdir(parents=True)
        second.write_text("AhaKey 505C Consumer Control\n", encoding="utf-8")
        assert find_ahakey_event_paths(root) == [Path("/dev/input/event4"), Path("/dev/input/event5")]

    print("frost_pi_ahakey_router smoke passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
