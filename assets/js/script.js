// Import Shlesha WASM module
import init, { WasmShlesha } from "../wasm/shlesha.js";

// Configuration
const TOTAL_SECTIONS = 986; // 972 core rules + 14 appendix sections
const MIN_SECTION = 1; // Start at section 1 (no section 0)
const CORE_RULES_COUNT = 972; // Number of core rules
const CONTENT_BASE_URL_RULES = "data/rules";
const CONTENT_BASE_URL_APPENDIX = "data/appendix";
const CHAPTERS_URL = "data/chapters.json";

// State
let currentSection = 1; // Start at section 1
let cachedContent = {};
let currentScript = localStorage.getItem("sanskrit-script") || "devanagari";
let transliterator = null;
let chaptersData = null; // Will hold chapter metadata
let currentChapter = null; // Current chapter being viewed
let wordIndexData = null; // Word index for search

// DOM Elements
const contentElement = document.getElementById("content");
const prevButton = document.getElementById("prev-btn");
const nextButton = document.getElementById("next-btn");
const sectionCounter = document.getElementById("section-counter");
const themeToggle = document.getElementById("theme-toggle");
const scriptToggle = document.getElementById("script-toggle");
const scriptMenu = document.getElementById("script-menu");
const editButton = document.getElementById("edit-button");
const editModal = document.getElementById("edit-modal");
const closeModal = document.getElementById("close-modal");
const editTextarea = document.getElementById("edit-textarea");
const previewChangesBtn = document.getElementById("preview-changes");
const createIssueBtn = document.getElementById("create-issue");
const previewContainer = document.getElementById("preview-container");
const previewContent = document.getElementById("preview-content");
const helpButton = document.getElementById("help-button");
const helpModal = document.getElementById("help-modal");
const closeHelpModalBtn = document.getElementById("close-help-modal");
const helpContent = document.getElementById("help-content");
const tocButton = document.getElementById("toc-button");
const tocSidebar = document.getElementById("toc-sidebar");
const closeTocBtn = document.getElementById("close-toc");
const tocContent = document.getElementById("toc-content");
const indexButton = document.getElementById("index-button");
const indexSidebar = document.getElementById("index-sidebar");
const closeIndexBtn = document.getElementById("close-index");
const indexContent = document.getElementById("index-content");
const wordSearch = document.getElementById("word-search");
const searchStats = document.getElementById("search-stats");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");
const viewImageBtn = document.getElementById("view-image-btn");
const imageLightbox = document.getElementById("image-lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const closeLightboxBtn = document.getElementById("close-lightbox");
const lightboxPrevBtn = document.getElementById("lightbox-prev");
const lightboxNextBtn = document.getElementById("lightbox-next");

// Load chapters metadata
async function loadChapters() {
  try {
    const response = await fetch(CHAPTERS_URL);
    if (!response.ok) throw new Error("Failed to load chapters");
    const data = await response.json();
    chaptersData = data.chapters;
    console.log("Chapters loaded:", chaptersData.length);
  } catch (error) {
    console.error("Failed to load chapters:", error);
    // Fallback: treat each section individually
    chaptersData = null;
  }
}

// Find which chapter a section belongs to
function getChapterForSection(sectionNum) {
  if (!chaptersData) return null;

  for (const chapter of chaptersData) {
    const [start, end] = chapter.range;
    if (sectionNum >= start && sectionNum <= end) {
      return chapter;
    }
  }
  return null;
}

// Initialize Shlesha
async function initShlesha() {
  try {
    await init();
    transliterator = new WasmShlesha();
    console.log("Shlesha initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Shlesha:", error);
  }
}

// Theme handling
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  themeToggle.textContent = theme === "light" ? "◐" : "◑";
}

// Script handling
function initScript() {
  updateScriptIcon(currentScript);
  document.body.setAttribute("data-script", currentScript);
}

function updateScriptIcon(script) {
  document.querySelectorAll(".script-char").forEach((char) => {
    char.style.display = char.classList.contains(script) ? "inline" : "none";
  });
}

function changeScript(newScript) {
  if (!transliterator) {
    console.error("Shlesha not initialized");
    return;
  }

  currentScript = newScript;
  localStorage.setItem("sanskrit-script", newScript);
  document.body.setAttribute("data-script", currentScript);
  updateScriptIcon(newScript);
  scriptMenu?.classList.remove("active");

  // Transliterate all existing Sanskrit content
  transliterateContent();
}

// Process cross-references (@ref[N] or @ref[N,M])
function processCrossReferences(text) {
  // Handle @ref[N] and @ref[N,M,O] patterns
  const refPattern = /@ref\[([^\]]+)\]/g;

  return text.replace(refPattern, (match, refs) => {
    // Split by comma for multiple refs
    const refNumbers = refs.split(",").map((r) => r.trim());

    const links = refNumbers.map((ref) => {
      // Check for special prefixes (prosody:, dhatu:, panini:, vartika:, etc.)
      if (ref.includes(":")) {
        const [prefix, value] = ref.split(":", 2);
        if (prefix === "prosody") {
          // Prosody appendix: sections 973-986
          const appendixNum = parseInt(value);
          const sectionNum = CORE_RULES_COUNT + appendixNum;
          return `<a href="#" class="ref-link" data-section="${sectionNum}">Prosody § ${value}</a>`;
        } else if (prefix === "dhatu") {
          // Verb dictionary reference (dhātu)
          return `<span class="dhatu-ref" title="Verb root: ${value}">√${value}</span>`;
        } else if (prefix === "panini") {
          // External Pāṇini reference
          return `<span class="panini-ref-inline" title="Pāṇini ${value}">Pāṇ. ${value}</span>`;
        } else if (prefix === "vartika") {
          // Vārtika reference
          return `<span class="external-ref" title="Vārtika: ${value}">Vārt. ${value}</span>`;
        } else {
          // Other external refs
          return `<span class="external-ref">${ref}</span>`;
        }
      } else {
        // Core grammar rule reference
        const num = parseInt(ref);
        if (!isNaN(num) && num >= 1 && num <= CORE_RULES_COUNT) {
          return `<a href="#" class="ref-link" data-section="${num}">§ ${num}</a>`;
        }
        return ref;
      }
    });

    return links.join(", ");
  });
}

