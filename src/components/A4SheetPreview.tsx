import React, { useState } from 'react';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Scissors,
  Check,
  Printer
} from 'lucide-react';
import { SheetConfig, SheetLayoutResult, SheetPhotoItem } from '../types';

interface A4SheetPreviewProps {
  layout: SheetLayoutResult;
  config: SheetConfig;
  croppedCanvas: HTMLCanvasElement | null;
  photos?: SheetPhotoItem[];
}

export const A4SheetPreview: React.FC<A4SheetPreviewProps> = ({
  layout,
  config,
  croppedCanvas,
  photos
}) => {
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [previewScale, setPreviewScale] = useState(1); // Scale multiplier

  // Ensure currentSheetIndex is within bounds
  const activeSheetIndex = Math.min(currentSheetIndex, Math.max(0, layout.totalSheets - 1));
  const sheetCells = layout.cells[activeSheetIndex] || [];

  // A4 aspect ratio: 210mm / 297mm ≈ 0.707
  // Base preview width in pixels:
  const baseWidthPx = 420;
  const baseHeightPx = Math.round(baseWidthPx * (297 / 210)); // ~594px

  // Scale from mm to preview pixels
  const mmToPreviewPx = baseWidthPx / 210;

  // Cropped photo data URL for rendering in the preview cells
  const croppedDataUrl = croppedCanvas ? croppedCanvas.toDataURL('image/jpeg', 0.85) : null;

  return (
    <div className="bg-zinc-100 rounded-2xl border border-zinc-200 p-4 sm:p-6 mb-8">
      {/* Header bar of A4 preview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            3. A4 Sheet Preview & Cutting Layout
          </h2>
          <p className="text-xs text-zinc-500">
            Official A4 sheet (210 × 297 mm) with {config.gapMm}mm cutting gaps and guide lines:
          </p>
        </div>

        {/* Sheet navigation & zoom controls */}
        <div className="flex items-center gap-2">
          {layout.totalSheets > 1 && (
            <div className="flex items-center bg-white border border-zinc-200 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setCurrentSheetIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeSheetIndex === 0}
                className="p-1 rounded hover:bg-zinc-100 disabled:opacity-30 cursor-pointer"
                title="Previous Sheet"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-zinc-700">
                Sheet {activeSheetIndex + 1} of {layout.totalSheets}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentSheetIndex((prev) =>
                    Math.min(layout.totalSheets - 1, prev + 1)
                  )
                }
                disabled={activeSheetIndex >= layout.totalSheets - 1}
                className="p-1 rounded hover:bg-zinc-100 disabled:opacity-30 cursor-pointer"
                title="Next Sheet"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Zoom buttons */}
          <div className="flex items-center bg-white border border-zinc-200 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setPreviewScale((s) => Math.max(0.7, s - 0.15))}
              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 cursor-pointer"
              title="Zoom out preview"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-zinc-500">
              {Math.round(previewScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setPreviewScale((s) => Math.min(1.4, s + 0.15))}
              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 cursor-pointer"
              title="Zoom in preview"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sheet Metadata Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
        <span className="px-2.5 py-1 rounded-md bg-white border border-zinc-200 font-semibold text-zinc-800">
          Paper: Standard A4 (210 × 297 mm)
        </span>
        <span className="px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-zinc-700">
          Photo: <strong className="text-zinc-900">{layout.preset.widthMm} × {layout.preset.heightMm} mm</strong>
        </span>
        <span className="px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-zinc-700 flex items-center gap-1">
          <Scissors className="w-3.5 h-3.5 text-amber-600" />
          Cutting Gap: <strong className="text-zinc-900">{config.gapMm} mm</strong>
        </span>
        <span className="px-2.5 py-1 rounded-md bg-amber-100/70 border border-amber-200 text-amber-900 font-medium">
          {sheetCells.length} photos on this sheet ({layout.quantity} total)
        </span>
        {photos && photos.length > 1 && (
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Multi-Photo Batch ({photos.length} photos combined on sheet)
          </span>
        )}
      </div>

      {/* A4 Paper Canvas Container */}
      <div className="overflow-auto py-6 flex justify-center bg-zinc-200/80 rounded-xl border border-zinc-300/80">
        <div
          className="relative bg-white shadow-xl transition-transform duration-150 origin-top select-none"
          style={{
            width: `${baseWidthPx * previewScale}px`,
            height: `${baseHeightPx * previewScale}px`
          }}
        >
          {/* Render Cutting Guides (Dashed Lines) across the sheet */}
          {config.showCutLines && sheetCells.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Horizontal cutting lines */}
              {Array.from(
                new Set<number>(
                  sheetCells.flatMap((c) => [c.yMm, c.yMm + c.heightMm])
                )
              ).map((yMm: number, i: number) => {
                const topPx = yMm * mmToPreviewPx * previewScale;
                return (
                  <div
                    key={`hline-${i}`}
                    className="absolute left-1 right-1 border-b border-dashed border-zinc-300"
                    style={{ top: `${topPx}px` }}
                  />
                );
              })}

              {/* Vertical cutting lines */}
              {Array.from(
                new Set<number>(
                  sheetCells.flatMap((c) => [c.xMm, c.xMm + c.widthMm])
                )
              ).map((xMm: number, i: number) => {
                const leftPx = xMm * mmToPreviewPx * previewScale;
                return (
                  <div
                    key={`vline-${i}`}
                    className="absolute top-1 bottom-1 border-r border-dashed border-zinc-300"
                    style={{ left: `${leftPx}px` }}
                  />
                );
              })}
            </div>
          )}

          {/* Render individual photo cells starting from top-left */}
          {sheetCells.map((cell) => {
            const left = cell.xMm * mmToPreviewPx * previewScale;
            const top = cell.yMm * mmToPreviewPx * previewScale;
            const width = cell.widthMm * mmToPreviewPx * previewScale;
            const height = cell.heightMm * mmToPreviewPx * previewScale;

            // Determine the specific photo for this cell if multi-photo sheet
            let cellImgSrc: string | null = croppedDataUrl;
            if (photos && photos.length > 0) {
              const matchedPhoto = photos.find((p) => p.id === cell.photoItemId) || photos[0];
              cellImgSrc = matchedPhoto.croppedDataUrl || matchedPhoto.originalSrc || croppedDataUrl || null;
            }

            return (
              <div
                key={cell.photoIndex}
                className="absolute overflow-hidden group"
                style={{
                  left: `${left}px`,
                  top: `${top}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                  border: config.showPhotoBorder ? '0.5px solid #71717A' : 'none'
                }}
              >
                {cellImgSrc ? (
                  <img
                    src={cellImgSrc}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-100 border border-zinc-200" />
                )}

                {/* Corner Tick Marks */}
                {config.showCornerMarks && (
                  <>
                    <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-zinc-800" />
                    <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-zinc-800" />
                    <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-zinc-800" />
                    <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-zinc-800" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-center text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1">
          <Scissors className="w-3.5 h-3.5 text-zinc-400" />
          {config.gapMm === 0
            ? '0mm gap: Photos are flush edge-to-edge for single-slice guillotine or paper trimmer cutting.'
            : config.gapMm === 1
            ? '1mm gap: Ultra-compact spacing maximizing photo density on the sheet.'
            : `The ${config.gapMm}mm gap between each photo provides the exact clearance required for clean official cutting without trimming into portraits.`}
        </span>
      </div>
    </div>
  );
};
