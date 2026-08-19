#!/usr/bin/env python3
"""Validate custom Sanskrit markup and structure across rule/appendix markdown."""
import glob, re, sys, os

# Exclude danda/double-danda and the Devanagari digits-as-punctuation: they are
# script-neutral punctuation and legitimately appear outside markers.
DEVA = r'[\u0900-\u0963\u0966-\u097F]'  # Devanagari minus danda (0964) and double danda (0965)

def strip_markers(body):
    t = re.sub(r'@deva:.*?:@', '', body, flags=re.S)
    t = re.sub(r'@line:.*?:@', '', t, flags=re.S)
    t = re.sub(r'@:.*?:@', '', t, flags=re.S)
    t = re.sub(r'@deva\[[^\]]*\]', '', t)
    t = re.sub(r'@\[[^\]]*\]', '', t)
    return t

def check(path):
    s = open(path, encoding='utf-8').read()
    m = re.match(r'^---\n(.*?)\n---\n(.*)$', s, re.S)
    if not m:
        return ['no frontmatter']
    fm, body = m.group(1), m.group(2)
    errs = []

    # 1. bare devanagari outside markers (ignore frontmatter word_index)
    bare = re.findall(DEVA + '+', strip_markers(body))
    if bare:
        errs.append(f'bare-devanagari x{len(bare)}: {bare[:3]}')

    # 2. unbalanced markers
    if body.count('@deva[') != len(re.findall(r'@deva\[[^\]]*\]', body)):
        errs.append('unclosed @deva[')
    for tag in ('@deva:', '@line:', '@:'):
        if body.count(tag) != body.count(':@') and tag in body:
            pass  # counted jointly below
    if abs(body.count(':@') - (body.count('@deva:') + body.count('@line:') + body.count('@:'))) > 0:
        errs.append('unbalanced block markers')

    # 3. IAST marker containing devanagari (wrong marker used)
    for m in re.findall(r'@\[([^\]]*)\]', body):
        if re.search(DEVA, m):
            errs.append(f'@[] contains devanagari: {m[:20]}')
            break

    # 4. @deva[] containing no devanagari (wrong marker used)
    for m in re.findall(r'@deva\[([^\]]*)\]', body):
        if m.strip() and not re.search(DEVA, m):
            errs.append(f'@deva[] has no devanagari: {m[:20]}')
            break

    # 5. truncation signals
    lines = [l.rstrip() for l in body.strip().split('\n') if l.strip()]
    if lines and re.search(r'[:,(]$|:—$|—$', lines[-1]):
        errs.append(f'possible truncation: {lines[-1][-40:]}')

    # 6. image files exist
    base = 'assets/images/appendix' if '/appendix/' in path else 'assets/images/rules'
    for img in re.findall(r'"(\d+)\.png"', fm):
        if not os.path.exists(f'{base}/{img}.png'):
            errs.append(f'missing image {img}.png')

    # 7. malformed table rows (inconsistent column count)
    # group contiguous table blocks; only compare widths within one block
    block = []
    for line in body.split('\n') + ['']:
        if line.strip().startswith('|'):
            block.append(line)
        else:
            if len(block) > 1:
                widths = {l.count('|') for l in block}
                if len(widths) > 1:
                    errs.append(f'ragged table {sorted(widths)}: {block[0][:40]}')
                    break
            block = []
    return errs

def main():
    targets = sorted(glob.glob('data/rules/*.md')) + sorted(glob.glob('data/appendix/*.md'))
    total = 0
    for p in targets:
        e = check(p)
        if e:
            total += 1
            print(f'{p}: ' + '; '.join(e))
    print(f'\n{total} file(s) with issues out of {len(targets)}')
    return 1 if total else 0

if __name__ == '__main__':
    sys.exit(main())