// Process Sanskrit markers - store original in data attributes
function processSanskritMarkers(markdown) {
  let processed = markdown;

  // FIRST: Process block-level markers (so inline markers within them are preserved)

  // Process @deva: ... :@ block markers - SOURCE is Devanagari
  processed = processed.replace(/@deva:([\s\S]*?):@/g, (match, content) => {
    const trimmedContent = content.trim();
    const escapedContent = trimmedContent
      .replace(/"/g, "&quot;")
      .replace(/\n/g, "&#10;");
    // Put placeholder text, transliteration will fill in actual content with <br> tags
    return `<div class="sanskrit-block" data-sanskrit="${escapedContent}" data-source-script="devanagari">__SANSKRIT_BLOCK__</div>`;
  });

  // Process @: ... :@ block markers - SOURCE is IAST
  processed = processed.replace(/@:([\s\S]*?):@/g, (match, content) => {
    const trimmedContent = content.trim();
    const escapedContent = trimmedContent
      .replace(/"/g, "&quot;")
      .replace(/\n/g, "&#10;");
    return `<div class="sanskrit-block" data-sanskrit="${escapedContent}" data-source-script="iast">__SANSKRIT_BLOCK__</div>`;
  });

  // Process @line: ... :@ numbered verse markers - contains inline markers, process content recursively
  processed = processed.replace(/@line:([\s\S]*?):@/g, (match, content) => {
    const trimmedContent = content.trim();

    // Process inline markers within the line content
    let lineContent = trimmedContent;
    lineContent = lineContent.replace(/@deva\[(.*?)\]/g, (m, c) => {
      const escaped = c.replace(/"/g, "&quot;");
      return `<span class="sanskrit-inline" data-sanskrit="${escaped}" data-source-script="devanagari">${c}</span>`;
    });
    lineContent = lineContent.replace(/@\[(.*?)\]/g, (m, c) => {
      const escaped = c.replace(/"/g, "&quot;");
      return `<span class="sanskrit-inline" data-sanskrit="${escaped}" data-source-script="iast">${c}</span>`;
    });

    // Don't store original with markers - just mark as mixed for transliteration
    return `<div class="sanskrit-verse" data-source-script="mixed">${lineContent}</div>`;
  });

  // Process @note[type=X]{content} markers (new curly brace format)
  processed = processed.replace(
    /@note\[type=(\w+)\]\{(.*?)\}/gs,
    (match, type, content) => {
      const trimmedContent = content.trim();
      const className =
        type === "nota-bene" ? "note nota-bene" : `note note-${type}`;
      return `<div class="${className}">${trimmedContent}</div>`;
    },
  );

  // Process @note[type=X]: ... markers (old colon format - for backward compatibility)
  processed = processed.replace(
    /@note\[type=(\w+)\]:\s*(.*?)(?=\n\n|\n(?=[#\[@])|$)/gs,
    (match, type, content) => {
      const trimmedContent = content.trim();
      const className =
        type === "nota-bene" ? "note nota-bene" : `note note-${type}`;
      return `<div class="${className}">${trimmedContent}</div>`;
    },
  );

  // Process @example[deva>>...] and @example[iast>>...] tags
  processed = processed.replace(
    /@example\[(deva|iast)>>([^\]]+)\]:\s*(.+?)(?=\n|$)/g,
    (match, scriptType, text, translation) => {
      const sourceScript = scriptType === "deva" ? "devanagari" : "iast";
      const escaped = text.replace(/"/g, "&quot;");
      return `<span class="example"><span class="sanskrit-inline" data-sanskrit="${escaped}" data-source-script="${sourceScript}">${text}</span>: ${translation.trim()}</span>`;
    },
  );

  // Process @example[grammatical]{...} tags
  processed = processed.replace(
    /@example\[grammatical\]\{([^}]+)\}/g,
    (match, content) => {
      return `<span class="example grammatical">${content}</span>`;
    },
  );

  // SECOND: Process inline markers (after blocks are done)

  // Process @deva[... | iast>>...] paired format - Devanagari primary
  processed = processed.replace(
    /@deva\[([^|\]]+)\s*\|\s*iast>>([^\]]+)\]/g,
    (match, deva, iast) => {
      const escapedDeva = deva.trim().replace(/"/g, "&quot;");
      const escapedIast = iast.trim().replace(/"/g, "&quot;");
      return `<span class="sanskrit-inline paired" data-sanskrit="${escapedDeva}" data-alt-sanskrit="${escapedIast}" data-source-script="devanagari" data-alt-script="iast">${escapedDeva}</span>`;
    },
  );

  // Process @[... | deva>>...] paired format - IAST primary
  processed = processed.replace(
    /@\[([^|\]]+)\s*\|\s*deva>>([^\]]+)\]/g,
    (match, iast, deva) => {
      const escapedIast = iast.trim().replace(/"/g, "&quot;");
      const escapedDeva = deva.trim().replace(/"/g, "&quot;");
      return `<span class="sanskrit-inline paired" data-sanskrit="${escapedIast}" data-alt-sanskrit="${escapedDeva}" data-source-script="iast" data-alt-script="devanagari">${escapedIast}</span>`;
    },
  );

  // Process @deva[...] markers - SOURCE is Devanagari (single format)
  processed = processed.replace(/@deva\[(.*?)\]/g, (match, content) => {
    return `<span class="sanskrit-inline" data-sanskrit="${content}" data-source-script="devanagari">${content}</span>`;
  });

  // Process @[...] markers - SOURCE is IAST (single format)
  processed = processed.replace(/@\[(.*?)\]/g, (match, content) => {
    return `<span class="sanskrit-inline" data-sanskrit="${content}" data-source-script="iast">${content}</span>`;
  });

  return processed;
}

// Transliterate all Sanskrit elements to the current script
function transliterateContent() {
  if (!transliterator) {
    console.warn("Shlesha not initialized");
    return;
  }

  // Transliterate inline Sanskrit
  document.querySelectorAll(".sanskrit-inline").forEach((element) => {
    const original = element.getAttribute("data-sanskrit");
    const sourceScript = element.getAttribute("data-source-script");

    if (sourceScript === currentScript) {
      element.textContent = original;
    } else {
      try {
        const transliterated = transliterator.transliterate(
          original,
          sourceScript,
          currentScript,
        );
        element.textContent = transliterated;
      } catch (e) {
        console.warn("Transliteration failed:", original, e);
        element.textContent = original;
      }
    }
  });

  // Transliterate block Sanskrit
  document.querySelectorAll(".sanskrit-block").forEach((element) => {
    const original = element.getAttribute("data-sanskrit");
    const sourceScript = element.getAttribute("data-source-script");

    // Decode HTML entities (&#10; back to \n)
    const decodedOriginal = original.replace(/&#10;/g, "\n");

    if (sourceScript === currentScript) {
      element.innerHTML = decodedOriginal.split("\n").join("<br>");
    } else {
      try {
        const lines = decodedOriginal.split("\n");
        const transliteratedLines = lines.map((line) =>
          transliterator.transliterate(line, sourceScript, currentScript),
        );
        element.innerHTML = transliteratedLines.join("<br>");
      } catch (e) {
        console.warn("Transliteration failed for block:", decodedOriginal, e);
        element.innerHTML = decodedOriginal.split("\n").join("<br>");
      }
    }
  });

  // Transliterate verse Sanskrit
  document.querySelectorAll(".sanskrit-verse").forEach((element) => {
    const sourceScript = element.getAttribute("data-source-script");

    // For mixed-script verses (like @line: with inline @deva[]),
    // transliterate the individual inline spans instead
    if (sourceScript === "mixed") {
      // Just transliterate the inline spans within this verse
      element.querySelectorAll(".sanskrit-inline").forEach((span) => {
        const spanOriginal = span.getAttribute("data-sanskrit");
        const spanSourceScript = span.getAttribute("data-source-script");

        if (spanSourceScript === currentScript) {
          span.textContent = spanOriginal;
        } else {
          try {
            const transliterated = transliterator.transliterate(
              spanOriginal,
              spanSourceScript,
              currentScript,
            );
            span.textContent = transliterated;
          } catch (e) {
            console.warn("Transliteration failed for inline:", spanOriginal, e);
            span.textContent = spanOriginal;
          }
        }
      });
    } else {
      // Original verse transliteration for non-mixed verses
      const original = element.getAttribute("data-sanskrit");
      if (!original) {
        // No data-sanskrit attribute, skip
        return;
      }

      const lines = original.split("\n");
      if (sourceScript === currentScript) {
        element.innerHTML = lines
          .map((line) => `<div class="verse-line">${line}</div>`)
          .join("");
      } else {
        try {
          const transliteratedLines = lines.map((line) => {
            const transliterated = transliterator.transliterate(
              line,
              sourceScript,
              currentScript,
            );
            return `<div class="verse-line">${transliterated}</div>`;
          });
          element.innerHTML = transliteratedLines.join("");
        } catch (e) {
          console.warn("Transliteration failed for verse:", original, e);
          element.innerHTML = lines
            .map((line) => `<div class="verse-line">${line}</div>`)
            .join("");
        }
      }
    }
  });
}

// Helper function to get image paths for a section (returns array)
function getImagePaths(sectionNum, metadata) {
  if (
    !metadata ||
    !metadata.image_files ||
    !Array.isArray(metadata.image_files)
  ) {
    return [];
  }

  const isAppendix = sectionNum > CORE_RULES_COUNT;
  const imageBasePath = isAppendix
    ? "assets/images/appendix"
    : "assets/images/rules";

  return metadata.image_files.map((file) => `${imageBasePath}/${file}`);
}

// Get first image path (for backward compatibility)
function getImagePath(sectionNum, metadata) {
  const paths = getImagePaths(sectionNum, metadata);
  return paths.length > 0 ? paths[0] : null;
}

// Content loading
async function loadSection(sectionNum) {
  if (cachedContent[sectionNum]) {
    return cachedContent[sectionNum];
  }

  // Determine if this is a core rule or appendix
  const isAppendix = sectionNum > CORE_RULES_COUNT;
  const baseUrl = isAppendix
    ? CONTENT_BASE_URL_APPENDIX
    : CONTENT_BASE_URL_RULES;

  // For appendix, remap section numbers 973-986 to 001-014
  const fileNum = isAppendix ? sectionNum - CORE_RULES_COUNT : sectionNum;
  const paddedNum = String(fileNum).padStart(3, "0");
  const url = `${baseUrl}/${paddedNum}.md`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const markdown = await response.text();
    cachedContent[sectionNum] = markdown;
    return markdown;
  } catch (error) {
    console.error("Error loading section:", error);
    throw error;
  }
}

// Parse frontmatter (YAML to object)
function parseFrontmatter(markdown) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    return {
      frontmatter: null,
      frontmatterRaw: null,
      metadata: {},
      markdown: markdown,
    };
  }

  const frontmatterRaw = match[1];
  const remainingMarkdown = markdown.slice(match[0].length);

  // Parse YAML frontmatter into object
  const metadata = parseYAML(frontmatterRaw);

  return {
    frontmatter: frontmatterRaw,
    frontmatterRaw: frontmatterRaw,
    metadata: metadata,
    markdown: remainingMarkdown,
  };
}

// Simple YAML parser for our frontmatter (supports strings, numbers, arrays)
function parseYAML(yaml) {
  const result = {};
  const lines = yaml.split("\n");
  let currentKey = null;
  let currentArray = null;

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;

    // Array item
    if (line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, "").trim();
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, "");
      if (currentArray) {
        currentArray.push(cleanValue);
      }
      continue;
    }

    // Key-value pair
    const kvMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      const cleanKey = key.trim();
      const cleanValue = value.trim();

      currentKey = cleanKey;

      if (cleanValue === "") {
        // Start of array
        currentArray = [];
        result[cleanKey] = currentArray;
      } else {
        // Simple value
        currentArray = null;
        // Remove quotes and parse
        let parsed = cleanValue.replace(/^["']|["']$/g, "");
        // Try to parse as number
        if (/^\d+$/.test(parsed)) {
          parsed = parseInt(parsed);
        }
        result[cleanKey] = parsed;
      }
    }
  }

  return result;
}

// Parse footnotes - supports multi-line footnotes with indentation
function parseFootnotes(markdown) {
  const footnotes = {};
  const lines = markdown.split("\n");
  const contentLines = [];
  let currentFootnoteId = null;
  let currentFootnoteContent = [];
  let inFootnoteSection = false;

  // Extract footnote definitions [^1]: content
  // Multi-line footnotes: continuation lines are indented with spaces (2 or 4)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const footnoteDefMatch = line.match(/^\[\^(\w+)\]:\s*(.*)$/);

    // Check if we hit a separator (---) after content - marks start of footnote section
    if (line.trim() === "---" && !inFootnoteSection && i > 0) {
      // Check if there are footnote definitions after this separator
      let hasFootnotesAfter = false;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].match(/^\[\^(\w+)\]:/)) {
          hasFootnotesAfter = true;
          break;
        }
      }
      if (hasFootnotesAfter) {
        inFootnoteSection = true;
        continue; // Skip the separator line itself
      }
    }

    if (footnoteDefMatch) {
      // Save previous footnote if any
      if (currentFootnoteId) {
        footnotes[currentFootnoteId] = currentFootnoteContent.join("\n");
      }

      // Start new footnote
      const [, id, content] = footnoteDefMatch;
      currentFootnoteId = id;
      currentFootnoteContent = [content];
      inFootnoteSection = true;
    } else if (currentFootnoteId && line.match(/^  +/)) {
      // Continuation line (indented with 2 or more spaces)
      const indent = line.match(/^( +)/)[1].length;
      currentFootnoteContent.push(line.substring(Math.min(indent, 4))); // Remove up to 4 spaces of indent
    } else if (currentFootnoteId && line.trim() === "") {
      // Empty line within footnote - preserve it
      currentFootnoteContent.push("");
    } else if (!inFootnoteSection) {
      // Regular content line (before footnote section)
      contentLines.push(line);
    } else {
      // After we're in footnote section, non-indented non-footnote lines end current footnote
      if (currentFootnoteId && line.trim() !== "") {
        footnotes[currentFootnoteId] = currentFootnoteContent.join("\n");
        currentFootnoteId = null;
        currentFootnoteContent = [];
      }
      // Don't add to content lines - we're in footnote section
    }
  }

  // Save last footnote if any
  if (currentFootnoteId) {
    footnotes[currentFootnoteId] = currentFootnoteContent.join("\n");
  }

  // Replace footnote references [^1] with superscript links
  let content = contentLines.join("\n");
  content = content.replace(/\[\^(\w+)\]/g, (match, id) => {
    return `<sup class="footnote-ref"><a href="#fn-${id}" id="fnref-${id}">[${id}]</a></sup>`;
  });

  // Build footnotes HTML
  let footnotesHtml = "";
  if (Object.keys(footnotes).length > 0) {
    footnotesHtml = '<ol class="footnote-list">\n';
    for (const [id, fnContent] of Object.entries(footnotes)) {
      // Process footnote content for Sanskrit markers and markup
      let processedFnContent = processSanskritMarkers(fnContent);
      processedFnContent = processCrossReferences(processedFnContent);
      // Parse basic markdown in footnotes (bold, italic, etc.) but skip complex parsing
      processedFnContent = processedFnContent
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code>$1</code>");

      footnotesHtml += `<li id="fn-${id}">${processedFnContent} <a href="#fnref-${id}" class="footnote-backref">↩</a></li>\n`;
    }
    footnotesHtml += "</ol>";
  }

  return {
    content,
    footnotesHtml,
  };
}

