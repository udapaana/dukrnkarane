#!/usr/bin/env node
/**
 * Build searchable Devanagari word index from all section files
 */

const fs = require('fs');
const path = require('path');

const SECTIONS_DIR = path.join(__dirname, '../data/sections');
const OUTPUT_FILE = path.join(__dirname, '../data/word-index.json');

// Parse YAML frontmatter to extract word_index
function extractWordIndex(markdown) {
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return [];

  const frontmatter = frontmatterMatch[1];
  const words = [];

  // Simple YAML parsing for word_index array
  let inWordIndex = false;
  const lines = frontmatter.split('\n');

  for (const line of lines) {
    if (line.trim() === 'word_index:') {
      inWordIndex = true;
      continue;
    }

    if (inWordIndex) {
      // Check if we've moved to another field
      if (line.match(/^[a-z_]+:/) && !line.startsWith('  ')) {
        inWordIndex = false;
        continue;
      }

      // Extract word from list item
      const wordMatch = line.match(/^\s*-\s*(.+)$/);
      if (wordMatch) {
        words.push(wordMatch[1].trim());
      }
    }
  }

  return words;
}

// Extract section number from filename
function getSectionNumber(filename) {
  const match = filename.match(/^(\d+)\.md$/);
  return match ? parseInt(match[1]) : null;
}

// Build the index
async function buildIndex() {
  console.log('Building Devanagari word index...');

  const wordIndex = {}; // { word: [section1, section2, ...] }
  const files = fs.readdirSync(SECTIONS_DIR).filter(f => f.endsWith('.md'));

  let processed = 0;

  for (const file of files) {
    const sectionNum = getSectionNumber(file);
    if (!sectionNum) continue;

    const filePath = path.join(SECTIONS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const words = extractWordIndex(content);

    // Add words to index
    for (const word of words) {
      if (!wordIndex[word]) {
        wordIndex[word] = [];
      }
      if (!wordIndex[word].includes(sectionNum)) {
        wordIndex[word].push(sectionNum);
      }
    }

    processed++;
    if (processed % 100 === 0) {
      console.log(`Processed ${processed}/${files.length} files...`);
    }
  }

  // Sort sections for each word
  for (const word in wordIndex) {
    wordIndex[word].sort((a, b) => a - b);
  }

  // Sort words alphabetically (Devanagari)
  const sortedWords = Object.keys(wordIndex).sort((a, b) => {
    return a.localeCompare(b, 'hi');
  });

  const sortedIndex = {};
  for (const word of sortedWords) {
    sortedIndex[word] = wordIndex[word];
  }

  // Write to file
  const output = {
    generated: new Date().toISOString(),
    totalWords: Object.keys(sortedIndex).length,
    index: sortedIndex
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log(`\n✅ Word index built successfully!`);
  console.log(`   Total unique words: ${output.totalWords}`);
  console.log(`   Output: ${OUTPUT_FILE}`);
}

buildIndex().catch(err => {
  console.error('Error building word index:', err);
  process.exit(1);
});
