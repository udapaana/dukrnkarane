// Import Shlesha WASM module
import init, { WasmShlesha } from "../wasm/shlesha.js";

// Configuration
const TOTAL_SECTIONS = 972;
const MIN_SECTION = 0; // Section 0 is the introduction
const CONTENT_BASE_URL = "data/sections";

// State
let currentSection = 0; // Start at section 0 (introduction)
let cachedContent = {};
let currentScript = localStorage.getItem("sanskrit-script") || "devanagari";
let transliterator = null;

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

// Process Sanskrit markers - store original in data attributes
function processSanskritMarkers(markdown) {
  let processed = markdown;

  // Process @deva[...] markers - SOURCE is Devanagari
  processed = processed.replace(/@deva\[(.*?)\]/g, (match, content) => {
    return `<span class="sanskrit-inline" data-sanskrit="${content}" data-source-script="devanagari">${content}</span>`;
  });

  // Process @[...] markers - SOURCE is IAST
  processed = processed.replace(/@\[(.*?)\]/g, (match, content) => {
    return `<span class="sanskrit-inline" data-sanskrit="${content}" data-source-script="iast">${content}</span>`;
  });

  // Process @: ... :@ block markers - SOURCE is IAST
  processed = processed.replace(/@:([\s\S]*?):@/g, (match, content) => {
    const trimmedContent = content.trim();
    return `<div class="sanskrit-block" data-sanskrit="${trimmedContent}" data-source-script="iast">${trimmedContent}</div>`;
  });

  // Process @line: ... :@ numbered verse markers - SOURCE is IAST
  processed = processed.replace(/@line:([\s\S]*?):@/g, (match, content) => {
    const trimmedContent = content.trim();
    const lines = trimmedContent.split("\n");
    const lineHtml = lines
      .map((line) => `<div class="verse-line">${line}</div>`)
      .join("");
    return `<div class="sanskrit-verse" data-sanskrit="${trimmedContent}" data-source-script="iast">${lineHtml}</div>`;
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

    if (sourceScript === currentScript) {
      element.innerHTML = original.split("\n").join("<br>");
    } else {
      try {
        const lines = original.split("\n");
        const transliteratedLines = lines.map((line) =>
          transliterator.transliterate(line, sourceScript, currentScript),
        );
        element.innerHTML = transliteratedLines.join("<br>");
      } catch (e) {
        console.warn("Transliteration failed for block:", original, e);
        element.innerHTML = original.split("\n").join("<br>");
      }
    }
  });

  // Transliterate verse Sanskrit
  document.querySelectorAll(".sanskrit-verse").forEach((element) => {
    const original = element.getAttribute("data-sanskrit");
    const sourceScript = element.getAttribute("data-source-script");

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
  });
}

// Content loading
async function loadSection(sectionNum) {
  const paddedNum = String(sectionNum).padStart(3, "0");
  const url = `${CONTENT_BASE_URL}/${paddedNum}.md`;

  if (cachedContent[sectionNum]) {
    return cachedContent[sectionNum];
  }

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

// Parse frontmatter
function parseFrontmatter(markdown) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = markdown.match(frontmatterRegex);

  if (match) {
    const frontmatterContent = match[1];
    const remainingMarkdown = markdown.slice(match[0].length);
    return {
      frontmatter: frontmatterContent,
      markdown: remainingMarkdown,
    };
  }

  return {
    frontmatter: null,
    markdown: markdown,
  };
}

// Markdown parsing
function parseMarkdown(markdown) {
  let html = markdown;

  // Parse tables first (before other processing)
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

  return paragraphs.join("\n");
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

  return result.join("\n").replace(/__TABLE__(.*?)__TABLE__/g, "$1");
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

// Display section
async function displaySection(sectionNum) {
  contentElement.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const markdown = await loadSection(sectionNum);

    // Parse frontmatter
    const { frontmatter, markdown: contentMarkdown } =
      parseFrontmatter(markdown);

    // Process Sanskrit markers and parse markdown
    const processedMarkdown = processSanskritMarkers(contentMarkdown);
    const html = parseMarkdown(processedMarkdown);

    // Add frontmatter if present
    let finalHtml = html;
    if (frontmatter) {
      finalHtml = `<div class="frontmatter">${frontmatter}</div>\n${html}`;
    }

    contentElement.innerHTML = finalHtml;

    // Transliterate the newly loaded content
    transliterateContent();

    currentSection = sectionNum;
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
  prevButton.disabled = currentSection <= MIN_SECTION;
  nextButton.disabled = currentSection >= TOTAL_SECTIONS;

  // Show "Introduction" for section 0, otherwise show section number
  const sectionLabel =
    currentSection === 0 ? "Introduction" : `Section ${currentSection}`;
  sectionCounter.textContent = `${sectionLabel} of ${TOTAL_SECTIONS}`;
}

// Navigation handlers
function goToPrevious() {
  if (currentSection > MIN_SECTION) {
    displaySection(currentSection - 1);
  }
}

function goToNext() {
  if (currentSection < TOTAL_SECTIONS) {
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

  // Create a diff summary
  const changes = computeChangeSummary(originalMarkdown, editedMarkdown);

  // Create the issue body with a summary
  const issueTitle = `Edit suggestion for section ${currentSection} (${fileName})`;
  const issueBody = `## Edit Suggestion for Section ${currentSection}

**File:** \`final/${fileName}\`
**Source:** ${window.location.href}

### Summary of Changes
${changes.summary}

### Instructions for Reviewer

The contributor has suggested edits to this section. To review:

1. **Download the edited version:**
   - The edited content will be copied to the contributor's clipboard
   - They should paste it in a comment below

2. **Review changes:**
   - Compare with current \`final/${fileName}\`
   - Verify Sanskrit transliteration markers are correct
   - Check formatting and accuracy

3. **Apply if approved:**
   - Replace content in \`final/${fileName}\`

---

### Statistics
- Original: ${originalMarkdown.length} chars
- Edited: ${editedMarkdown.length} chars
- Change: ${editedMarkdown.length > originalMarkdown.length ? "+" : ""}${editedMarkdown.length - originalMarkdown.length} chars
- Lines: ${changes.added > 0 ? "+" + changes.added : ""} ${changes.removed > 0 ? "-" + changes.removed : ""} ${changes.modified > 0 ? "~" + changes.modified : ""}

---
*Edit suggestion via dukrnkarane.udapaana.com*`;

  // Encode for GitHub URL
  const githubUrl = `https://github.com/udapaana/vyakarana/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}`;

  // Always copy content to clipboard for user to paste
  copyToClipboard(editedMarkdown);

  // Open in new tab
  window.open(githubUrl, "_blank");

  // Notify user
  alert(
    "Edited content has been copied to your clipboard. Please paste it in a comment on the GitHub issue.",
  );

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

// Close modals on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (helpModal?.classList.contains("active")) {
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

// Initialize everything
async function main() {
  await initShlesha();
  initTheme();
  initScript();
  currentSection = getSectionFromUrl();
  await displaySection(currentSection);
  setTimeout(preloadAdjacentSections, 1000);
}

main();