// Parse and link Paninian references
function linkPaniniReferences(text) {
  // Match patterns like:
  // "II. 4, 62" or "I. 1, 1" or "VIII. 3, 59"
  // Roman numeral . number , number
  const paniniPattern = /\b([IVX]+)\.\s*(\d+),\s*(\d+)\b/g;

  return text.replace(paniniPattern, (match, chapter, section, sutra) => {
    // Convert Roman numerals to numbers
    const chapterNum = romanToInt(chapter);

    // Format as ashtadhyayi.com URL
    // Format: https://ashtadhyayi.com/sutraani/{chapter}/{section}/{sutra}
    const url = `https://ashtadhyayi.com/sutraani/${chapterNum}/${section}/${sutra}`;

    return `<a href="${url}" class="panini-ref" target="_blank" rel="noopener" title="View in Ashtadhyayi.com">${match}</a>`;
  });
}

// Convert Roman numerals to integers
function romanToInt(s) {
  const romanMap = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let result = 0;
  for (let i = 0; i < s.length; i++) {
    const current = romanMap[s[i]];
    const next = romanMap[s[i + 1]];

    if (next && current < next) {
      result -= current;
    } else {
      result += current;
    }
  }
  return result;
}

// Markdown parsing
function parseMarkdown(markdown) {
  let html = markdown;

  // Parse footnotes first
  const footnoteResult = parseFootnotes(html);
  html = footnoteResult.content;
  const footnotesHtml = footnoteResult.footnotesHtml;

  // Parse tables (before other processing)
  html = parseTables(html);

  // Horizontal rules (but not frontmatter)
  html = html.replace(/^---$/gim, "<hr>");
  html = html.replace(/^\*\*\*$/gim, "<hr>");
  html = html.replace(/^___$/gim, "<hr>");

  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
  html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");
  html = html.replace(/`(.*?)`/gim, "<code>$1</code>");
  html = html.replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>");
  html = html.replace(/^\- (.*$)/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

  const lines = html.split("\n");
  const paragraphs = [];
  let currentParagraph = "";

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (
      trimmedLine.startsWith("<") ||
      trimmedLine === "" ||
      trimmedLine.includes("__TABLE__")
    ) {
      if (currentParagraph) {
        paragraphs.push(`<p>${currentParagraph}</p>`);
        currentParagraph = "";
      }
      if (trimmedLine) {
        paragraphs.push(trimmedLine);
      }
    } else {
      currentParagraph += (currentParagraph ? " " : "") + trimmedLine;
    }
  }

  if (currentParagraph) {
    paragraphs.push(`<p>${currentParagraph}</p>`);
  }

  let result = paragraphs.join("\n");

  // Link Paninian references
  result = linkPaniniReferences(result);

  // Append footnotes if any
  if (footnotesHtml) {
    result += `\n<div class="footnotes">\n${footnotesHtml}\n</div>`;
  }

  return result;
}

