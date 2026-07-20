#!/usr/bin/env python3
"""Offline smoke checks for AhaKey reconnect and initial pairing states."""

from pathlib import Path
from tempfile import TemporaryDirectory

import frost_pi_ahakey_reconnect as reconnect


def main() -> int:
    original_state = reconnect.device_state
    original_bluetoothctl = reconnect.bluetoothctl
    try:
        adapter_calls = []
        def fake_bluetoothctl(*args, **kwargs):
            adapter_calls.append(args)
            if args and args[0] == "connect":
                stdout = "Connection successful\n"
            elif args == ("show",):
                stdout = "Powered: no\n"
            else:
                stdout = ""
            return type(
                "Result", (), {
                    "stdout": stdout,
                    "returncode": 0,
                }
            )()
        reconnect.bluetoothctl = fake_bluetoothctl
        reconnect.ensure_adapter_powered()
        assert adapter_calls == [("show",), ("power", "on")]

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
            "inputReady": True,
        }
        assert reconnect.reconnect_once(lambda: False) == "connected"

        reconnect.device_state = lambda: {
            "known": True,
            "paired": True,
            "trusted": True,
            "connected": True,
            "inputReady": False,
        }
        adapter_calls.clear()
        assert reconnect.reconnect_once(lambda: False, lambda: True) == "connected"
        assert adapter_calls == [
            ("disconnect", reconnect.AHAKEY_MAC),
            ("connect", reconnect.AHAKEY_MAC),
        ]

        with TemporaryDirectory() as directory:
            stamp = Path(directory) / "ahakey.configured"
            calls = []
            assert reconnect.ensure_configuration(lambda: calls.append(True) or True, stamp) == "configured-now"
            assert stamp.read_text(encoding="utf-8").strip() == reconnect.CONFIGURATION_VERSION
            assert reconnect.ensure_configuration(lambda: calls.append(True) or True, stamp) == "configured"
            assert calls == [True]

            assert reconnect.ensure_configuration(
                lambda: calls.append(True) or True,
                stamp,
                force=True,
            ) == "configured-now"
            assert calls == [True, True]

            stamp.unlink()
            assert reconnect.ensure_configuration(lambda: False, stamp) == "configuration-retry"
            assert not stamp.exists()
    finally:
        reconnect.device_state = original_state
        reconnect.bluetoothctl = original_bluetoothctl

    print("frost_pi_ahakey_reconnect smoke passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
