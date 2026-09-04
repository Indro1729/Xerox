import { jsPDF } from 'jspdf';
import { SheetConfig, SheetLayoutResult, SheetPhotoItem } from '../types';
import { PX_PER_MM_300, A4_WIDTH_PX_300, A4_HEIGHT_PX_300 } from './photoSizes';

export interface RenderOptions {
  sheetIndex: number;
  layout: SheetLayoutResult;
  config: SheetConfig;
  croppedImage?: HTMLImageElement | HTMLCanvasElement | null;
  photos?: SheetPhotoItem[];
}

/**
 * Draws an A4 sheet at full 300 DPI resolution onto an HTMLCanvasElement
 */
export function renderA4SheetCanvas({
  sheetIndex,
  layout,
  config,
  croppedImage,
  photos
}: RenderOptions): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = A4_WIDTH_PX_300;
  canvas.height = A4_HEIGHT_PX_300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background: crisp white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const mmToPx = PX_PER_MM_300;
  const sheetCells = layout.cells[sheetIndex] || [];

  // Note: All texts are excluded per requirement: clean photo sheet starting from top-left corner without any text

  // Draw cutting lines in gaps if enabled
  if (config.showCutLines && sheetCells.length > 0) {
    ctx.strokeStyle = '#D4D4D8'; // Subtle light gray cutting line
    ctx.lineWidth = Math.max(1, Math.round(0.2 * mmToPx));
    ctx.setLineDash([Math.round(1.5 * mmToPx), Math.round(1.5 * mmToPx)]);

    // Determine grid bounds based on sheet cells
    let minX = sheetCells[0].xMm;
    let maxX = sheetCells[0].xMm + sheetCells[0].widthMm;
    let minY = sheetCells[0].yMm;
    let maxY = sheetCells[0].yMm + sheetCells[0].heightMm;

    sheetCells.forEach((c) => {
      if (c.xMm < minX) minX = c.xMm;
      if (c.xMm + c.widthMm > maxX) maxX = c.xMm + c.widthMm;
      if (c.yMm < minY) minY = c.yMm;
      if (c.yMm + c.heightMm > maxY) maxY = c.yMm + c.heightMm;
    });

    // Draw horizontal cutting guide lines between rows and at edges
    const rowYPositions = new Set<number>();
    sheetCells.forEach((c) => {
      rowYPositions.add(c.yMm);
      rowYPositions.add(c.yMm + c.heightMm);
    });

    const lineStartX = (minX - 2) * mmToPx;
    const lineEndX = (maxX + 2) * mmToPx;

    rowYPositions.forEach((yMm) => {
      const y = yMm * mmToPx;
      ctx.beginPath();
      ctx.moveTo(lineStartX, y);
      ctx.lineTo(lineEndX, y);
      ctx.stroke();
    });

    // Draw vertical cutting guide lines between columns
    const colXPositions = new Set<number>();
    sheetCells.forEach((c) => {
      colXPositions.add(c.xMm);
      colXPositions.add(c.xMm + c.widthMm);
    });

    const lineStartY = (minY - 2) * mmToPx;
    const lineEndY = (maxY + 2) * mmToPx;

    colXPositions.forEach((xMm) => {
      const x = xMm * mmToPx;
      ctx.beginPath();
      ctx.moveTo(x, lineStartY);
      ctx.lineTo(x, lineEndY);
      ctx.stroke();
    });

    ctx.setLineDash([]);
  }

  // Draw each photo in this sheet
  sheetCells.forEach((cell) => {
    const x = Math.round(cell.xMm * mmToPx);
    const y = Math.round(cell.yMm * mmToPx);
    const w = Math.round(cell.widthMm * mmToPx);
    const h = Math.round(cell.heightMm * mmToPx);

    // Pick image: if photos array provided, find matching photo by cell.photoItemId
    let imgToDraw: HTMLCanvasElement | HTMLImageElement | undefined;
    if (photos && photos.length > 0) {
      const match = photos.find((p) => p.id === cell.photoItemId);
      imgToDraw = match?.croppedCanvas || photos[0].croppedCanvas;
    } else if (croppedImage) {
      imgToDraw = croppedImage;
    }

    // Render photo image
    if (imgToDraw) {
      ctx.drawImage(imgToDraw, x, y, w, h);
    }

    // Photo border for cutting visibility (especially on white background photos)
    if (config.showPhotoBorder) {
      ctx.strokeStyle = '#71717A'; // Clean neutral border
      ctx.lineWidth = Math.max(1, Math.round(0.2 * mmToPx)); // ~0.5pt
      ctx.strokeRect(x, y, w, h);
    }

    // Corner tick crop marks
    if (config.showCornerMarks) {
      ctx.strokeStyle = '#3F3F46';
      ctx.lineWidth = Math.max(1, Math.round(0.3 * mmToPx));
      const tickLen = Math.round(2.5 * mmToPx);
      const offset = Math.round(1.0 * mmToPx);

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(x - offset, y - offset - tickLen);
      ctx.lineTo(x - offset, y - offset);
      ctx.lineTo(x - offset - tickLen, y - offset);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(x + w + offset, y - offset - tickLen);
      ctx.lineTo(x + w + offset, y - offset);
      ctx.lineTo(x + w + offset + tickLen, y - offset);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(x - offset, y + h + offset + tickLen);
      ctx.lineTo(x - offset, y + h + offset);
      ctx.lineTo(x - offset - tickLen, y + h + offset);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(x + w + offset, y + h + offset + tickLen);
      ctx.lineTo(x + w + offset, y + h + offset);
      ctx.lineTo(x + w + offset + tickLen, y + h + offset);
      ctx.stroke();
    }
  });

  return canvas;
}