// Parse markdown tables
function parseTables(markdown) {
  const lines = markdown.split("\n");
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check if this line looks like a table row (contains |)
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableLines = [line];
      let j = i + 1;

      // Collect all consecutive table lines
      while (
        j < lines.length &&
        lines[j].trim().startsWith("|") &&
        lines[j].trim().endsWith("|")
      ) {
        tableLines.push(lines[j]);
        j++;
      }

      // Parse the table if we have at least 2 rows (header + separator)
      if (tableLines.length >= 2) {
        const tableHtml = parseTableLines(tableLines);
        result.push("__TABLE__" + tableHtml + "__TABLE__");
        i = j;
        continue;
      }
    }

    result.push(line);
    i++;
  }

  return result.join("\n").replace(/__TABLE__([\s\S]*?)__TABLE__/g, "$1");
}

// Parse table lines into HTML
function parseTableLines(lines) {
  if (lines.length < 2) return "";

  const headerLine = lines[0];
  const separatorLine = lines[1];
  const bodyLines = lines.slice(2);

  // Check if second line is a separator (contains dashes and |)
  if (!separatorLine.match(/^\|[\s\-:|]+\|$/)) {
    return ""; // Not a valid table
  }

  // Parse header
  const headerCells = headerLine
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
  const headerHtml = headerCells.map((cell) => `<th>${cell}</th>`).join("");

  // Parse body rows
  const bodyHtml = bodyLines
    .map((line) => {
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());
      return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join("")}</tr>`;
    })
    .join("\n");

  return `<table>
  <thead>
    <tr>${headerHtml}</tr>
  </thead>
  <tbody>
    ${bodyHtml}
  </tbody>
</table>`;
}

// Display chapter (multiple sections)
async function displayChapter(chapter, scrollToSection = null) {
  contentElement.innerHTML = '<div class="loading">Loading chapter...</div>';

  try {
    const [start, end] = chapter.range;
    const sections = [];

    // Chapter header
    let chapterHtml = `
      <div class="chapter-header">
        <h1>Chapter ${chapter.number}: ${chapter.title}</h1>
        <p class="chapter-range">§ ${start}–${end}</p>
      </div>
    `;

    // Load all sections in the chapter
    for (let i = start; i <= end; i++) {
      try {
        const markdown = await loadSection(i);
        const { metadata, markdown: contentMarkdown } =
          parseFrontmatter(markdown);

        // Process and parse
        let processedMarkdown = processSanskritMarkers(contentMarkdown);
        processedMarkdown = processCrossReferences(processedMarkdown);
        const html = parseMarkdown(processedMarkdown);

        // Build section header with title
        const ruleId = metadata.rule_id || `§ ${i}`;
        const title = metadata.title || "";
        const sectionTitle = title ? `${ruleId}: ${title}` : ruleId;

        // Check if image exists for this section
        let imageButton = "";
        const imagePath = getImagePath(i, metadata);
        if (imagePath) {
          imageButton = `<button class="section-image-btn" data-image="${imagePath}" title="View scanned page">📄</button>`;
        }

        // Build topics tags
        let topicsTags = "";
        if (
          metadata.topics &&
          Array.isArray(metadata.topics) &&
          metadata.topics.length > 0
        ) {
          topicsTags = `<div class="topics-tags">${metadata.topics
            .map((topic) => `<span class="topic-tag">${topic}</span>`)
            .join("")}</div>`;
        }

        // Wrap each section with an anchor
        sections.push(`
          <section id="s-${i}" class="grammar-section" data-section="${i}">
            <div class="section-header">
              <div class="section-anchor">
                <a href="#s-${i}" class="section-link">${sectionTitle}</a>
                ${imageButton}
              </div>
              ${topicsTags}
            </div>
            ${html}
          </section>
        `);
      } catch (error) {
        console.warn(`Section ${i} not found:`, error);
        // Add placeholder for missing sections
        sections.push(`
          <section id="s-${i}" class="grammar-section missing" data-section="${i}">
            <div class="section-anchor">
              <a href="#s-${i}" class="section-link">§ ${i}</a>
            </div>
            <p class="missing-notice">Section ${i} not available</p>
          </section>
        `);
      }
    }

    chapterHtml += sections.join("\n");
    contentElement.innerHTML = chapterHtml;

    // Transliterate the newly loaded content
    transliterateContent();

    currentChapter = chapter;
    currentSection = scrollToSection || start;
    updateNavigation();

    // Add click handlers to image buttons and cross-references
    setupImageButtonHandlers();
    setupRefLinkHandlers();

    // Scroll to specific section if requested
    if (scrollToSection) {
      setTimeout(() => {
        const element = document.getElementById(`s-${scrollToSection}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const newUrl = `${window.location.pathname}?section=${scrollToSection || start}`;
    window.history.pushState({ section: scrollToSection || start }, "", newUrl);
  } catch (error) {
    contentElement.innerHTML = `
      <div class="loading">
        <p>Error loading chapter</p>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// Display section (now loads entire chapter)
async function displaySection(sectionNum) {
  const chapter = getChapterForSection(sectionNum);

  if (chapter) {
    // Load entire chapter with anchor to this section
    await displayChapter(chapter, sectionNum);
    currentSection = sectionNum;
  } else {
    // Fallback to single section mode
    await displaySingleSection(sectionNum);
  }
}

// Display single section (fallback)
async function displaySingleSection(sectionNum) {
  contentElement.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const markdown = await loadSection(sectionNum);

    // Parse frontmatter
    const { metadata, markdown: contentMarkdown } = parseFrontmatter(markdown);

    // Process Sanskrit markers and parse markdown
    let processedMarkdown = processSanskritMarkers(contentMarkdown);
    processedMarkdown = processCrossReferences(processedMarkdown);
    const html = parseMarkdown(processedMarkdown);

    // Build section header with title
    const ruleId = metadata.rule_id || `§ ${sectionNum}`;
    const title = metadata.title || "";
    const sectionTitle = title ? `${ruleId}: ${title}` : ruleId;

    // Check if image exists for this section
    let imageButton = "";
    const imagePath = getImagePath(sectionNum, metadata);
    if (imagePath) {
      imageButton = `<button class="section-image-btn" data-image="${imagePath}" title="View scanned page">📄</button>`;
    }

    // Build topics tags
    let topicsTags = "";
    if (
      metadata.topics &&
      Array.isArray(metadata.topics) &&
      metadata.topics.length > 0
    ) {
      topicsTags = `<div class="topics-tags">${metadata.topics
        .map((topic) => `<span class="topic-tag">${topic}</span>`)
        .join("")}</div>`;
    }

    // Wrap with section anchor
    let finalHtml = `
      <section id="s-${sectionNum}" class="grammar-section" data-section="${sectionNum}">
        <div class="section-header">
          <div class="section-anchor">
            <a href="#s-${sectionNum}" class="section-link">${sectionTitle}</a>
            ${imageButton}
          </div>
          ${topicsTags}
        </div>
        ${html}
      </section>
    `;

    contentElement.innerHTML = finalHtml;

    // Transliterate the newly loaded content
    transliterateContent();

    currentSection = sectionNum;

    // Add click handlers to image buttons and cross-references
    setupImageButtonHandlers();
    setupRefLinkHandlers();
    updateNavigation();

    const newUrl = `${window.location.pathname}?section=${sectionNum}`;
    window.history.pushState({ section: sectionNum }, "", newUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    contentElement.innerHTML = `
      <div class="loading">
        <p>Error loading section ${sectionNum}</p>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// Update navigation
function updateNavigation() {
  // Determine if we can go to prev/next chapter
  if (currentChapter) {
    const currentChapterNum = currentChapter.number;
    prevButton.disabled = currentChapterNum <= 1;
    nextButton.disabled = currentChapterNum >= chaptersData.length;

    const [start, end] = currentChapter.range;
    sectionCounter.textContent = `Chapter ${currentChapterNum}: ${currentChapter.title} (§ ${start}–${end})`;
  } else {
    // Fallback to section-based navigation
    prevButton.disabled = currentSection <= MIN_SECTION;
    nextButton.disabled = currentSection >= TOTAL_SECTIONS;
    sectionCounter.textContent = `§ ${currentSection} of ${TOTAL_SECTIONS}`;
  }
}

// Navigation handlers
function goToPrevious() {
  if (currentChapter && chaptersData) {
    // Go to previous chapter
    const prevChapterNum = currentChapter.number - 1;
    if (prevChapterNum >= 1) {
      const prevChapter = chaptersData[prevChapterNum - 1];
      displayChapter(prevChapter);
    }
  } else if (currentSection > MIN_SECTION) {
    displaySection(currentSection - 1);
  }
}

function goToNext() {
  if (currentChapter && chaptersData) {
    // Go to next chapter
    const nextChapterNum = currentChapter.number + 1;
    if (nextChapterNum <= chaptersData.length) {
      const nextChapter = chaptersData[nextChapterNum - 1];
      displayChapter(nextChapter);
    }
  } else if (currentSection < TOTAL_SECTIONS) {
    displaySection(currentSection + 1);
  }
}

// Keyboard navigation
function handleKeyboard(event) {
  if (event.key === "ArrowLeft" && currentSection > MIN_SECTION) {
    goToPrevious();
  } else if (event.key === "ArrowRight" && currentSection < TOTAL_SECTIONS) {
    goToNext();
  }
}

// Get section from URL
function getSectionFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const section = parseInt(params.get("section"));
  return section >= MIN_SECTION && section <= TOTAL_SECTIONS
    ? section
    : MIN_SECTION;
}

