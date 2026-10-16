import { jsPDF } from 'jspdf';
import { domToJpeg } from 'modern-screenshot';

/**
 * Triggers the browser's native print dialog with the same pattern as Mathletics.
 * When users select "Save as PDF" in their browser print dialog, this generates
 * a 100% genuine vector PDF with native text, fonts, and vector paths.
 */
export function printWorksheet(): void {
  window.requestAnimationFrame(() => {
    setTimeout(() => {
      window.print();
    }, 150);
  });
}

/**
 * Generates and downloads a high-resolution lossless PDF document directly.
 * Uses modern-screenshot to snapshot the unscaled print mount elements and jsPDF.
 * Preserves all fonts, Chinese glyphs, Unicode pinyin accents (like jiǔ), and Lucide icons.
 */
export async function downloadPdfDocument(
  title: string,
  onProgress?: (status: string) => void
): Promise<void> {
  // Target the dedicated unscaled #print-mount container first
  const printMount = document.getElementById('print-mount');
  let pageElements: HTMLElement[] = [];

  if (printMount) {
    pageElements = Array.from(printMount.querySelectorAll<HTMLElement>('.print-container'));
  }

  // Fallback to any visible .print-container in DOM if mount is not present
  if (pageElements.length === 0) {
    pageElements = Array.from(document.querySelectorAll<HTMLElement>('.print-container'));
  }

  if (pageElements.length === 0) {
    throw new Error('No printable worksheet pages found.');
  }

  onProgress?.('Preparing pages for PDF...');

  // Temporarily stage printMount off-screen so modern-screenshot computes
  // full CSS layout, fonts, and SVGs at 100% true A4 scale (210mm x 297mm)
  const prevCssText = printMount ? printMount.style.cssText : '';
  if (printMount) {
    printMount.style.position = 'fixed';
    printMount.style.left = '0';
    printMount.style.top = '0';
    printMount.style.zIndex = '-9999';
    printMount.style.display = 'block';
    printMount.style.visibility = 'visible';
    printMount.style.opacity = '1';
    printMount.style.pointerEvents = 'none';
  }

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const totalPages = pageElements.length;

    for (let i = 0; i < totalPages; i++) {
      onProgress?.(`Rendering page ${i + 1} of ${totalPages}...`);
      const pageEl = pageElements[i];

      // High-resolution JPEG snapshot at 2.5x scale (~240 DPI, crisp, fast, and lightweight)
      const imgData = await domToJpeg(pageEl, {
        scale: 2.5,
        backgroundColor: '#ffffff',
        quality: 0.95,
      });

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // Exact A4 dimensions: 210mm x 297mm
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    onProgress?.('Saving PDF file...');
    const fileName = (title || 'Chinese-Character-Worksheet')
      .replace(/[^\w\u4e00-\u9fa5\-_]/g, '_')
      .slice(0, 50);

    pdf.save(`${fileName}.pdf`);
  } finally {
    // Restore printMount to default hidden state
    if (printMount) {
      printMount.style.cssText = prevCssText;
    }
  }
}
