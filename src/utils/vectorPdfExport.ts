import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import { CharacterItem, WorksheetSettings } from '../types';
import { medianToSvgPath } from './strokeService';

/**
 * Escapes XML/SVG special characters
 */
function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

/**
 * Builds a 100% pure vector SVG document for an A4 worksheet page
 */
export function buildPageSvg(
  characters: CharacterItem[],
  settings: WorksheetSettings,
  pageIndex: number = 0,
  totalPages: number = 1
): SVGSVGElement {
  const availableWidthMm = 186;
  const rawSize = settings.characterSizeMm || 18;

  // 10 slots at standard 18mm
  const totalSlots = rawSize === 18 ? 10 : Math.max(5, Math.floor(availableWidthMm / rawSize));
  const cellWidth = availableWidthMm / totalSlots;
  const practiceSlots = totalSlots - 1;
  const faintTraceSlots = settings.faintTrace ? Math.min(4, Math.floor(practiceSlots / 2)) : 0;

  const maxRowsPerPage = rawSize >= 22 ? 7 : (rawSize >= 20 ? 8 : 10);
  const emptyRowsCount = Math.max(0, maxRowsPerPage - characters.length);

  // Proportional sizing based on 18mm standard
  const sizeRatio = rawSize / 18;
  const pinyinFontSizeMm = Math.max(2.6, 3.2 * sizeRatio);
  const strokeStepSizeMm = Math.max(3.8, 5.0 * sizeRatio);
  const infoLineHeightMm = Math.max(strokeStepSizeMm, pinyinFontSizeMm + 0.8);
  const infoMarginBottomMm = Math.max(1.0, 1.8 * sizeRatio);
  const rowHeightMm = infoLineHeightMm + infoMarginBottomMm + cellWidth;

  let svgContent = '';

  // 1. Header (at Y = 8mm to 19mm)
  const headerTitle = escapeXml(settings.title || '基础汉字书写练习');
  svgContent += `
    <!-- Header: Logo, Title, Name -->
    <g id="page-header">
      <rect x="12" y="8" width="6.5" height="6.5" rx="1.5" fill="#e60012" />
      <text x="15.25" y="12.8" fill="#ffffff" font-size="4.2" font-family="sans-serif" font-weight="bold" text-anchor="middle">字</text>
      <text x="21" y="13" fill="#0f172a" font-size="4.6" font-family="sans-serif" font-weight="bold">${headerTitle}</text>
  `;

  if (settings.headerStudentName) {
    svgContent += `
      <text x="156" y="13" fill="#0f172a" font-size="3.4" font-family="sans-serif">姓名：</text>
      <line x1="166" y1="13.2" x2="198" y2="13.2" stroke="#0f172a" stroke-width="0.3" />
    `;
  }

  svgContent += `
      <!-- Solid header rule -->
      <line x1="12" y1="17.5" x2="198" y2="17.5" stroke="#0f172a" stroke-width="0.6" />
    </g>
  `;

  // 2. Character Rows (starting at Y = 21mm)
  const startY = 21;

  const renderRow = (
    item: CharacterItem | null,
    rowY: number,
    isEmpty: boolean
  ) => {
    let rowXml = `<g transform="translate(0, ${rowY})">`;

    // A. Top info line (Pinyin + Stroke Order)
    if (!isEmpty && item && (settings.pinyin || settings.strokeOrderBreakdown)) {
      let currentX = 12;

      // Pinyin text
      if (settings.pinyin && item.pinyin) {
        const escapedPinyin = escapeXml(item.pinyin);
        rowXml += `<text x="${currentX}" y="${infoLineHeightMm * 0.78}" fill="#0f172a" font-size="${pinyinFontSizeMm}" font-family="monospace" font-weight="bold">${escapedPinyin}</text>`;
        currentX += Math.max(12, item.pinyin.length * pinyinFontSizeMm * 0.65 + 3);
      }

      // Progressive Stroke Order Breakdown
      if (settings.strokeOrderBreakdown && item.strokeData?.strokes) {
        const strokes = item.strokeData.strokes;
        const medians = item.strokeData.medians || [];
        const isSans = settings.strokeStyle === 'heiti' && medians.length === strokes.length;

        strokes.forEach((_, stepIdx) => {
          const stepX = currentX + stepIdx * (strokeStepSizeMm + 1.2);
          const stepY = (infoLineHeightMm - strokeStepSizeMm) / 2;
          const scale = strokeStepSizeMm / 1024;

          rowXml += `<g transform="translate(${stepX}, ${stepY + strokeStepSizeMm}) scale(${scale}, ${-scale})">`;

          if (isSans) {
            // Sans-Serif centerline medians
            medians.slice(0, stepIdx).forEach((m) => {
              rowXml += `<path d="${medianToSvgPath(m)}" stroke="#0f172a" stroke-width="62" stroke-linecap="round" stroke-linejoin="round" fill="none" />`;
            });
            if (medians[stepIdx]) {
              rowXml += `<path d="${medianToSvgPath(medians[stepIdx])}" stroke="#dc2626" stroke-width="62" stroke-linecap="round" stroke-linejoin="round" fill="none" />`;
            }
          } else {
            // Authentic KaiTi brush strokes
            strokes.slice(0, stepIdx).forEach((pathD) => {
              rowXml += `<path d="${pathD}" fill="#0f172a" />`;
            });
            rowXml += `<path d="${strokes[stepIdx]}" fill="#dc2626" />`;
          }

          rowXml += `</g>`;
        });
      }
    }

    // B. Practice squares
    const boxY = infoLineHeightMm + infoMarginBottomMm;

    for (let slot = 0; slot < totalSlots; slot++) {
      const boxX = 12 + slot * cellWidth;
      const isReference = slot === 0 && !isEmpty;
      const isTrace = !isEmpty && slot > 0 && slot <= faintTraceSlots;

      // Outer Square Box
      rowXml += `<rect x="${boxX}" y="${boxY}" width="${cellWidth}" height="${cellWidth}" fill="#ffffff" stroke="#475569" stroke-width="0.32" />`;

      // Tianzige & Mizige guidelines
      if (settings.tianzigeGridlines) {
        // Diagonal guidelines
        rowXml += `<line x1="${boxX}" y1="${boxY}" x2="${boxX + cellWidth}" y2="${boxY + cellWidth}" stroke="#cbd5e1" stroke-width="0.18" />`;
        rowXml += `<line x1="${boxX + cellWidth}" y1="${boxY}" x2="${boxX}" y2="${boxY + cellWidth}" stroke="#cbd5e1" stroke-width="0.18" />`;
        // Cross guidelines (dashed)
        rowXml += `<line x1="${boxX + cellWidth / 2}" y1="${boxY}" x2="${boxX + cellWidth / 2}" y2="${boxY + cellWidth}" stroke="#94a3b8" stroke-width="0.18" stroke-dasharray="0.8,0.8" />`;
        rowXml += `<line x1="${boxX}" y1="${boxY + cellWidth / 2}" x2="${boxX + cellWidth}" y2="${boxY + cellWidth / 2}" stroke="#94a3b8" stroke-width="0.18" stroke-dasharray="0.8,0.8" />`;
      }

      // Character Glyphs (Model Reference or Faint Trace)
      if ((isReference || isTrace) && item?.strokeData?.strokes) {
        const glyphSizeMm = cellWidth * 0.78;
        const glyphX = boxX + cellWidth * 0.11;
        const glyphY = boxY + cellWidth * 0.89;
        const scale = glyphSizeMm / 1024;
        const fill = isTrace ? '#94a3b8' : '#0f172a';
        const opacity = isTrace ? '0.35' : '1';

        rowXml += `<g transform="translate(${glyphX}, ${glyphY}) scale(${scale}, ${-scale})" fill="${fill}" opacity="${opacity}">`;
        item.strokeData.strokes.forEach((pathD) => {
          rowXml += `<path d="${pathD}" />`;
        });
        rowXml += `</g>`;
      }
    }

    rowXml += `</g>`;
    return rowXml;
  };

  // Render character rows
  characters.forEach((charItem, idx) => {
    svgContent += renderRow(charItem, startY + idx * rowHeightMm, false);
  });

  // Render empty practice rows
  for (let emptyIdx = 0; emptyIdx < emptyRowsCount; emptyIdx++) {
    const rowIdx = characters.length + emptyIdx;
    svgContent += renderRow(null, startY + rowIdx * rowHeightMm, true);
  }

  // 3. Footer (at Y = 286mm)
  svgContent += `
    <!-- Footer -->
    <g id="page-footer" transform="translate(12, 286)">
      <line x1="0" y1="0" x2="186" y2="0" stroke="#cbd5e1" stroke-width="0.25" />
      <circle cx="2" cy="3.5" r="1.6" stroke="#94a3b8" stroke-width="0.25" fill="none" />
      <path d="M0.4 3.5h3.2M2 1.9a2.5 2.5 0 0 1 0 3.2M2 1.9a2.5 2.5 0 0 0 0 3.2" stroke="#94a3b8" stroke-width="0.25" fill="none" />
      ${totalPages > 1 ? `<!-- Page counter matching Mathletics: only shown when totalPages > 1 -->
      <text x="186" y="4.3" fill="#94a3b8" font-size="2.6" font-family="monospace" font-weight="bold" text-anchor="end" letter-spacing="0.5">PAGE ${pageIndex + 1} OF ${totalPages}</text>` : ''}
    </g>
  `;

  // Assemble full SVG document
  const fullSvgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="210mm" height="297mm">
      <rect x="0" y="0" width="210" height="297" fill="#ffffff" />
      ${svgContent}
    </svg>
  `;

  const parser = new DOMParser();
  const doc = parser.parseFromString(fullSvgString, 'image/svg+xml');
  return doc.documentElement as unknown as SVGSVGElement;
}

/**
 * Generates and downloads a 100% REAL NATIVE VECTOR PDF document.
 * Uses svg2pdf.js to directly write PDF vector paths, shapes, and curves into jsPDF.
 */
export async function downloadRealVectorPdf(
  pages: CharacterItem[][],
  settings: WorksheetSettings,
  onProgress?: (status: string) => void
): Promise<void> {
  if (!pages || pages.length === 0) {
    throw new Error('No characters to export.');
  }

  onProgress?.('Generating vector PDF...');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const totalPages = pages.length;

  for (let i = 0; i < totalPages; i++) {
    onProgress?.(`Compiling vector page ${i + 1} of ${totalPages}...`);

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    // Build pure vector SVG for this page
    const pageSvg = buildPageSvg(pages[i], settings, i, totalPages);

    // Render pure vector paths directly into jsPDF (no rasterization!)
    await svg2pdf(pageSvg, pdf, {
      x: 0,
      y: 0,
      width: 210,
      height: 297,
    });
  }

  onProgress?.('Downloading vector PDF...');
  const fileName = (settings.title || 'Chinese-Character-Worksheet')
    .replace(/[^\w\u4e00-\u9fa5\-_]/g, '_')
    .slice(0, 50);

  pdf.save(`${fileName}.pdf`);
}
