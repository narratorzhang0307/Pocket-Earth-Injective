#!/usr/bin/env python3
"""Offline smoke checks for AhaKey reconnect and initial pairing states."""

import frost_pi_ahakey_reconnect as reconnect


def main() -> int:
    original_state = reconnect.device_state
    try:
        reconnect.device_state = lambda: {
            "known": True,
            "paired": False,
            "trusted": False,
            "connected": False,
        }
        assert reconnect.reconnect_once(lambda: False) == "press-white-pairing-button"
        assert reconnect.reconnect_once(lambda: True) == "paired"

        reconnect.device_state = lambda: {
            "known": True,
            "paired": True,
            "trusted": True,
            "connected": True,
        }
        assert reconnect.reconnect_once(lambda: False) == "connected"
    finally:
        reconnect.device_state = original_state

    print("frost_pi_ahakey_reconnect smoke passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
