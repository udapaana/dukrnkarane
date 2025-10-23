# Sanskrit Marker Implementation

This document describes how Sanskrit text markers are processed and transliterated.

## Marker Types

### 1. `@[...]` - Inline IAST Sanskrit
**Source Script:** IAST (International Alphabet of Sanskrit Transliteration)

**Example:**
```
The rule of @[sandhi] applies when @[a] or @[ā] is followed by @[i].
```

**Behavior:**
- If current script is IAST: displays as-is (italicized)
- If current script is Devanagari: transliterates FROM IAST TO Devanagari

**Output HTML:**
```html
<span class="sanskrit" data-src="iast">sandhi</span>
```

---

### 2. `@deva[...]` - Inline Devanagari Sanskrit
**Source Script:** Devanagari

**Example:**
```
The @deva[अ] of root-nouns ending in @deva[वाह्] is changed to @deva[ओ]
```

**Behavior:**
- If current script is Devanagari: displays as-is
- If current script is IAST: transliterates FROM Devanagari TO IAST

**Output HTML:**
```html
<span class="sanskrit" data-src="devanagari">अ</span>
```

---

### 3. `@: ... :@` - Block Sanskrit (IAST source)
**Source Script:** IAST

**Example:**
```
@:
paraḥ sannikarṣaḥ saṃhitā
vartamāne laṭ
:@
```

**Behavior:**
- Multi-line Sanskrit passages
- Preserves line breaks (rendered with `<br>` tags)
- Transliterates FROM IAST TO current script

**Output HTML:**
```html
<div class="sanskrit-block" data-src="iast">
  paraḥ sannikarṣaḥ saṃhitā<br>vartamāne laṭ
</div>
```

---

### 4. `@line: ... :@` - Numbered Verses (IAST source)
**Source Script:** IAST

**Example:**
```
@line:
vartamāne laṭ vede leṭ
laṅ luṅ liṭas tathā
:@
```

**Behavior:**
- Each line is numbered/separated visually
- Transliterates FROM IAST TO current script

**Output HTML:**
```html
<div class="sanskrit-verse" data-src="iast">
  <div class="verse-line">vartamāne laṭ vede leṭ</div>
  <div class="verse-line">laṅ luṅ liṭas tathā</div>
</div>
```

---

## Transliteration Logic

The key principle: **Markers specify the SOURCE script**, and content is transliterated TO the current display script.

```javascript
// For @[...] (source: IAST)
if (currentScript !== 'iast') {
    transliterate(content, FROM: 'iast', TO: currentScript)
}

// For @deva[...] (source: Devanagari)
if (currentScript !== 'devanagari') {
    transliterate(content, FROM: 'devanagari', TO: currentScript)
}
```

## CSS Styling

Sanskrit content is styled based on the current script setting:

```css
/* IAST styling */
body[data-script="iast"] .sanskrit {
  font-family: 'Noto Serif';
  font-style: italic;
}

/* Devanagari styling */
body[data-script="devanagari"] .sanskrit {
  font-family: 'Noto Sans Devanagari';
  font-style: normal;
}
```

## Library Used

**Sanscript.js** - https://github.com/sanskrit/sanscript.js

Loaded via CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/@indic-transliteration/sanscript@2.3.1/sanscript.min.js"></script>
```

## Testing

To test the implementation:

1. Open any section with Sanskrit content (e.g., section 100)
2. Click the script toggle button (ka/क)
3. Select between IAST and Devanagari
4. Observe that:
   - `@[...]` content transliterates properly
   - `@deva[...]` content transliterates properly
   - Block and verse formatting is preserved
   - Fonts change appropriately
