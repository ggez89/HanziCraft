# HanziCraft · Chinese Character Worksheets

[👉 Open the Web App (hanzi.patrickyou.ng)](https://hanzi.patrickyou.ng/)

Create beautiful, printable Chinese handwriting practice sheets in seconds. Designed for learners, parents, and teachers, **HanziCraft** lets you generate custom Tianzige and Mizige worksheets with stroke order diagrams, pīnyīn pronunciation, and tracing guides.

---

## What's New & Key Features

- **Multi-Language Interface (English / 繁體中文 / 简体中文)**:
  - Global language switcher in the navbar to toggle between English, Traditional Chinese (繁體中文), and Simplified Chinese (简体中文).
  - All controls, preview toolbars, modals, settings, and printable page fields dynamically adapt to your selected language.
- **100-Topic Curated Character Library (1,000 Practice Characters)**:
  - Browse 10 core categories (Numbers & Time, Nature, Animals, Family & People, Body & Health, Food & Drink, Home Life, School & Play, Places & Transit, Common Verbs & Opposites).
  - 10 subtopics per category, with 10 carefully curated characters per set.
  - Quick toggle between **Simplified** and **Traditional** character sets.
  - Instant search across English, Simplified, and Traditional character names.
  - Automatically loads the 10 characters and updates your worksheet title to the selected topic.
  - Mobile-optimized: does not auto-focus or pop up the mobile keyboard until you tap the search box.
- **US Letter Paper (8.5 × 11") Precision Layout**:
  - Engineered specifically for standard **US Letter (8.5 × 11")** paper with balanced, centered margins.
  - Practice squares and rows are centered with proportional padding for desktop and home printers.
  - Clean, ghost-free vector PDF export and native browser print dialogue.
- **Laser Printer Optimized Contrast**:
  - High-density Tianzige and Mizige gridlines (dark slate border, prominent cross dashes, and crisp diagonal lines) that print sharply without halftoning or washing out.
  - Darker, high-contrast tracing outlines for faint characters, ensuring clear visibility on standard monochrome laser and inkjet printers while allowing pencil/pen marks to stand out distinctly.
- **Expanded Character Sizes (Up to 5 & 4 Practice Squares)**:
  - From compact (14 mm) and standard school size (18 mm) up to **Extra Jumbo (28 mm, 5 practice squares)** and **Giant (32 mm, 4 practice squares)**.
- **Interactive Stroke Order Practice**:
  - Click on any character in the live preview to inspect step-by-step stroke animations.
  - Switch to the handwriting canvas to trace and practice directly on-screen with mouse or touch.

---

## How to Use It

1. **Enter Your Characters**:
   - Type or paste up to 100 Chinese characters (e.g., `一二三四五` or `你好`).
   - Use quick presets (**1–10**, **Greetings**, **Nature**, **Study**), or click **Browse 100 Themed Character Sets** to choose from 100 curated topics.
2. **Choose Your Font Style**:
   - **Sans-Serif (黑体)**: Clean, uniform modern textbook print.
   - **Brush / Calligraphy (楷体)**: Traditional Chinese brushwork strokes with natural tapers and hooks.
3. **Adjust Your Layout & Sizing**:
   - Slide **Character Size** from compact (14 mm) to standard school size (18 mm), jumbo (24 mm, 6 blank squares), extra jumbo (28 mm, 5 blank squares), or giant (32 mm, 4 blank squares).
   - Character rows automatically spill onto additional pages, while empty rows on each page are filled with blank practice squares so paper is never wasted.
   - Toggle **Faint Trace Outlines**, **Stroke Order Breakdown**, **Pīnyīn Pronunciation**, and **Tianzige Gridlines**.
   - Include or customize student header fields (`姓名：___________` / `日期：___________`).
4. **Print or Save as PDF**:
   - Click **Save as PDF** to generate an off-screen, high-resolution vector PDF file.
   - Click **Print Directly** to open your browser's native print dialogue formatted for US Letter paper.

---

## Technical Details (For Developers)

- **Frontend Architecture**: React 19, TypeScript, and Vite.
- **Styling & Layout**: Tailwind CSS with custom `@media print` rules for US Letter (8.5 × 11") pagination and print staging.
- **Internationalization (i18n)**: Lightweight context-driven translation system supporting English (`en`), Simplified Chinese (`zh-Hans`), and Traditional Chinese (`zh-Hant`) with persistent user preferences.
- **Stroke Order & Vector Data**: Integrates the `hanzi-writer-data` library (Make Me a Hanzi / Arphic Public License). Stroke vectors are served via CDN with local and mirrored fallbacks.
- **Pronunciation Engine**: Powered by `pinyin-pro` for client-side tone-marked romanization.
- **PDF Generation**: `jspdf` combined with `modern-screenshot` for pixel-perfect offscreen Letter-dimension rendering.

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

---

*Made with love for my family by Patrick Young.*