// Help Modal Functions
async function openHelpModal() {
  helpModal.classList.add("active");
  document.body.style.overflow = "hidden";

  // Load the markdown spec if not already loaded
  if (helpContent.innerHTML.includes("Loading...")) {
    try {
      const response = await fetch("content/markdown-spec.md");
      if (!response.ok) throw new Error("Failed to load spec");
      const markdown = await response.text();

      // Parse and render the spec
      // DON'T process Sanskrit markers in the help content - it's documentation!
      const { frontmatter, markdown: contentMarkdown } =
        parseFrontmatter(markdown);
      const html = parseMarkdown(contentMarkdown);

      helpContent.innerHTML = html;
    } catch (error) {
      helpContent.innerHTML = `<p class="error">Failed to load markdown specification: ${error.message}</p>`;
    }
  }
}

function closeHelpModal() {
  helpModal.classList.remove("active");
  document.body.style.overflow = "auto";
}

function transliterateHelpContent() {
  if (!transliterator) return;

  // Transliterate Sanskrit in help content
  helpContent
    .querySelectorAll(".sanskrit-inline, .sanskrit-block")
    .forEach((element) => {
      const original = element.getAttribute("data-sanskrit");
      const sourceScript = element.getAttribute("data-source-script");

      if (sourceScript === currentScript) {
        element.textContent = original;
      } else {
        try {
          const transliterated = transliterator.transliterate(
            original,
            sourceScript,
            currentScript,
          );
          element.textContent = transliterated;
        } catch (e) {
          element.textContent = original;
        }
      }
    });
}

