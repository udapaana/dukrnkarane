#!/usr/bin/env python3
"""Check each section's page-scan reference against the printed scan header.

The corpus records, per section, which scan leaf it is printed on. Those
references drifted badly — across most of the first half of the book the
recorded leaf ran 2 to 10 ahead of the true one — and the drift was invisible
because the numbers are internally consistent: page_start always equalled the
first image, so nothing looked wrong until the scans themselves were read.

This script checks the references against ground truth read off the scan
headers (data/page-map.csv), so the same drift cannot creep back in unnoticed.
It does not read images; regenerating the CSV means reading the headers again.

    python3 scripts/check-page-map.py

Exits non-zero if any section contradicts the map.
"""
import csv
import os
import re
import sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAP = os.path.join(ROOT, 'data', 'page-map.csv')
RULES = os.path.join(ROOT, 'data', 'rules')


def load_map():
    """leaf -> (first_section, last_section), for rows where both are known."""
    if not os.path.exists(MAP):
        print(f'no page map at {MAP}; nothing to check against', file=sys.stderr)
        sys.exit(0)
    out = {}
    with open(MAP, encoding='utf-8') as fh:
        for row in csv.DictReader(fh):
            first, last = row['first_section'].strip(), row['last_section'].strip()
            if not first:
                continue
            out[int(row['image'])] = (int(first), int(last) if last else int(first))
    return out


def sections_by_leaf(page_map):
    """Invert the map: section -> the leaves it appears on."""
    out = defaultdict(set)
    for leaf, (lo, hi) in page_map.items():
        for n in range(lo, hi + 1):
            out[n].add(leaf)
    return out


def recorded_leaves(n):
    path = os.path.join(RULES, f'{n:03d}.md')
    if not os.path.exists(path):
        return None
    text = open(path, encoding='utf-8').read()
    return {int(x) for x in re.findall(r'"(\d+)\.png"', text)}


def main():
    page_map = load_map()
    expected = sections_by_leaf(page_map)
    problems = []
    checked = 0

    for n, leaves in sorted(expected.items()):
        got = recorded_leaves(n)
        if got is None:
            continue
        checked += 1
        # A header names the sections that BEGIN on that leaf, so a section
        # running over several leaves is not named on the later ones. What
        # matters is the section's first leaf: that is where it starts, and the
        # header there must cover it. Continuation leaves are not checked.
        first = min(got)
        if first in page_map:
            lo, hi = page_map[first]
            if not (lo <= n <= hi):
                problems.append(
                    f'§ {n} starts on leaf {first:03d}, whose header reads § {lo}-{hi}'
                )

    for p in problems:
        print(p)
    print(f'\n{checked} sections checked against {len(page_map)} mapped leaves; '
          f'{len(problems)} contradiction(s)')
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
