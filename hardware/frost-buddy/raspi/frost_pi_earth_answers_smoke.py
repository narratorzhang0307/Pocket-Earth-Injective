#!/usr/bin/env python3
"""Offline checks for the annual Earth Answers state model."""

import json
from datetime import datetime
from pathlib import Path
from tempfile import TemporaryDirectory

from frost_pi_earth_answers import EarthAnswerState, load_answers


def main() -> int:
    answers = load_answers()
    assert len(answers) == 365
    assert len({item["date"] for item in answers}) == 365

    with TemporaryDirectory() as directory:
        state_path = Path(directory) / "state.json"
        state = EarthAnswerState(answers, state_path)
        state.sync_day(datetime(2026, 7, 18).astimezone())
        assert state.selected["date"] == "07-18"
        assert not state.today_revealed
        assert state.start_roll()
        state.set_roll_frame(6)
        assert state.phase == "rolling" and state.dice_value == 6
        state.reveal_today()
        assert state.today_revealed and state.phase == "revealed"
        state.previous()
        assert state.selected["date"] == "07-17"
        assert json.loads(state_path.read_text(encoding="utf-8"))["revealedDates"] == ["2026-07-18"]

    print("frost_pi_earth_answers smoke passed; 365 reviewed entries")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
