# Contribution Guide | <skt>योगदान-निर्देशिका</skt>

Welcome to the डुकृण्करणे contribution guide! This document explains how to create and edit content for our modern Vedic Sanskrit grammar.

## **Content Creation Philosophy**

### **Core Principles**
- **William Zinsser brevity**: Every word serves a purpose
- **Michael Spivak clarity**: Mathematical precision in explanations
- **Sanskrit-first terminology**: Native terms primary, Western juxtaposed

### **Target Audience**
- Complete beginners to advanced Sanskrit scholars
- Script-agnostic learners (IAST, Devanagari, SLP1)
- Global community with diverse backgrounds
- Traditional and academic learning contexts

---

## **Chapter Creation Guide**

### **File Structure**
Each chapter should follow this naming convention:
```
content/chapter[number].md
```

### **Chapter Template**
```markdown
# <skt>Sanskrit Title</skt> | English Title

Brief introductory paragraph explaining the chapter's focus and importance.

[note type="special"]
**Key Concept**: Highlight the most important learning objective.
[/note]

---

## <skt>Sanskrit Section</skt> | Section Title

### Subsection Title

Content with examples and explanations.

[example]
<skt>Sanskrit example</skt> (romanization) - "Translation"
[/example]

### Cultural Context

Explain traditional usage and cultural significance.

## Next Section

Continue with systematic progression...

---

## Exercises

[exercise type="matching" table="vocabulary-1" count="6" fields="0,2"]
### Exercise [X].1: Practice Title
Match Sanskrit terms with their meanings.
[/exercise]

---

## References

1. Traditional sources
2. Modern scholarship
3. Cultural authorities
```

---

## **Markdown Conventions**

### **Headers**
```markdown
# Chapter Title (H1 - only for chapter start)
## Major Section (H2 - numbered sections like "2.1")
### Subsection (H3 - concepts within sections)
#### Details (H4 - specific points)
##### Notes (H5 - minor details)
###### Labels (H6 - categories/tags)
```

### **Text Formatting**
```markdown
**Bold text** - Important concepts, definitions
*Italic text* - Foreign terms, emphasis
`Code text` - Technical notation, markup examples
```

### **Sanskrit Text**
```markdown
<skt>Sanskrit text</skt> - All Sanskrit should use this tag
<skt>वैदिक-व्याकरणम्</skt> | English equivalent
```

**Do NOT use:**
- Plain Devanagari without `<skt>` tags
- Mixed scripts in same text block
- Western terms as primary (always juxtapose)

### **Lists**
```markdown
## Ordered Lists
1. First item
2. Second item
   - Sub-item (use 3 spaces)
   - Another sub-item

## Unordered Lists
- Bullet point
- Another point
  - Nested point
  - Another nested point

## Definition Lists (for vocabulary)
**<skt>शब्द</skt> (śabda)**
: Word, sound, verbal expression

**<skt>अर्थ</skt> (artha)**  
: Meaning, purpose, object
```

---

## **Special Content Blocks**

### **Note Types**
```markdown
[note type="info"]
General information or helpful tips.
[/note]

[note type="special"]
**Important Cultural Point**: Traditional significance.
[/note]

[note type="warning"]
Common mistakes or important distinctions.
[/note]
```

### **Examples**
```markdown
[example]
**Context**: Brief setup
<skt>Sanskrit text</skt> (romanization)
"English translation"

**Analysis**: Grammatical explanation
[/example]
```

### **Cultural Context Boxes**
```markdown
[cultural]
**Traditional Usage**: How this appears in classical texts
**Ritual Context**: Religious or ceremonial significance  
**Modern Application**: Contemporary relevance
[/cultural]
```

### **Tables**
```markdown
[table id="unique-identifier"]
Sanskrit | IAST | English | Notes
<skt>अग्नि</skt> | agni | Fire | Vedic deity
<skt>वायु</skt> | vāyu | Wind | Life breath
<skt>आकाश</skt> | ākāśa | Space | Fifth element
[/table]
```

---

## **Exercise System**

### **Exercise Types**

#### **1. Matching Exercises**
```markdown
[exercise type="matching" table="vocabulary-basic" count="6" fields="0,2"]
### Exercise 1.1: Basic Vocabulary
Match the Sanskrit terms with their English meanings.
[/exercise]
```

#### **2. Fill-in-the-Blank**
```markdown
[exercise type="fill-blank"]
### Exercise 1.2: Case Endings
Complete the declensions:

1. <skt>राम</skt> + _______ = <skt>रामः</skt> (nominative)
2. <skt>गुरु</skt> + _______ = <skt>गुरुम्</skt> (accusative)
[/exercise]
```

#### **3. Translation Practice**
```markdown
[exercise type="translation"]
### Exercise 1.3: Simple Sentences
Translate into English:

1. <skt>गुरुः पठति</skt>
2. <skt>शिष्यः लिखति</skt>
3. <skt>वृक्षे पक्षी वसति</skt>
[/exercise]
```

#### **4. Accent Practice**
```markdown
[exercise type="accent-practice"]
### Exercise 2.1: Accent Identification
Mark the correct accent on these words:

1. अग्नि (should be: <skt>अ॑ग्नि</skt>)
2. यज्ञ (should be: <skt>यज्ञ॑</skt>)
[/exercise]
```

#### **5. Table Drills**
```markdown
[exercise type="table-drill" table="declension-rama" fields="0,1,2"]
### Exercise 4.1: Declension Practice
Practice declining <skt>राम</skt> in all cases.
[/exercise]
```

