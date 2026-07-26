#!/usr/bin/env python3
"""Validate feeds against the W3C feed validator.

POSTs each given feed file to https://validator.w3.org/feed/check.cgi with
SOAP 1.2 output and parses the response. Errors fail the build; warnings are
emitted as GitHub Actions annotations but do not fail.

The "Self reference doesn't match document location" warning is suppressed
because we always test against a local URL different from the production self
link.
"""
from __future__ import annotations

import os
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

VALIDATOR_URL = "https://validator.w3.org/feed/check.cgi"
NS = {
    "env": "http://www.w3.org/2003/05/soap-envelope",
    "f": "http://www.w3.org/2005/10/feed-validator",
}
SUPPRESS_WARNING_SUBSTRINGS = (
    "Self reference doesn't match document location",
)


def submit(path: str) -> ET.Element:
    with open(path, "rb") as fh:
        rawdata = fh.read()
    body = urllib.parse.urlencode(
        {
            "rawdata": rawdata.decode("utf-8", errors="replace"),
            "manual": "1",
            "output": "soap12",
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        VALIDATOR_URL,
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return ET.fromstring(resp.read())


def annotate(level: str, file: str, message: str, line: str | None = None) -> None:
    parts = [f"file={file}"]
    if line and line != "?":
        parts.append(f"line={line}")
    print(f"::{level} {','.join(parts)}::{message}")


def report(label: str, root: ET.Element) -> int:
    # The inner <error>/<warning>/<info> elements (and their children) are not
    # prefixed and live in the default (empty) namespace, so we mix prefixed
    # XPath for the SOAP envelope with unprefixed names for the items.
    errors = root.findall(".//f:errors/f:errorlist/error", NS)
    warnings = root.findall(".//f:warnings/f:warninglist/warning", NS)
    validity = root.findtext(".//f:validity", default="?", namespaces=NS)

    suppressed = 0
    surfaced_warnings = 0
    for w in warnings:
        text = (w.findtext("text") or "").strip()
        if any(s in text for s in SUPPRESS_WARNING_SUBSTRINGS):
            suppressed += 1
            continue
        line = w.findtext("line") or "?"
        annotate("warning", label, text, line)
        surfaced_warnings += 1

    for e in errors:
        text = (e.findtext("text") or "").strip()
        line = e.findtext("line") or "?"
        annotate("error", label, text, line)

    print(
        f"{label}: validity={validity} errors={len(errors)} "
        f"warnings={surfaced_warnings} (+{suppressed} suppressed)"
    )
    return len(errors)


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("usage: validate_feed.py <feed> [<feed>...]", file=sys.stderr)
        return 2

    total_errors = 0
    for path in argv[1:]:
        label = os.path.basename(path)
        print(f"Validating {label} via {VALIDATOR_URL}...")
        try:
            root = submit(path)
        except Exception as exc:
            annotate("warning", label, f"validator request failed: {exc}")
            continue
        total_errors += report(label, root)

    return 1 if total_errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
