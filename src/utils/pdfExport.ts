import { jsPDF } from 'jspdf';
import { domToJpeg } from 'modern-screenshot';

/**
 * Triggers the browser's native print dialog which utilizes @media print
 * to generate pristine, physical prints with no browser headers/footers.
 */
export function printWorksheet(): void {
  window.print();
}

/**
 * Generates and downloads a real PDF file directly to the user's downloads folder.
 * Uses modern-screenshot (supporting modern CSS including oklch, color-mix, CSS variables) and jsPDF.
 */
export async function downloadPdfDocument(
  title: string,
  onProgress?: (status: string) => void
): Promise<void> {
  const pageElements = document.querySelectorAll<HTMLElement>('.print-container');
  if (!pageElements || pageElements.length === 0) {
    throw new Error('No printable worksheet pages found.');
  }

  onProgress?.('Preparing PDF document...');

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

    // High-resolution snapshot with native support for oklch and modern CSS
    const imgData = await domToJpeg(pageEl, {
      scale: 2,
      backgroundColor: '#ffffff',
      quality: 0.95,
    });

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    // A4 dimensions: exactly 210mm x 297mm
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  onProgress?.('Saving PDF file...');
  const fileName = (title || 'Chinese-Character-Worksheet')
    .replace(/[^\w\u4e00-\u9fa5\-_]/g, '_')
    .slice(0, 50);

  pdf.save(`${fileName}.pdf`);
}