### **Exercise Guidelines**
- **Progressive difficulty**: Start simple, build complexity
- **Cultural relevance**: Use meaningful, traditional examples
- **Clear instructions**: Specify exactly what to do
- **Immediate feedback**: Design for automated checking when possible

---

## **Table Creation**

### **Table Guidelines**
```markdown
[table id="descriptive-name"]
Column1 | Column2 | Column3 | Column4
Data1 | Data2 | Data3 | Data4
[/table]
```

### **Table Types**

#### **Vocabulary Tables**
```markdown
[table id="chapter1-vocabulary"]
Sanskrit | IAST | English | Grammar Notes
<skt>धर्म</skt> | dharma | Duty, righteousness | Masculine noun
<skt>अहिंसा</skt> | ahiṃsā | Non-violence | Feminine noun
[/table]
```

#### **Declension Tables**
```markdown
[table id="rama-declension"]
Case | Singular | Dual | Plural
Nominative | <skt>रामः</skt> | <skt>रामौ</skt> | <skt>रामाः</skt>
Accusative | <skt>रामम्</skt> | <skt>रामौ</skt> | <skt>रामान्</skt>
[/table]
```

#### **Verb Conjugation Tables**
```markdown
[table id="bhava-present"]
Person | Singular | Dual | Plural
3rd | <skt>भवति</skt> | <skt>भवतः</skt> | <skt>भवन्ति</skt>
2nd | <skt>भवसि</skt> | <skt>भवथः</skt> | <skt>भवथ</skt>
[/table]
```

---

## **Cultural Integration**

### **Traditional Context**
Always include:
- **Ritual usage**: How terms appear in ceremonies
- **Textual sources**: Classical references when possible
- **Regional variations**: Different traditions' approaches
- **Historical development**: Evolution of usage

### **Respectful Presentation**
- Treat Sanskrit as a living tradition
- Honor traditional authorities
- Apply modern philological methods to traditional systems
- Present cultural context authentically

### **Modern Relevance**
- Connect ancient concepts to contemporary understanding
- Show practical applications
- Maintain scholarly accuracy
- Bridge traditional and academic approaches

---

## **Quality Standards**

### **Content Review Checklist**
- [ ] All Sanskrit text uses `<skt>` tags
- [ ] Native terminology appears first
- [ ] Cultural context provided
- [ ] Examples are authentic and meaningful
- [ ] Exercise instructions are clear
- [ ] Tables have unique IDs
- [ ] Modern philological methods applied appropriately
- [ ] Traditional authorities respected

### **Language Guidelines**
- **Brevity**: Maximum information, minimum words
- **Clarity**: One concept per paragraph
- **Precision**: Accurate terminology throughout
- **Accessibility**: Comprehensible to beginners
- **Authenticity**: Culturally respectful presentation

### **Technical Requirements**
- Valid markdown syntax
- Proper heading hierarchy
- Consistent formatting
- Functional exercise markup
- Accessible table structure

---

## **File Naming Conventions**

### **Content Files**
```
content/chapter[number].md          # Main chapters (1-18)
content/appendix-[name].md          # Appendix materials
content/[special-page].md           # About, roadmap, etc.
```

### **Media Files**
```
media/audio/chapter[X]/[filename].mp3    # Audio pronunciations
media/images/chapter[X]/[filename].jpg   # Illustrations
media/exercises/[exercise-type]/         # Exercise resources
```

### **Table IDs**
```
chapter[X]-[topic]                  # e.g., "chapter1-vocabulary"
[topic]-[subtopic]                  # e.g., "rama-declension"
[category]-[level]                  # e.g., "verbs-basic"
```

---

## **Collaboration Workflow**

### **Content Creation Process**
1. **Plan**: Outline chapter structure and learning objectives
2. **Draft**: Create initial content following templates
3. **Review**: Check against quality standards
4. **Test**: Verify exercises and examples work
5. **Cultural Validation**: Consult traditional authorities
6. **Integration**: Add to website and test functionality

### **Review Criteria**
- **Pedagogical effectiveness**: Does it teach well?
- **Cultural authenticity**: Is it respectful and accurate?
- **Technical functionality**: Do interactive elements work?
- **Accessibility**: Can diverse learners use it?
- **Integration**: Does it fit the overall curriculum?

### **Version Control**
- Each chapter is independently editable
- Chapter titles managed via `content/chapter-titles.md`
- Changes tracked through file modification dates
- Community feedback integrated through review process

---

## **Getting Help**

### **Resources**
- **CLAUDE.md**: Core project philosophy and requirements
- **roadmap.md**: Development priorities and timeline
- **chapter-titles.md**: Current navigation structure
- **about.md**: Project background and goals

### **Community Support**
- **Discussion Forums**: [Coming Soon]
- **Expert Mentorship**: Traditional scholar consultation
- **Peer Review**: Community feedback system
- **Technical Support**: Development team assistance

### **Contributing**
1. **Start Small**: Begin with minor edits or improvements
2. **Follow Templates**: Use established patterns and conventions
3. **Seek Feedback**: Get community input before major changes
4. **Cultural Sensitivity**: Consult traditional authorities
5. **Test Thoroughly**: Verify all functionality works properly

---

*This guide is living documentation. As the project evolves, so will these conventions. Community input is essential for maintaining quality and accessibility.*

**Version**: 1.0.0  
**Last Updated**: [Current Date]  
**Contributors**: उदपान team and community
