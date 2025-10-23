# Changelog

## [1.0.0] - 2025-10-23

### Repository Reorganization
- **Organized directory structure** with clear separation of concerns:
  - `assets/` - All static assets (CSS, JS, WASM)
  - `data/` - Content files (972 section markdown files)
  - `content/` - Site content (markdown spec)
  - `docs/` - Documentation files
- **Copied 972 sections locally** from udapaana/vyakarana repository
- **Switched to local content loading** (no longer fetches from GitHub raw)

### Multi-Script Support
- Added **Telugu** (తెలుగు) script support
- Added **Nandinagari** (𑦮) script support
- Updated **Devanagari as default** script
- Proper font loading for all 4 scripts (IAST, Devanagari, Telugu, Nandinagari)
- Script-specific sizing and typography

### Features Added
- **Help/Documentation button** (?) in navigation
- **Markdown Specification guide** accessible via modal
- **Edit suggestion system** with GitHub issue integration
- **Table support** in markdown parser
- **Script selector** with 4 script options
- **Edit modal** with preview functionality

### Bug Fixes
- Fixed naming conflict with `closeHelpModal` (renamed button const to `closeHelpModalBtn`)
- Fixed GitHub issue URL length problem (now uses clipboard + summary)
- Fixed modal Escape key handler to work with multiple modals
- Updated all asset paths to new directory structure

### Documentation
- Comprehensive **README.md** with project overview
- **Markdown specification** guide (content/markdown-spec.md)
- **.gitignore** file for clean repository
- **CHANGELOG.md** (this file)

### Design Improvements
- Clean, manuscript-inspired design
- Improved prose typography (headings, lists, blockquotes)
- Better markdown rendering (frontmatter, horizontal rules, tables)
- Responsive modal design
- Consistent spacing and visual hierarchy

### Technical Improvements
- ES6 module imports properly configured
- Shlesha WASM integration (v0.5.3)
- Local content caching system
- Adjacent section preloading
- URL-based section navigation
- LocalStorage for preferences (script, theme)

### Content Management
- 972 sections organized as `001.md` through `972.md`
- YAML frontmatter with `rule:` field
- Sanskrit markers: `@[...]`, `@deva[...]`, `@: :@`, `@line: :@`
- Table support for paradigms and classifications

## Deployment

**Live Site:** [dukrnkarane.udapaana.in](https://dukrnkarane.udapaana.in)

**Content Source:** [udapaana/vyakarana](https://github.com/udapaana/vyakarana)

**Transliteration:** [Shlesha WASM](https://github.com/udapaana/shlesha)

---

## Development Notes

### Asset Organization
```
Before:
├── script.js
├── styles.css
├── shlesha.js
├── shlesha_bg.wasm
└── content/

After:
├── assets/
│   ├── css/styles.css
│   ├── js/script.js
│   └── wasm/shlesha.js + shlesha_bg.wasm
├── content/
├── data/sections/
└── docs/
```

### Path Updates
- HTML: Updated CSS and JS references
- JS: Updated Shlesha import path and content URL
- Content: Now loads from `data/sections/` instead of GitHub

### Testing
- [x] Local server startup
- [x] Navigation (previous/next/keyboard)
- [x] Script switching (IAST/Devanagari/Telugu/Nandinagari)
- [x] Theme toggle (light/dark)
- [x] Edit modal functionality
- [x] Help modal with markdown spec
- [x] Sanskrit transliteration
- [x] Table rendering
- [x] Mobile responsiveness

### Known Issues
None currently reported.

### Future Enhancements
- [ ] Search functionality
- [ ] Table of contents navigation
- [ ] Bookmarking system
- [ ] Print-friendly CSS
- [ ] Progressive Web App (PWA) support
- [ ] Offline capability
- [ ] Advanced edit diff view
