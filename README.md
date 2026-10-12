# Chinese Character Worksheets

[View App](https://hanzi.patrickyou.ng/)

A professional, highly customizable Chinese character handwriting and stroke practice worksheet generator designed for learners, educators, and parents. Create high-quality, printable Tianzige and Mizige practice sheets in seconds with precise control over stroke order animations, pinyin pronunciation, gridline styles, character sizing, and typography.

## Features

- **Comprehensive Character Support & Offline Data**:
  - **9,500+ Chinese Characters**: Bundles full stroke vector definitions, stroke counts, and stroke medians locally from the `hanzi-writer-data` library—no external API dependencies required.
  - **Self-Contained Data Pipeline**: All stroke vector datasets and pronunciation models are stored directly in the repository (`data/strokes/`) so the tool never breaks even if remote CDNs are taken offline.

- **Font & Stroke Style Customization**:
  - **Sans-Serif (黑体 · HeiTi)**: Clean modern sans-serif stroke order diagrams using centerline median paths with uniform stroke widths and rounded caps, matching modern sans-serif Chinese textbooks.
  - **Brush / Calligraphy (楷体 · KaiTi)**: Traditional brushwork calligraphy strokes derived from Arphic KaiTi, featuring natural teardrop tapers, flaring hooks, and artistic brush pressures.
  - **Universal Font Toggle**: Instant one-click switching between Sans-Serif and Brush Calligraphy styles that seamlessly applies across the live preview and vector PDF output.

- **Worksheet Layout & Grid Controls**:
  - **Adaptive Character Sizing**: Flexible grid sizing from 12 mm to 24 mm (standard 17 mm) with automatic column, row, and page layout calculations.
  - **Faint Trace Outlines**: Toggleable guided tracing squares with customizable faint outline counts per row to build muscle memory before freehand writing.
  - **Tianzige Practice Gridlines**: Precision cross and diagonal balance guidelines inside each practice cell.
  - **Header Customization**: Customizable worksheet title, optional student name field (`姓名：_______`), and date line.

- **Pīnyīn & Stroke Order Integration**:
  - **Automatic Pīnyīn Generation**: Tone-marked pinyin pronunciations powered by the local `pinyin-pro` dictionary engine.
  - **Progressive Stroke Order (Fanning)**: Step-by-step vector diagrams showing each consecutive stroke added so learners master correct stroke sequence.

- **Professional Printing & Vector PDF Export**:
  - **Vector PDF Output**: Crisp, resolution-independent vector rendering via jsPDF and svg2pdf with embedded TrueType fonts (`WenQuanYi Zen Hei` and `AR PL UKai CN`).
  - **Strict A4 / Letter Dimensions**: Pixel-perfect page margins and container bounds designed for standard desktop printers.
  - **Instant Print & Download**: Direct in-browser printing or single-click high-resolution PDF download.

- **Modern Interactive Interface**:
  - **Live Real-time Preview**: Synchronized interactive preview updating instantaneously as you type characters or toggle options.
  - **Curated Character Presets**: One-click quick presets for common learning sets (Numbers, Radicals, Common Verbs, HSK levels, and Classic Poetry).
  - **Responsive Design**: Clean Tailwind CSS layout optimized for both desktop workstations and mobile tablets.

## Getting Started

0. **[Open the Web App](https://hanzi.patrickyou.ng/)**.
1. **Enter Chinese Characters**: Type or paste Hanzi into the character input box, or click any of the curated learning presets.
2. **Choose Typography & Stroke Style**: Select between **Sans-Serif (黑体)** for modern clean geometry or **Brush / Calligraphy (楷体)** for traditional brush strokes.
3. **Customize Layout Options**: Adjust character size (12–24 mm), toggle faint trace squares, enable Tianzige gridlines, and include pinyin or stroke order diagrams.
4. **Generate & Print**: Click **Generate & Download PDF** for an offline vector PDF or **Print Directly** to send straight to your printer.

## Tech Stack

- **[Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)**: Fast local web server and static asset delivery.
- **[Tailwind CSS](https://tailwindcss.com/)**: Modern utility-first styling with responsive layouts and print media styling.
- **[Hanzi Writer Data](https://github.com/chanind/hanzi-writer-data)**: Comprehensive offline repository of 9,500+ Chinese character stroke vectors and medians (Make Me A Hanzi / Arphic).
- **[pinyin-pro](https://github.com/zh-lx/pinyin-pro)**: High-performance, zero-dependency Chinese character pinyin converter.
- **[jsPDF](https://github.com/parallax/jsPDF) & [svg2pdf.js](https://github.com/yWorks/svg2pdf.js)**: Client-side vector PDF document generation and SVG-to-PDF rendering.
- **[Google AI Studio](https://aistudio.google.com/)**: Used to build, iterate, and deploy this application through natural language prompting.

---

*Made with love for my family by Patrick Young.*
