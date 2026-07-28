import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFExportOptions {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: string[][];
  summaryLines?: string[];
  filename: string;
}

export function exportToPDF({ title, subtitle, headers, rows, summaryLines, filename }: PDFExportOptions) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Brand header bar
  doc.setFillColor(11, 31, 51); // #0B1F33
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 18);

  // Subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, 28);
  }

  // Brand accent line
  doc.setFillColor(212, 180, 131); // #D4B483
  doc.rect(0, 35, pageWidth, 2, 'F');

  // Generated date and branding
  doc.setTextColor(107, 124, 143); // #6B7C8F
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 14, 45);
  doc.text('Emporva', pageWidth - 14, 45, { align: 'right' });

  // Summary lines
  let startY = 52;
  if (summaryLines && summaryLines.length > 0) {
    doc.setFillColor(249, 249, 251); // #F9F9FB
    doc.roundedRect(14, startY - 4, pageWidth - 28, summaryLines.length * 7 + 8, 3, 3, 'F');
    doc.setTextColor(11, 31, 51);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    summaryLines.forEach((line, i) => {
      doc.text(line, 20, startY + 4 + i * 7);
    });
    startY += summaryLines.length * 7 + 14;
  }

  // Table
  autoTable(doc, {
    startY,
    head: [headers],
    body: rows,
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [51, 54, 69], // #333645
    },
    headStyles: {
      fillColor: [11, 31, 51], // #0B1F33
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [249, 249, 251], // #F9F9FB
    },
    margin: { left: 14, right: 14 },
  });

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFillColor(11, 31, 51);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('Emporva — Your Home, Your Data', 14, pageHeight - 5);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 5, { align: 'right' });
  }

  doc.save(filename);
}
