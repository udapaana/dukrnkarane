# Markdown Specification

This document describes the enhanced markdown syntax used in the Sanskrit grammar content.

## Sanskrit Markup

### Inline Sanskrit

Use `@[...]` for inline Sanskrit text in IAST transliteration.

**Example:**

```
The rule of @[sandhi] applies when @[a] or @[ā] is followed by @[i].
```

**Rendered:** The rule of sandhi applies when a or ā is followed by i.

---

### Inline Devanagari

Use `@deva[...]` for inline Sanskrit text already in Devanagari.

**Example:**

```
The vowels are @deva[अ], @deva[इ], @deva[उ], @deva[ऋ], and @deva[लृ].
```

**Rendered:** The vowels are अ, इ, उ, ऋ, and लृ.

---

### Block Sanskrit

Use `@: ... :@` for multi-line Sanskrit passages in IAST.

**Example:**

```
@:
paraḥ sannikarṣaḥ saṃhitā
savarṇadīrghāt iko guṇavṛddhī
:@
```

**Rendered:** A formatted block with proper Sanskrit typography and spacing.

---

### Numbered Verse Lines

Use `@line: ... :@` for numbered verse lines.

**Example:**

```
@line:
vartamāne laṭ vede leṭ
laṅ luṅ liṭas tathā
vidhiliṅau leṭ leṭo
'śiṣi sya ca karmani
:@
```

**Rendered:** Each line displayed with numbers and proper verse formatting.

---

### Mixed Sanskrit-English

For interlinear translations, use `#[...]#` for English translations within Sanskrit blocks.

**Example:**

```
@:
sandhiḥ nityā'nityā dhātūpasargayoḥ
#[Sandhi is obligatory with roots and prepositions]#
nityā samāse vākye tu sā vivakṣām apekṣate
#[Obligatory in compounds, optional in sentences]#
:@
```

**Rendered:** Sanskrit with English translations shown as glosses.

---

## Standard Markdown

### Headings

```
# Chapter Title
## Section Title
### Subsection Title
```

### Emphasis

```
**bold text**
*italic text*
`code or technical term`
```

### Lists

**Unordered:**

```
- First item
- Second item
- Third item
```

**Ordered:**

```
1. First step
2. Second step
3. Third step
```

### Blockquotes

```
> This is a quotation or important note.
```

### Horizontal Rules

```
---
```

### Tables

Tables use standard markdown syntax with pipes and dashes:

```
| Organ | Letters |
|-------|---------|
| Throat | a, ā, ka, kha, ga, gha, ṅa, ha |
| Palate | i, ī, ca, cha, ja, jha, ña, ya, śa |
```

---

## Front Matter

Each section file begins with YAML front matter containing metadata.

**Example:**

```
---
rule: §19
title: Vowel Coalescence Rule
---
```

**Fields:**

- `rule` - The rule number (§ number) from the original text
- `title` - A descriptive title for the section

---

## Script Support

The content supports multiple scripts through client-side transliteration:

- **IAST** (International Alphabet of Sanskrit Transliteration) - Romanization
- **Devanagari** (देवनागरी) - Standard Sanskrit script (Default)
- **Telugu** (తెలుగు) - Telugu script for Sanskrit
- **Nandinagari** (𑦮) - Ancient/medieval Kannada-derived script

Use the script selector (क button) in the navigation bar to switch between scripts. Your preference is saved automatically.

---

## Technical Details

### Transliteration Markers

The markers indicate the **source script** of the text:

- `@[...]` - Text is in IAST (will transliterate to other scripts)
- `@deva[...]` - Text is in Devanagari (will transliterate to other scripts)

The system uses [Shlesha](https://github.com/udapaana/shlesha) for accurate Sanskrit transliteration between scripts.

### Character Encoding

All content uses UTF-8 encoding with proper diacritics.

**IAST Diacritics:**

- Long vowels: ā, ī, ū, ṝ
- Retroflex: ṭ, ṭh, ḍ, ḍh, ṇ, ṣ
- Palatal: ś, ñ
- Vocalic: ṛ, ḷ
- Anusvāra: ṃ
- Visarga: ḥ

**Devanagari Range:**

- U+0900 to U+097F (Devanagari Unicode block)
- U+1CD0 to U+1CFF (Vedic Extensions)

---

## Complete Section Example

Here's what a complete section file looks like:

```
---
rule: §19
title: Vowel Coalescence Rule
---

## The Rule

When a simple vowel, short or long, is followed by a similar vowel,
the substitute for them both is the similar long vowel.

### Examples

1. @[daitya] + @[ariḥ] → @[daityāriḥ] (deity-enemy)
2. @[atra] + @[āsīt] → @[atrāsīt] (here-was)
3. @[prati] + @[iti] → @[pratīti] (belief)

### Traditional Citation

@:
paraḥ sannikarṣaḥ saṃhitā
:@

— Pāṇini 1.4.109

### Note

This rule applies in continuous recitation (@[saṃhitā]) where
sounds come into close proximity (@[sannikarṣa]).
```

---

## Marker Syntax Reference

| Marker           | Purpose                    | Example                 |
| ---------------- | -------------------------- | ----------------------- |
| `@[text]`        | Inline IAST Sanskrit       | `@[sandhi]`             |
| `@deva[text]`    | Inline Devanagari Sanskrit | `@deva[संधि]`           |
| `@: text :@`     | Block Sanskrit (IAST)      | Multi-line passages     |
| `@line: text :@` | Numbered verse lines       | Verses with line breaks |
| `#[text]#`       | English gloss              | Within Sanskrit blocks  |

---

## Contributing Guidelines

When suggesting edits:

1. **Preserve markup syntax** - Keep all `@[...]` markers intact
2. **Use proper IAST** - Correct diacritics for Sanskrit transliteration
3. **Maintain front matter** - Keep YAML structure unchanged
4. **Test rendering** - Use preview to verify Sanskrit markers display correctly
5. **One concept per section** - Keep sections focused and clear

Use the **Edit button (✎)** in the navigation to suggest changes via GitHub issues.

---

## Need Help?

- Click the **? Help** button in the navigation for this guide
- View [documentation](https://github.com/udapaana/vyakarana) for detailed markup specification
- Report issues on [GitHub](https://github.com/udapaana/dukrnkarane/issues)

---

**Last updated:** 2025-10-23
**Specification version:** 8.0
**Source:** [udapaana/vyakarana](https://github.com/udapaana/vyakarana)
