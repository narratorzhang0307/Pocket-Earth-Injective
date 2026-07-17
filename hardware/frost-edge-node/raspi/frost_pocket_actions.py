#!/usr/bin/env python3
"""Action sinks for the Frost Edge Node sidecar.

A sink receives the transport-neutral actions produced by the frozen
frost-buddy adapter (`state` / `tts` / `display`, contract v0.1.0) and either
prints them (offline / smoke) or drives the Whisplay hardware (HW-02).

The pi sink deliberately lives behind a lazy import so that HW-01 (consumer
logic) stays testable on any machine without Pi dependencies.
"""

import sys


class EmitJsonSink:
    """Default sink: one action per JSONL line on stdout (smoke / terminal demo)."""

    def __init__(self, adapter, out=None):
        self._adapter = adapter
        self._out = out or sys.stdout

    def dispatch(self, actions):
        for action in actions:
            self._out.write(self._adapter.action_to_json_line(action))
        self._out.flush()


class PiSink:
    """Real device sink (HW-02): maps actions onto Whisplay display / TTS / LED.

    Implemented in `frost_pocket_pi_drivers.py`, which may only talk to the
    sunset-radio base through its public local surfaces (HTTP endpoints or
    read-only module imports). It must not modify sunset-radio files.
    """

    def __init__(self, adapter):
        try:
            import frost_pocket_pi_drivers  # noqa: F401  (HW-02 deliverable)
        except ImportError as exc:
            raise RuntimeError(
                "pi sink needs frost_pocket_pi_drivers.py (HW-02); "
                "use --sink emit-json for offline runs"
            ) from exc
        self._drivers = frost_pocket_pi_drivers
        self._adapter = adapter

    def dispatch(self, actions):
        for action in actions:
            kind = action.get("type")
            if kind == "state":
                self._drivers.apply_state(action)
            elif kind == "tts":
                self._drivers.speak(action)
            elif kind == "display":
                self._drivers.show_card(action)
            else:  # frozen adapter guarantees this never happens
                raise ValueError(f"unknown action type: {kind}")


def make_sink(name, adapter):
    if name == "pi":
        return PiSink(adapter)
    return EmitJsonSink(adapter)