// Edit Modal Functions
function openEditModal() {
  const markdown = cachedContent[currentSection];
  if (!markdown) {
    alert("Content not loaded yet. Please try again.");
    return;
  }

  editTextarea.value = markdown;
  editModal.classList.add("active");
  previewContainer.style.display = "none";
  document.body.style.overflow = "hidden";
}

function closeEditModal() {
  editModal.classList.remove("active");
  document.body.style.overflow = "auto";
  previewContainer.style.display = "none";
}

function previewChanges() {
  const editedMarkdown = editTextarea.value;

  // Parse and render the edited markdown
  const { frontmatter, markdown: contentMarkdown } =
    parseFrontmatter(editedMarkdown);
  const processedMarkdown = processSanskritMarkers(contentMarkdown);
  const html = parseMarkdown(processedMarkdown);

  let finalHtml = html;
  if (frontmatter) {
    finalHtml = `<div class="frontmatter">${frontmatter}</div>\n${html}`;
  }

  previewContent.innerHTML = finalHtml;
  transliteratePreviewContent();
  previewContainer.style.display = "block";
}

function transliteratePreviewContent() {
  if (!transliterator) return;

  // Transliterate Sanskrit in preview
  previewContent
    .querySelectorAll(".sanskrit-inline, .sanskrit-block")
    .forEach((element) => {
      const original = element.getAttribute("data-sanskrit");
      const sourceScript = element.getAttribute("data-source-script");

      if (sourceScript === currentScript) {
        element.textContent = original;
      } else {
        try {
          const transliterated = transliterator.transliterate(
            original,
            sourceScript,
            currentScript,
          );
          element.textContent = transliterated;
        } catch (e) {
          element.textContent = original;
        }
      }
    });
}

function createGitHubIssue() {
  const originalMarkdown = cachedContent[currentSection];
  const editedMarkdown = editTextarea.value;

  if (originalMarkdown === editedMarkdown) {
    alert("No changes detected.");
    return;
  }

  const paddedNum = String(currentSection).padStart(3, "0");
  const fileName = `${paddedNum}.md`;

  // Just copy the edited markdown to clipboard
  copyToClipboard(editedMarkdown);

  // Simple alert
  alert(
    `✅ Edited content copied to clipboard!\n\n` +
      `A new GitHub issue will open.\n` +
      `Just paste (Ctrl+V or Cmd+V) your edit and submit.`,
  );

  // Open new issue page with title pre-filled
  const issueTitle = `Edit suggestion for §${currentSection} (${fileName})`;
  const newIssueUrl = `https://github.com/udapaana/vyakarana/issues/new?title=${encodeURIComponent(issueTitle)}`;
  window.open(newIssueUrl, "_blank");

  // Close the modal
  closeEditModal();
}

// Compute a summary of changes
function computeChangeSummary(original, edited) {
  const origLines = original.split("\n");
  const editLines = edited.split("\n");

  let added = 0;
  let removed = 0;
  let modified = 0;

  const maxLen = Math.max(origLines.length, editLines.length);

  for (let i = 0; i < maxLen; i++) {
    const origLine = origLines[i] || "";
    const editLine = editLines[i] || "";

    if (!origLine && editLine) {
      added++;
    } else if (origLine && !editLine) {
      removed++;
    } else if (origLine !== editLine) {
      modified++;
    }
  }

  const summary = [];
  if (added > 0) summary.push(`${added} lines added`);
  if (removed > 0) summary.push(`${removed} lines removed`);
  if (modified > 0) summary.push(`${modified} lines modified`);

  return {
    summary: summary.length > 0 ? summary.join(", ") : "Minor changes",
    added,
    removed,
    modified,
  };
}

// Copy text to clipboard
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Failed to copy to clipboard:", err);
      fallbackCopyToClipboard(text);
    });
  } else {
    fallbackCopyToClipboard(text);
  }
}

// Fallback copy method for older browsers
function fallbackCopyToClipboard(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } catch (err) {
    console.error("Fallback copy failed:", err);
  }
  document.body.removeChild(textarea);
}

// Event listeners
prevButton.addEventListener("click", goToPrevious);
nextButton.addEventListener("click", goToNext);
themeToggle.addEventListener("click", toggleTheme);
document.addEventListener("keydown", handleKeyboard);

scriptToggle?.addEventListener("click", () => {
  scriptMenu?.classList.toggle("active");
});

document.addEventListener("click", (e) => {
  if (!scriptToggle?.contains(e.target) && !scriptMenu?.contains(e.target)) {
    scriptMenu?.classList.remove("active");
  }
});

document.querySelectorAll(".script-option").forEach((option) => {
  option.addEventListener("click", (e) => {
    const script = e.target.getAttribute("data-script");
    if (script) {
      changeScript(script);
    }
  });
});

// TOC event listeners
tocButton?.addEventListener("click", openTOC);
closeTocBtn?.addEventListener("click", closeTOC);

// Close TOC on backdrop click
tocSidebar?.addEventListener("click", (e) => {
  if (e.target === tocSidebar) {
    closeTOC();
  }
});

// Word Index event listeners
indexButton?.addEventListener("click", async () => {
  console.log("Index button clicked");

  // Open the sidebar first
  openWordIndex();

  // Load index on first open if not loaded yet
  if (!wordIndexData) {
    await loadWordIndex();
  }
});
closeIndexBtn?.addEventListener("click", (e) => {
  console.log("Close button clicked", e);
  e.preventDefault();
  e.stopPropagation();
  closeWordIndex();
});
wordSearch?.addEventListener("input", handleWordSearch);

// Close word index on backdrop click
indexSidebar?.addEventListener("click", (e) => {
  if (e.target === indexSidebar) {
    closeWordIndex();
  }
});

// Close sidebars when clicking backdrop
sidebarBackdrop?.addEventListener("click", () => {
  if (tocSidebar?.classList.contains("active")) {
    closeTOC();
  } else if (indexSidebar?.classList.contains("active")) {
    closeWordIndex();
  }
});

// Image viewer is now handled by floating button + lightbox

// Help modal event listeners
helpButton?.addEventListener("click", openHelpModal);
closeHelpModalBtn?.addEventListener("click", closeHelpModal);

