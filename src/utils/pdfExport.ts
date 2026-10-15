import { jsPDF } from 'jspdf';
import { domToPng } from 'modern-screenshot';

/**
 * Triggers the browser's native print dialog which generates a 100% True Vector PDF
 * when selecting "Save as PDF" in the destination dropdown.
 */
export function printWorksheet(): void {
  window.print();
}

/**
 * Generates and downloads a high-resolution lossless PDF document directly.
 * Uses modern-screenshot at 3x scale (300 DPI print standard) and jsPDF.
 */
export async function downloadPdfDocument(
  title: string,
  onProgress?: (status: string) => void
): Promise<void> {
  const pageElements = document.querySelectorAll<HTMLElement>('.print-container');
  if (!pageElements || pageElements.length === 0) {
    throw new Error('No printable worksheet pages found.');
  }

  onProgress?.('Preparing high-res pages...');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const totalPages = pageElements.length;

  for (let i = 0; i < totalPages; i++) {
    onProgress?.(`Rendering page ${i + 1} of ${totalPages} (300 DPI)...`);
    const pageEl = pageElements[i];

    // High-resolution lossless PNG snapshot (scale 3 = 300 DPI print standard)
    const imgData = await domToPng(pageEl, {
      scale: 3,
      backgroundColor: '#ffffff',
    });

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    // A4 dimensions: exactly 210mm x 297mm
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  }

  onProgress?.('Saving PDF file...');
  const fileName = (title || 'Chinese-Character-Worksheet')
    .replace(/[^\w\u4e00-\u9fa5\-_]/g, '_')
    .slice(0, 50);

  pdf.save(`${fileName}.pdf`);
}
