# 100-Topic Character Library & Tree Picker

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences have been confirmed and are baked directly into this implementation plan:
> - **Display Mode**: Interactive modal popup with instant live search and a collapsible category/subcategory tree.
> - **Script Toggle**: Global switch between **Simplified (简体)** and **Traditional (繁體)** character sets directly accessible in the modal header.
> - **Selection Action**: Clicking any 10-character set replaces the current worksheet input text with the 10 characters.
> - **Title Synchronization**: Selecting a topic automatically updates the worksheet title to the topic's localized name (e.g. "天气 / 天氣").
> - **Trigger Placement**: A prominent "Browse 100 Topics" button placed directly above the quick presets in the Controls panel.

---

## 1. Overview & Core Concept

This feature introduces a curated library of **100 themed 10-character practice sets** across 10 core domains (Numbers & Time, Nature, Animals, Family & People, Body & Health, Food & Drink, Home Life, School & Play, Places & Transit, Common Verbs & Opposites). 

Users can browse, search, and toggle between Simplified and Traditional Chinese character sets to instantly generate structured, thematic practice sheets.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Character Library                                  [ 简体 | 繁體 ]  ✕  │
├────────────────────────────────────────────────────────────────────────┤
│  🔍 Search by topic, English name, or character (e.g. "Weather", "雨").. │
├──────────────────────────────┬─────────────────────────────────────────┤
│ CATEGORIES (10)              │ SUBCATEGORIES (10 per category)         │
│                              │                                         │
│ ▷ Numbers, Time & Shapes     │ Weather · 天气                           │
│ ▶ Nature & The World (10)    │ [ 晴 阴 雨 雪 风 雷 电 雾 冰 霜 ]        │
│ ▷ Animals                    │                                         │
│ ▷ Family & People            │ Sky & Space · 天空与太空                 │
│ ▷ Body & Health              │ [ 天 日 月 星 空 云 宇 宙 阳 阴 ]        │
│ ▷ Food & Drink               │                                         │
│ ▷ Home & Daily Life          │ Elements · 元素                         │
│ ▷ School & Play              │ [ 金 木 水 火 土 石 泥 沙 尘 炭 ]        │
│ ▷ Places & Transportation    │                                         │
│ ▷ Common Verbs & Opposites   │ Earth & Land · 地球与陆地                │
│                              │ [ 地 山 石 田 泥 坡 谷 洞 峰 崖 ]        │
└──────────────────────────────┴─────────────────────────────────────────┘
```

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Opening the Library**: User clicks the prominent **"Browse 100 Topics"** button in the Controls sidebar above the quick preset chips.
2. **Browsing Categories**: The modal displays a two-column desktop layout (responsive single-column accordion on mobile). The user clicks a category (e.g. *Animals*) to reveal all 10 curated subtopics.
3. **Switching Scripts**: Toggling the **Simplified / Traditional** segmented control in the modal header dynamically transforms all category names, subcategory names, and character sets in real time.
4. **Instant Search**: Typing in the search bar immediately filters across English titles, Chinese titles, and individual characters across all 100 sets.
5. **Selecting a Set**: Clicking a 10-character card loads the 10 characters into the worksheet, updates the worksheet title to the subcategory name, closes the modal, and renders the worksheet.

### Visual Styling & Discipline
- **Palette**: Clean slate/stone neutral canvas with crimson red accents matching the Hanzi brand (`#dc2626`).
- **Typography**: Clean pairing of sans-serif English labels (`Inter`/system sans) with authentic Chinese typography (`font-heiti`).
- **Character Badges**: Individual characters rendered in high-legibility squares with subtle borders (`w-8 h-8 flex items-center justify-center font-heiti text-base font-medium rounded-md bg-stone-50 border border-stone-200 text-stone-900`).
- **Responsive Layout**: Two-pane split tree on desktop/tablet; stacked collapsible accordion on mobile screens with touch-friendly 44px hit targets.

---

## 3. Technical Architecture & Data Model

### Component Architecture

```
┌────────────────────────────────────────────────────────┐
│                        App.tsx                         │
│  - state: inputText, settings, characterLibraryOpen   │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
            ▼                                ▼
┌───────────────────────┐        ┌───────────────────────────────┐
│      Controls.tsx     │        │   CharacterLibraryModal.tsx   │
│ - "Browse 100 Topics" │        │ - Script toggle (Simp / Trad) │
│ - Quick Presets       │        │ - Live search input filter    │
│ - Size & font sliders │        │ - Category list / tree        │
└───────────────────────┘        │ - 10-character set cards      │
                                 └───────────────┬───────────────┘
                                                 │ reads
                                                 ▼
                                 ┌───────────────────────────────┐
                                 │      characterLibrary.ts      │
                                 │ - 100 structured topic sets   │
                                 │ - EN, Simp, Trad data trees   │
                                 └───────────────────────────────┘
```

### Data Schema (`src/data/characterLibrary.ts`)
```typescript
export interface CharacterSet {
  id: string;
  categoryEn: string;
  categorySimp: string;
  categoryTrad: string;
  subcategoryEn: string;
  subcategorySimp: string;
  subcategoryTrad: string;
  charactersSimp: string[]; // Exactly 10 characters
  charactersTrad: string[]; // Exactly 10 characters
}

export interface CategoryGroup {
  id: string;
  nameEn: string;
  nameSimp: string;
  nameTrad: string;
  iconName: string;
  sets: CharacterSet[];
}
```

---

## 4. Implementation Steps

1. **Create Data Store (`src/data/characterLibrary.ts`)**:
   - Parse and encode the complete 100-row CSV into a structured, type-safe array of 10 categories with 10 subtopics each.
   - Include English, Simplified, and Traditional strings for all categories, subcategories, and 10-character arrays.

2. **Build `CharacterLibraryModal.tsx`**:
   - Implement the backdrop modal with keyboard accessibility (Escape to close, autofocus search).
   - Add the Simplified/Traditional segmented toggle with smooth transitions.
   - Add real-time fuzzy/substring search that matches against English names, Chinese characters, and Pinyin.
   - Build the responsive two-column category explorer with collapsible accordion for mobile.
   - Render the 10 characters in each card with crisp Tianzige-inspired micro-frames.

3. **Integrate into `Controls.tsx`**:
   - Add a styled "Browse 100 Topics" button above the presets row.
   - Wire selection callback to:
     1. Set `inputText` to the 10 characters (`chars.join('')`).
     2. Update `settings.title` to the selected subcategory's localized title.
     3. Close the modal.

4. **Testing & Verification**:
   - Verify modal opens and closes smoothly on both desktop and mobile viewports.
   - Verify all 100 sets correctly populate 10 characters in both Simplified and Traditional modes.
   - Verify search filters properly across English, Simplified, and Traditional terms.
   - Run `lint_applet` and `compile_applet` to confirm zero errors.