// Close help modal on backdrop click
helpModal?.addEventListener("click", (e) => {
  if (e.target === helpModal) {
    closeHelpModal();
  }
});

// Edit modal event listeners
editButton?.addEventListener("click", openEditModal);
closeModal?.addEventListener("click", closeEditModal);
previewChangesBtn?.addEventListener("click", previewChanges);
createIssueBtn?.addEventListener("click", createGitHubIssue);

// Close modal on backdrop click
editModal?.addEventListener("click", (e) => {
  if (e.target === editModal) {
    closeEditModal();
  }
});

// Close modals and sidebar on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (tocSidebar?.classList.contains("active")) {
      closeTOC();
    } else if (indexSidebar?.classList.contains("active")) {
      closeWordIndex();
    } else if (helpModal?.classList.contains("active")) {
      closeHelpModal();
    } else if (editModal?.classList.contains("active")) {
      closeEditModal();
    }
  }
});

window.addEventListener("popstate", (event) => {
  if (event.state && event.state.section) {
    displaySection(event.state.section);
  }
});

// Preload adjacent sections
function preloadAdjacentSections() {
  if (currentSection > 1) {
    loadSection(currentSection - 1).catch(() => {});
  }
  if (currentSection < TOTAL_SECTIONS) {
    loadSection(currentSection + 1).catch(() => {});
  }
}

// TOC Functions
async function loadTOC() {
  try {
    if (!chaptersData) {
      await loadChapters();
    }

    if (!chaptersData || chaptersData.length === 0) {
      throw new Error("Chapters data not available");
    }

    // Build rich HTML from chapters.json with collapsible sections
    let html = '<div class="toc-list">';

    chaptersData.forEach((chapter) => {
      const [start, end] = chapter.range;
      const isAppendix = chapter.number >= 27;
      const chapterId = `chapter-${chapter.number}`;

      html += `
        <div class="toc-chapter ${isAppendix ? "toc-appendix" : ""}" data-chapter="${chapter.number}">
          <div class="toc-chapter-header">
            <button class="toc-expand-btn" data-chapter-id="${chapterId}" aria-label="Expand chapter">
              <span class="expand-icon">›</span>
            </button>
            <div class="toc-chapter-info">
              <div class="toc-chapter-title-row">
                <span class="toc-chapter-number">Chapter ${chapter.number}</span>
                <span class="toc-chapter-title">${chapter.title}</span>
              </div>
              <span class="toc-chapter-range">§ ${start}–${end}</span>
            </div>
          </div>

          <div class="toc-chapter-content" id="${chapterId}" style="display: none;">
            <div class="toc-sections-loading">Loading sections...</div>
          </div>
        </div>
      `;
    });

    html += "</div>";

    tocContent.innerHTML = html;

    // Add click handlers to expand buttons
    tocContent.querySelectorAll(".toc-expand-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const chapterId = btn.getAttribute("data-chapter-id");
        const contentDiv = document.getElementById(chapterId);
        const chapterNum = parseInt(
          btn.closest(".toc-chapter").getAttribute("data-chapter"),
        );

        if (contentDiv.style.display === "none") {
          // Expand
          btn.classList.add("expanded");
          contentDiv.style.display = "block";

          // Load sections if not already loaded
          if (contentDiv.querySelector(".toc-sections-loading")) {
            await loadChapterSections(chapterNum, contentDiv);
          }
        } else {
          // Collapse
          btn.classList.remove("expanded");
          contentDiv.style.display = "none";
        }
      });
    });
  } catch (error) {
    console.error("Failed to load TOC:", error);
    tocContent.innerHTML = `<p class="error">Failed to load Table of Contents: ${error.message}</p>`;
  }
}

// Load individual sections for a chapter
async function loadChapterSections(chapterNum, contentDiv) {
  try {
    const chapter = chaptersData.find((ch) => ch.number === chapterNum);
    if (!chapter) return;

    const [start, end] = chapter.range;
    let sectionsHtml = '<div class="toc-sections">';

    // Load section metadata for each section in the chapter
    for (let sectionNum = start; sectionNum <= end; sectionNum++) {
      try {
        const markdown = await loadSection(sectionNum);
        const { metadata } = parseFrontmatter(markdown);

        const ruleId = metadata.rule_id || `§ ${sectionNum}`;
        const title = metadata.title || "";

        sectionsHtml += `
          <a href="#" class="toc-section-link" data-section="${sectionNum}">
            <span class="toc-section-id">${ruleId}</span>
            ${title ? `<span class="toc-section-title">${title}</span>` : ""}
          </a>
        `;
      } catch (error) {
        console.warn(`Failed to load section ${sectionNum}:`, error);
      }
    }

    sectionsHtml += "</div>";
    contentDiv.innerHTML = sectionsHtml;

    // Add click handlers to section links
    contentDiv.querySelectorAll(".toc-section-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const sectionNum = parseInt(link.getAttribute("data-section"));
        displaySection(sectionNum);
        closeTOC();
      });
    });
  } catch (error) {
    console.error("Failed to load chapter sections:", error);
    contentDiv.innerHTML = '<p class="error">Failed to load sections</p>';
  }
}