/**
 * Download a sheet as JPEG
 */
export function downloadSheetAsJpeg(
  sheetIndex: number,
  layout: SheetLayoutResult,
  config: SheetConfig,
  croppedImage?: HTMLImageElement | HTMLCanvasElement | null,
  photos?: SheetPhotoItem[]
): void {
  const canvas = renderA4SheetCanvas({
    sheetIndex,
    layout,
    config,
    croppedImage,
    photos
  });

  const link = document.createElement('a');
  link.download = `Xerox_${layout.preset.id}_photos_A4_page_${sheetIndex + 1}.jpg`;
  link.href = canvas.toDataURL('image/jpeg', 0.95);
  link.click();
}

/**
 * Download all sheets as PDF with 100% exact millimeter scale
 */
export function downloadSheetsAsPdf(
  layout: SheetLayoutResult,
  config: SheetConfig,
  croppedImage?: HTMLImageElement | HTMLCanvasElement | null,
  photos?: SheetPhotoItem[]
): void {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  for (let s = 0; s < layout.totalSheets; s++) {
    if (s > 0) {
      pdf.addPage('a4', 'portrait');
    }

    const canvas = renderA4SheetCanvas({
      sheetIndex: s,
      layout,
      config,
      croppedImage,
      photos
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    // Draw exact A4 dimensions: 210mm x 297mm
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  pdf.save(`Xerox_${layout.preset.id}_${layout.quantity}photos_A4.pdf`);
}

/**
 * Open browser print dialog for direct 1:1 printing
 */
export function printSheets(
  layout: SheetLayoutResult,
  config: SheetConfig,
  croppedImage?: HTMLImageElement | HTMLCanvasElement | null,
  photos?: SheetPhotoItem[]
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const sheetsHtml: string[] = [];
  for (let s = 0; s < layout.totalSheets; s++) {
    const canvas = renderA4SheetCanvas({
      sheetIndex: s,
      layout,
      config,
      croppedImage,
      photos
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    sheetsHtml.push(`
      <div class="page">
        <img src="${imgData}" alt="A4 Page ${s + 1}" />
      </div>
    `);
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Xerox Print - ${layout.preset.name}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            background: #fff;
          }
          .page {
            width: 210mm;
            height: 297mm;
            page-break-after: always;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .page img {
            width: 210mm;
            height: 297mm;
            display: block;
          }
        </style>
      </head>
      <body>
        ${sheetsHtml.join('')}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
