#!/usr/bin/env python3
"""Offline smoke checks for the AhaKey configuration frames."""

import frost_pi_ahakey_configure as configure


def main() -> int:
    assert configure.status_query().hex() == "aabb00ccdd"
    commands = configure.pocket_earth_commands()
    assert len(commands) == 16
    assert commands[1].hex() == "aabb7373030068ccdd"
    assert commands[4].hex() == "aabb7373030169ccdd"
    assert commands[7].hex() == "aabb737303026accdd"
    assert commands[10].hex() == "aabb737303036bccdd"
    assert commands[-4].hex() == "aabb8403000000000000000000ccdd"
    assert commands[-3].hex() == "aabb8501ccdd"
    assert commands[-2].hex() == "aabb9203ccdd"
    assert commands[-1].hex() == "aabb04ccdd"

    original = configure.bluetoothctl
    try:
        configure.bluetoothctl = lambda *args, **kwargs: type(
            "Result", (), {
                "stdout": f"Connected: yes\nUUID: Unknown ({configure.SERVICE_UUID})\n",
                "returncode": 0,
            }
        )()
        assert configure.connected_and_ready()
        configure.ensure_connected()
    finally:
        configure.bluetoothctl = original
    print("frost_pi_ahakey_configure smoke passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
