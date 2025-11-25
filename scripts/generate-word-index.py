#!/usr/bin/env python3
"""
Generate word index from all section YAML frontmatter.
Extracts word_index entries and creates a JSON file.
"""

import os
import json
import re
from pathlib import Path

def extract_word_index_from_frontmatter(content):
    """Extract word_index list from YAML frontmatter."""
    # Match YAML frontmatter
    frontmatter_match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not frontmatter_match:
        return []

    frontmatter = frontmatter_match.group(1)

    # Extract word_index list
    word_index_match = re.search(r'word_index:\s*\n((?:\s*-\s*.+\n)*)', frontmatter)
    if not word_index_match:
        return []

    # Parse list items
    word_lines = re.findall(r'^\s*-\s*(.+)$', word_index_match.group(1), re.MULTILINE)
    return [word.strip() for word in word_lines]

def build_word_index(rules_dir, appendix_dir):
    """Build complete word index from all sections."""
    word_index = {}
    sections_processed = 0
    CORE_RULES_COUNT = 972

    # Process core rules (sections 1-972)
    for file_path in sorted(Path(rules_dir).glob('*.md')):
        section_num = int(file_path.stem)

        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                words = extract_word_index_from_frontmatter(content)

                for word in words:
                    if word not in word_index:
                        word_index[word] = []
                    if section_num not in word_index[word]:
                        word_index[word].append(section_num)

                if words:
                    sections_processed += 1

        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            continue

    # Process appendix rules (sections 973-986, files 001-014)
    if appendix_dir.exists():
        for file_path in sorted(Path(appendix_dir).glob('*.md')):
            file_num = int(file_path.stem)
            section_num = CORE_RULES_COUNT + file_num  # Map to 973-986

            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    words = extract_word_index_from_frontmatter(content)

                    for word in words:
                        if word not in word_index:
                            word_index[word] = []
                        if section_num not in word_index[word]:
                            word_index[word].append(section_num)

                    if words:
                        sections_processed += 1

            except Exception as e:
                print(f"Error processing {file_path}: {e}")
                continue

    # Sort section numbers for each word
    for word in word_index:
        word_index[word].sort()

    # Sort words alphabetically
    sorted_index = {word: word_index[word] for word in sorted(word_index.keys())}

    return {
        'generated': '2025-11-19',
        'totalWords': len(sorted_index),
        'sectionsProcessed': sections_processed,
        'index': sorted_index
    }

def main():
    # Get the project root directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    rules_dir = project_root / 'data' / 'rules'
    appendix_dir = project_root / 'data' / 'appendix'
    output_file = project_root / 'data' / 'word-index.json'

    print(f"Building word index from:")
    print(f"  Rules: {rules_dir}")
    print(f"  Appendix: {appendix_dir}")

    if not rules_dir.exists():
        print(f"Error: Rules directory not found: {rules_dir}")
        return 1

    # Build the index
    word_index_data = build_word_index(rules_dir, appendix_dir)

    print(f"✓ Processed {word_index_data['sectionsProcessed']} sections")
    print(f"✓ Found {word_index_data['totalWords']} unique words")

    # Write to JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(word_index_data, f, ensure_ascii=False, indent=2)

    print(f"✓ Word index saved to: {output_file}")

    # Show sample entries
    print("\nSample entries:")
    for i, (word, sections) in enumerate(list(word_index_data['index'].items())[:5]):
        print(f"  {word}: {sections}")

    return 0

if __name__ == '__main__':
    exit(main())
