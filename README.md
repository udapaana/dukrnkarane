# डुकृण्करणे (Dukṛṇkaraṇe)

A modern web interface for Kale's "A Higher Sanskrit Grammar" (1894), featuring real-time Sanskrit transliteration across multiple scripts.

**Live Site:** [dukrnkarane.udapaana.in](https://dukrnkarane.udapaana.in)

## Features

### 🔤 Multi-Script Support

- **IAST** (International Alphabet of Sanskrit Transliteration)
- **Devanagari** (देवनागरी) - Default
- **Telugu** (తెలుగు)
- **Nandinagari** (𑦮)

Real-time transliteration powered by [Shlesha](https://github.com/udapaana/shlesha) WASM.

### 📚 Content Navigation

- 972 sections of comprehensive Sanskrit grammar
- Previous/Next navigation with keyboard shortcuts (← →)
- Section counter and URL-based bookmarking
- Smooth loading with content caching

### ✏️ Community Contribution

- **Edit Suggestions**: Propose improvements to any section
- One-click GitHub issue creation with change summary
- Preview changes before submitting
- Markdown specification guide included

### 🎨 Modern Interface

- Clean, manuscript-inspired design
- Light/Dark theme toggle
- Mobile-responsive layout
- Proper Sanskrit typography with Noto fonts

### 📖 Markdown Features

- Sanskrit markup: `@[...]` (IAST), `@deva[...]` (Devanagari)
- Block Sanskrit: `@: ... :@`
- Verse lines: `@line: ... :@`
- Full markdown support (tables, lists, code blocks, etc.)
- YAML frontmatter for metadata

## Repository Structure

```
dukrnkarane/
├── index.html              # Main HTML file
├── assets/
│   ├── css/
│   │   └── styles.css      # All styling
│   ├── js/
│   │   └── script.js       # Main application logic
│   └── wasm/
│       ├── shlesha.js      # Shlesha transliteration (WASM)
│       └── shlesha_bg.wasm # WASM binary
├── content/
│   └── markdown-spec.md    # Markdown specification guide
├── data/
│   └── sections/           # 972 grammar sections (001.md - 972.md)
├── docs/
│   ├── MARKERS.md          # Sanskrit marker documentation
│   └── IMPLEMENTATION.md   # Technical implementation notes
└── README.md               # This file
```

## Local Development

### Prerequisites

- Python 3 (for local server)
- Modern web browser with ES6 module support

### Running Locally

```bash
# Clone the repository
git clone https://github.com/udapaana/dukrnkarane.git
cd dukrnkarane

# Start a local server
python3 -m http.server 8000
# or
uv run -m http.server

# Open in browser
open http://localhost:8000
```

### Content Updates

Content is sourced from [udapaana/vyakarana](https://github.com/udapaana/vyakarana). To update:

```bash
# From vyakarana repo root
git pull

# Copy updated sections
cp -r final/* /path/to/dukrnkarane/data/sections/
```

## Technology Stack

## Technical Details

### Transliteration

The site uses the [Sanscript](https://github.com/sanskrit/sanscript.js) library to transliterate Sanskrit text between:

- **IAST** (International Alphabet of Sanskrit Transliteration) - default
- **Devanagari** (देवनागरी script)

The selected script preference is saved in browser localStorage and persists across sessions.

### Fonts

- **IAST**: Noto Serif with proper diacritics support
- **Devanagari**: Noto Sans Devanagari
- **Body Text**: System fonts for optimal readability

### Frontend

- **Vanilla JavaScript** (ES6 modules)
- **CSS3** with CSS variables for theming
- **HTML5** with semantic markup

### Libraries

- **Shlesha** (v0.5.3) - Sanskrit transliteration via WebAssembly
- **Google Fonts** - Noto Serif (IAST, Devanagari, Telugu), Noto Sans Nandinagari

### Content Format

- **Markdown** with custom Sanskrit markup
- **YAML frontmatter** for metadata
- **UTF-8** encoding with full Indic script support

## Contributing

### Suggesting Edits

1. Navigate to any section on [dukrnkarane.udapaana.in](https://dukrnkarane.udapaana.in)
2. Click the **✎ Edit** button
3. Make your changes in the markdown editor
4. Preview changes to verify formatting
5. Click **Create GitHub Issue**
6. Paste the copied content in a comment

### Development Contributions

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Test locally
5. Commit with clear messages
6. Push and create a Pull Request

## Markdown Specification

Click the **? Help** button on the site or see [content/markdown-spec.md](content/markdown-spec.md) for:

- Sanskrit markup syntax
- Marker usage (`@[...]`, `@deva[...]`, `@: :@`, `@line: :@`)
- Frontmatter structure
- Standard markdown features
- Examples and best practices

## Project Goals

### Core Mission

Create a comprehensive, modern, and accessible interface for Vedic Sanskrit grammar that:

- Preserves traditional knowledge with scholarly accuracy
- Enables multi-script accessibility for global learners
- Facilitates community contributions and improvements
- Provides a reference implementation for Sanskrit digital humanities

### Decolonized Approach

- Sanskrit-first terminology
- Traditional grammatical concepts enhanced by modern technology
- Culturally authentic presentation
- Native script support for diverse learning communities

## Source Material

**Original Work:** "A Higher Sanskrit Grammar" by Mahadeo Ramakrishna Kale (1894)

**Content Source:** [udapaana/vyakarana](https://github.com/udapaana/vyakarana)

**Digital Processing:**

- Extracted from original PDF
- Enhanced with AST-ready markup
- 972 sections with YAML frontmatter
- Comprehensive Sanskrit marker system

## Browser Support

### Tested Browsers

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Requirements

- ES6 module support
- WebAssembly support
- CSS Grid and Flexbox
- LocalStorage API
- Fetch API

## Performance

- **Initial Load:** ~800KB (including WASM)
- **Content Caching:** Adjacent sections preloaded
- **Font Loading:** Optimized with `font-display: swap`
- **Lazy Loading:** Markdown spec loaded on demand

## License

This interface is released under the **MIT License**.

Original content ("A Higher Sanskrit Grammar" by M.R. Kale, 1894) is in the public domain.

## Acknowledgments

- **M.R. Kale** - Original grammar text (1894)
- **Shlesha** - Sanskrit transliteration engine
- **Udapaana** - Content digitization and markup
- **Google Fonts** - Noto font families
- **Contributors** - Community improvements and corrections

## Links

- **Live Site:** [dukrnkarane.udapaana.in](https://dukrnkarane.udapaana.in)
- **Content Repo:** [udapaana/vyakarana](https://github.com/udapaana/vyakarana)
- **Shlesha:** [udapaana/shlesha](https://github.com/udapaana/shlesha)
- **Issues:** [GitHub Issues](https://github.com/udapaana/dukrnkarane/issues)

## Contact

For questions, suggestions, or collaboration:

- Open an issue on GitHub
- Visit [udapaana.in](https://udapaana.in)

---

**Version:** 1.0.0
**Last Updated:** 2025-10-23
**Status:** Active Development
