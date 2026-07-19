#!/usr/bin/env python3
"""Offline checks for Pocket Podcast validation and atomic caching."""

import json
from pathlib import Path
from tempfile import TemporaryDirectory

from frost_pi_podcast_sync import FALLBACK_CACHE_PATH, load_podcast_cache, podcast_url, validate_podcast, write_podcast_cache


def main() -> int:
    bundled = load_podcast_cache(Path("/does/not/exist"), FALLBACK_CACHE_PATH)
    assert bundled["state"] == "ready"
    assert len(bundled["segments"]) == 2
    assert all(len(segment["sources"]) >= 2 for segment in bundled["segments"])
    assert podcast_url("http://127.0.0.1:3010").endswith("/api/knowledge?tool=podcast")

    with TemporaryDirectory() as directory:
        output = Path(directory) / "podcast.json"
        write_podcast_cache(bundled, output)
        assert json.loads(output.read_text(encoding="utf-8"))["podcastId"] == bundled["podcastId"]

    try:
        validate_podcast({"schema": "wrong", "segments": []})
    except ValueError:
        pass
    else:
        raise AssertionError("invalid podcast schema was accepted")
    print("frost_pi_podcast_sync smoke passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
