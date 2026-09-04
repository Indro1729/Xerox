import {
  PhotoSizePreset,
  PhotoCellPosition,
  SheetConfig,
  SheetLayoutResult,
  SheetPhotoItem
} from '../types';
import { A4_WIDTH_MM, A4_HEIGHT_MM, PHOTO_SIZE_PRESETS } from './photoSizes';

export function calculateSheetLayout(
  config: SheetConfig,
  sheetPhotos?: SheetPhotoItem[]
): SheetLayoutResult {
  const preset =
    PHOTO_SIZE_PRESETS.find((p) => p.id === config.selectedPresetId) ||
    PHOTO_SIZE_PRESETS[0];

  const photoW = preset.widthMm;
  const photoH = preset.heightMm;
  const gap = config.gapMm;
  const minMargin = config.marginMm;

  // Available printable area starting from top-left corner to right/bottom edges
  const availW = A4_WIDTH_MM - minMargin;
  const availH = A4_HEIGHT_MM - minMargin;

  // Maximum columns: (cols * photoW) + (cols - 1) * gap <= availW
  // cols * (photoW + gap) - gap <= availW => cols <= (availW + gap) / (photoW + gap)
  const maxCols = Math.max(1, Math.floor((availW + gap) / (photoW + gap)));
  const maxRows = Math.max(1, Math.floor((availH + gap) / (photoH + gap)));

  const photosPerSheet = maxCols * maxRows;

  // Start directly from the top-left corner of the A4 sheet
  const startX = minMargin;
  const startY = minMargin;

  // Total quantity can come from the sum of all photos on the sheet if multiple exist
  const effectiveQuantity =
    sheetPhotos && sheetPhotos.length > 0
      ? sheetPhotos.reduce((sum, p) => sum + p.quantity, 0)
      : config.quantity;

  const totalSheets = Math.ceil(effectiveQuantity / photosPerSheet);
  const sheets: PhotoCellPosition[][] = [];

  let remaining = effectiveQuantity;
  let globalIndex = 0;

  for (let s = 0; s < totalSheets; s++) {
    const sheetCells: PhotoCellPosition[] = [];
    const countThisSheet = Math.min(remaining, photosPerSheet);

    for (let i = 0; i < countThisSheet; i++) {
      const col = i % maxCols;
      const row = Math.floor(i / maxCols);

      const x = startX + col * (photoW + gap);
      const y = startY + row * (photoH + gap);

      // Determine which photo item this cell belongs to
      let photoItemId: string | undefined = undefined;
      if (sheetPhotos && sheetPhotos.length > 0) {
        let runningCount = 0;
        photoItemId = sheetPhotos[0].id;
        for (const p of sheetPhotos) {
          if (globalIndex < runningCount + p.quantity) {
            photoItemId = p.id;
            break;
          }
          runningCount += p.quantity;
        }
      }

      sheetCells.push({
        sheetIndex: s,
        photoIndex: globalIndex++,
        xMm: x,
        yMm: y,
        widthMm: photoW,
        heightMm: photoH,
        photoItemId
      });
    }

    sheets.push(sheetCells);
    remaining -= countThisSheet;
  }

  return {
    preset,
    quantity: effectiveQuantity,
    columns: maxCols,
    rows: maxRows,
    photosPerSheet,
    totalSheets,
    sheetWidthMm: A4_WIDTH_MM,
    sheetHeightMm: A4_HEIGHT_MM,
    gapMm: gap,
    marginX: startX,
    marginY: startY,
    cells: sheets
  };
}
