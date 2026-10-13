# HanziCraft · Chinese Character Worksheets

[👉 Open the Web App (hanzi.patrickyou.ng)](https://hanzi.patrickyou.ng/)

Create beautiful, printable Chinese handwriting practice sheets in seconds. Designed for learners, parents, and teachers, **HanziCraft** lets you generate custom Tianzige and Mizige worksheets with stroke order diagrams, pīnyīn pronunciation, and tracing guides.

---

## How to Use It

1. **Enter Your Characters**: Type or paste any Chinese characters into the box (e.g. `一二三四五` or `你好`), or click one of the quick preset buttons (**1–10**, **Greetings**, **Nature**, **Study**).
2. **Choose Your Font Style**:
   - **Sans-Serif (黑体)**: Clean, uniform modern textbook print.
   - **Brush / Calligraphy (楷体)**: Traditional Chinese brushwork strokes with natural tapers and hooks.
3. **Adjust Your Layout**:
   - Slide **Character Size** from standard school size (17 mm) to jumbo (24 mm) or compact (12 mm).
   - Check or uncheck **Faint Trace Outlines** to give beginners faint characters to trace over.
   - Toggle **Stroke Order Breakdown** and **Pīnyīn Pronunciation** on or off.
   - Keep or remove student name fields (`姓名：___________`).
4. **Print or Save as PDF**:
   - Click **Print Directly** to send straight to your printer, or use **Generate & Download PDF** / your browser's print dialog to save a clean PDF file.

> 💡 **Interactive Practice Tip**: Click on any character in the live preview to open an interactive stroke-order animator! You can play/pause the stroke sequence or trace it directly on your screen with your mouse or finger.

---

## What You Can Customize

- **Tianzige & Mizige Balance Grids**: Each practice box features cross and diagonal guidelines so learners can master character balance, proportions, and center placement.
- **Progressive Stroke Order Guides**: Shows step-by-step stroke sequences above each row, with the newly added stroke highlighted in red so you always know what comes next.
- **Automatic Tone-Marked Pīnyīn**: Instant, correct pīnyīn pronunciations placed above each character in clear, readable text.
- **Guided Tracing Outlines**: Faint grey guides build muscle memory before students transition into freehand writing on the blank squares.
- **Intelligent Page Layout**: 
  - Standard 17 mm size fits exactly 10 characters on a single A4 page with minimal empty space.
  - If characters spill onto a second page, the remaining rows automatically become empty practice grids so paper is never wasted.
  - The number of practice boxes automatically adjusts to the character size slider so lines never cut off or overflow the page.
- **Standard A4 Printing**: Pixel-perfect margins formatted for standard desktop home and classroom printers.

---

## Technical Details (For Developers)

- **Frontend & App Engine**: Built with React 19, TypeScript, and Vite.
- **Styling & Print Media**: Tailwind CSS with custom `@media print` rules for vector rendering and pagination.
- **Stroke Order & Vector Data**: Integrates the `hanzi-writer-data` library (Make Me a Hanzi / Arphic Public License). Local stroke vectors are bundled in `/data/strokes/` with automatic fallback to the jsDelivr CDN (`https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/`).
- **Pronunciation Engine**: Powered by `pinyin-pro` for client-side tone-marked romanization.
- **Backend / Static Delivery**: Node.js & Express (`server.ts`) serving assets on port 3000.

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

---

*Made with love for my family by Patrick Young.*