function openTOC() {
  tocSidebar.classList.add("active");
  sidebarBackdrop.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeTOC() {
  tocSidebar.classList.remove("active");
  sidebarBackdrop.classList.remove("active");
  document.body.style.overflow = "auto";
}

// Word Index Functions
async function buildWordIndexFromSections() {
  console.log("Building word index from section frontmatter...");

  const wordIndex = {};
  let processedSections = 0;

  // Build index from cached content as sections are loaded
  for (const [sectionNum, markdown] of Object.entries(cachedContent)) {
    const { metadata } = parseFrontmatter(markdown);
    if (!metadata) continue;

    // Extract word_index from metadata
    if (metadata.word_index && Array.isArray(metadata.word_index)) {
      metadata.word_index.forEach((word) => {
        if (!wordIndex[word]) {
          wordIndex[word] = [];
        }
        const secNum = parseInt(sectionNum);
        if (!wordIndex[word].includes(secNum)) {
          wordIndex[word].push(secNum);
        }
      });
    }
    processedSections++;
  }

  // Sort sections for each word
  for (const word in wordIndex) {
    wordIndex[word].sort((a, b) => a - b);
  }

  // Sort words alphabetically
  const sortedWords = Object.keys(wordIndex).sort();
  const sortedIndex = {};
  for (const word of sortedWords) {
    sortedIndex[word] = wordIndex[word];
  }

  wordIndexData = {
    generated: new Date().toISOString(),
    totalWords: Object.keys(sortedIndex).length,
    index: sortedIndex,
    sectionsProcessed: processedSections,
  };

  console.log(
    `Word index built: ${wordIndexData.totalWords} words from ${processedSections} sections`,
  );
  return wordIndexData;
}

async function loadWordIndex() {
  try {
    indexContent.innerHTML = '<div class="loading">Loading word index...</div>';

    const response = await fetch("data/word-index.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    wordIndexData = await response.json();
    console.log(
      `Word index loaded: ${wordIndexData.totalWords} words from ${wordIndexData.sectionsProcessed} sections`,
    );

    displayWordIndex();
  } catch (error) {
    console.error("Error loading word index:", error);
    indexContent.innerHTML = `<p class="loading">Error loading word index: ${error.message}</p>`;
  }
}

function displayWordIndex(filterText = "") {
  if (!wordIndexData) {
    indexContent.innerHTML = '<div class="loading">Loading...</div>';
    return;
  }

  const words = Object.keys(wordIndexData.index);
  let filteredWords = words;

  if (filterText) {
    filteredWords = words.filter((word) => word.includes(filterText));
  }

  if (filteredWords.length === 0) {
    indexContent.innerHTML = '<p class="no-results">No words found</p>';
    searchStats.textContent = "0 results";
    return;
  }

  // Update stats
  searchStats.textContent = `${filteredWords.length} of ${words.length} words`;

  // Display words with their section references
  let html = '<div class="word-list">';

  for (const word of filteredWords.slice(0, 200)) {
    // Limit to 200 for performance
    const sections = wordIndexData.index[word];
    const sectionLinks = sections
      .slice(0, 5)
      .map(
        (s) => `<a href="#" class="section-ref" data-section="${s}">§${s}</a>`,
      )
      .join(", ");

    const moreText =
      sections.length > 5
        ? ` <span class="more">+${sections.length - 5} more</span>`
        : "";

    html += `
      <div class="word-entry">
        <span class="word-devanagari">${word}</span>
        <div class="word-refs">${sectionLinks}${moreText}</div>
      </div>
    `;
  }

  if (filteredWords.length > 200) {
    html += `<p class="more-results">Showing first 200 of ${filteredWords.length} results</p>`;
  }

  html += "</div>";
  indexContent.innerHTML = html;

  // Add click handlers to section references
  indexContent.querySelectorAll(".section-ref").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionNum = parseInt(link.getAttribute("data-section"));
      displaySection(sectionNum);
      closeWordIndex();
    });
  });
}

function handleWordSearch(e) {
  const filterText = e.target.value.trim();
  displayWordIndex(filterText);
}

function openWordIndex() {
  if (indexSidebar) {
    indexSidebar.classList.add("active");
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.classList.add("active");
  }
  document.body.style.overflow = "hidden";

  if (wordSearch) {
    wordSearch.focus();
  }
}

function closeWordIndex() {
  if (indexSidebar) {
    indexSidebar.classList.remove("active");
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.classList.remove("active");
  }
  document.body.style.overflow = "auto";

  if (wordSearch) {
    wordSearch.value = "";
  }
  if (wordIndexData) {
    displayWordIndex(); // Reset to full list
  }
}

// Cross-reference Link Handlers
function setupRefLinkHandlers() {
  // Add click handlers to all cross-reference links
  document.querySelectorAll(".ref-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionNum = parseInt(link.getAttribute("data-section"));
      if (!isNaN(sectionNum)) {
        displaySection(sectionNum);
      }
    });
  });
}

// Image Viewer Functions
function setupImageButtonHandlers() {
  // Add click handlers to all image buttons
  document.querySelectorAll(".section-image-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const imagePath = btn.getAttribute("data-image");
      if (imagePath) {
        openLightbox(imagePath);
      }
    });
  });
}

let currentImagePath = null;
let currentImageMetadata = null;

function openLightbox(imagePath) {
  currentImagePath = imagePath;

  // Get current section's metadata to access image_files list
  const sectionElement = document.querySelector(".grammar-section");
  if (sectionElement) {
    const sectionNum = parseInt(sectionElement.getAttribute("data-section"));
    // Store metadata for navigation
    loadSection(sectionNum).then((markdown) => {
      const { metadata } = parseFrontmatter(markdown);
      currentImageMetadata = {
        sectionNum,
        imageFiles: metadata.image_files || [],
        isAppendix: sectionNum > CORE_RULES_COUNT,
      };
      updateLightboxNavigation();
    });
  }

  lightboxImage.src = imagePath;
  imageLightbox.style.display = "flex";
  document.body.style.overflow = "hidden";
  updateLightboxNavigation();
}

function closeLightbox() {
  imageLightbox.style.display = "none";
  document.body.style.overflow = "auto";
  currentImagePath = null;
  currentImageMetadata = null;
}

function updateLightboxNavigation() {
  if (!currentImageMetadata || !currentImagePath) {
    if (lightboxPrevBtn) lightboxPrevBtn.disabled = true;
    if (lightboxNextBtn) lightboxNextBtn.disabled = true;
    return;
  }

  const { imageFiles, sectionNum, isAppendix } = currentImageMetadata;

  // Find current image index in the image_files array
  const currentFileName = currentImagePath.split("/").pop();
  const currentIndex = imageFiles.indexOf(currentFileName);

  if (currentIndex === -1) {
    // Image not found in metadata, disable navigation
    if (lightboxPrevBtn) lightboxPrevBtn.disabled = true;
    if (lightboxNextBtn) lightboxNextBtn.disabled = true;
    return;
  }

  // Enable/disable buttons based on position in array
  if (lightboxPrevBtn) {
    lightboxPrevBtn.disabled = currentIndex === 0;
  }
  if (lightboxNextBtn) {
    lightboxNextBtn.disabled = currentIndex === imageFiles.length - 1;
  }
}

function navigateLightbox(direction) {
  if (!currentImageMetadata || !currentImagePath) return;

  const { imageFiles, sectionNum, isAppendix } = currentImageMetadata;
  const baseDir = isAppendix ? "assets/images/appendix" : "assets/images/rules";

  // Find current image index
  const currentFileName = currentImagePath.split("/").pop();
  const currentIndex = imageFiles.indexOf(currentFileName);

  if (currentIndex === -1) return;

  // Calculate new index
  const newIndex = currentIndex + direction;

  // Check bounds
  if (newIndex < 0 || newIndex >= imageFiles.length) return;

  // Navigate to new image
  const newImagePath = `${baseDir}/${imageFiles[newIndex]}`;
  currentImagePath = newImagePath;
  lightboxImage.src = newImagePath;
  updateLightboxNavigation();
}

// Event listeners for lightbox
closeLightboxBtn?.addEventListener("click", closeLightbox);
imageLightbox
  ?.querySelector(".lightbox-backdrop")
  ?.addEventListener("click", closeLightbox);

lightboxPrevBtn?.addEventListener("click", () => navigateLightbox(-1));
lightboxNextBtn?.addEventListener("click", () => navigateLightbox(1));

// Keyboard navigation for lightbox
document.addEventListener("keydown", (e) => {
  if (imageLightbox.style.display === "flex") {
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      navigateLightbox(-1);
    } else if (e.key === "ArrowRight") {
      navigateLightbox(1);
    }
  }
});

// Initialize everything
async function main() {
  await initShlesha();
  await loadChapters();
  initTheme();
  initScript();
  currentSection = getSectionFromUrl();
  await displaySection(currentSection);
  await loadTOC();
  setTimeout(preloadAdjacentSections, 1000);
}

main();
