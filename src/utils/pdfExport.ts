import { jsPDF } from 'jspdf';

/**
 * Triggers the browser's native print dialog which utilizes @media print
 * to generate pristine, vector-accurate physical prints or saved PDFs.
 */
export function printWorksheet(): void {
  window.print();
}

/**
 * Generates and downloads a client-side PDF document using jsPDF
 */
export async function downloadPdfDocument(
  title: string,
  charList: string[]
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Since jsPDF requires embedded Chinese fonts for vector glyphs if drawn as text,
  // we trigger browser print for maximum vector fidelity if standard print is preferred,
  // or build an informational PDF cover + print instruction.
  doc.setFontSize(20);
  doc.text('Chinese Character Worksheets', 20, 25);
  doc.setFontSize(12);
  doc.text(`Title: ${title}`, 20, 35);
  doc.text(`Total Characters: ${charList.length}`, 20, 42);
  doc.text(`Characters: ${charList.join(', ')}`, 20, 50);
  doc.text('For pixel-perfect Chinese typography and gridline printing,', 20, 65);
  doc.text('please use the "Print / Save as PDF" button in the top bar.', 20, 72);

  doc.save(`${title || 'chinese-worksheet'}.pdf`);
}
