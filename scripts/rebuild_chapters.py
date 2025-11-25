#!/usr/bin/env python3
"""
Rebuild chapters.json by scanning all rule files and extracting chapter information.
Creates non-overlapping consecutive chapter ranges.
"""

import os
import json
import re
from pathlib import Path
from collections import defaultdict, OrderedDict


def extract_frontmatter(content):
    """Extract YAML frontmatter from markdown content."""
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if not match:
        return None

    frontmatter = {}
    yaml_content = match.group(1)

    # Parse YAML manually (simple parsing for our needs)
    current_key = None
    current_list = None

    for line in yaml_content.split("\n"):
        line = line.rstrip()

        # Skip empty lines
        if not line:
            continue

        # Check for key-value pairs
        if ":" in line and not line.startswith(" ") and not line.startswith("-"):
            if current_key and current_list is not None:
                frontmatter[current_key] = current_list
                current_list = None

            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip().strip("\"'")

            if value:
                frontmatter[key] = value
                current_key = None
            else:
                # This might be a list
                current_key = key
                current_list = []
        elif line.startswith("  - ") and current_key:
            # List item
            item = line.strip("- ").strip().strip("\"'")
            if item:
                current_list.append(item)

    # Add last list if exists
    if current_key and current_list is not None:
        frontmatter[current_key] = current_list

    return frontmatter


def scan_rules_directory(rules_dir):
    """Scan all markdown files in rules directory."""
    sections = {}

    for filename in os.listdir(rules_dir):
        if not filename.endswith(".md"):
            continue

        filepath = os.path.join(rules_dir, filename)

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            frontmatter = extract_frontmatter(content)
            if not frontmatter:
                continue

            rule_number = frontmatter.get("rule_number")
            chapter = frontmatter.get("chapter")
            topics = frontmatter.get("topics", [])

            if rule_number and chapter:
                sections[int(rule_number)] = {
                    "chapter": chapter,
                    "topics": topics if isinstance(topics, list) else [],
                }
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    return sections


def build_chapters(sections):
    """Build chapter structure from sections with non-overlapping consecutive ranges."""
    chapters = []
    chapter_number = 1

    # Process sections in order and group consecutive sections with same chapter
    current_chapter = None
    current_start = None
    current_topics = set()

    for rule_num in sorted(sections.keys()):
        chapter_name = sections[rule_num]["chapter"]
        topics = sections[rule_num]["topics"]

        if chapter_name != current_chapter:
            # Save previous chapter if exists
            if current_chapter is not None:
                chapters.append(
                    {
                        "number": chapter_number,
                        "title": current_chapter,
                        "range": [current_start, rule_num - 1],
                        "topics": sorted(current_topics),
                    }
                )
                chapter_number += 1

            # Start new chapter
            current_chapter = chapter_name
            current_start = rule_num
            current_topics = set(topics)
        else:
            # Continue current chapter
            current_topics.update(topics)

    # Add the last chapter
    if current_chapter is not None:
        chapters.append(
            {
                "number": chapter_number,
                "title": current_chapter,
                "range": [current_start, max(sections.keys())],
                "topics": sorted(current_topics),
            }
        )

    return chapters


def main():
    # Paths
    base_dir = Path(__file__).parent.parent
    rules_dir = base_dir / "data" / "rules"
    output_file = base_dir / "data" / "chapters.json"

    print(f"Scanning rules directory: {rules_dir}")
    sections = scan_rules_directory(rules_dir)
    print(f"Found {len(sections)} sections")

    print("Building chapter structure...")
    chapters = build_chapters(sections)
    print(f"Built {len(chapters)} chapters")

    # Create output structure
    output = {"chapters": chapters}

    # Write to file
    print(f"Writing to {output_file}")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print("Done!")

    # Print summary
    print("\nChapter Summary:")
    print("-" * 80)
    for chapter in chapters:
        rule_count = chapter["range"][1] - chapter["range"][0] + 1
        print(
            f"{chapter['number']:2d}. {chapter['title']:<50s} [{chapter['range'][0]:3d}-{chapter['range'][1]:3d}] ({rule_count:3d} rules)"
        )

    # Verify no overlaps
    print("\nVerifying no overlaps...")
    for i in range(len(chapters) - 1):
        current_end = chapters[i]["range"][1]
        next_start = chapters[i + 1]["range"][0]
        if current_end >= next_start:
            print(f"WARNING: Overlap found between Chapter {i + 1} and {i + 2}")
        elif current_end + 1 != next_start:
            print(
                f"WARNING: Gap found between Chapter {i + 1} (ends {current_end}) and {i + 2} (starts {next_start})"
            )
    print("Verification complete!")


if __name__ == "__main__":
    main()
