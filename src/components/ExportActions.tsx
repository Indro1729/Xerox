import React, { useState } from 'react';
import {
  Download,
  FileText,
  Image as ImageIcon,
  Printer,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { SheetConfig, SheetLayoutResult, SheetPhotoItem } from '../types';
import {
  downloadSheetAsJpeg,
  downloadSheetsAsPdf,
  printSheets
} from '../utils/exportEngine';

interface ExportActionsProps {
  layout: SheetLayoutResult;
  config: SheetConfig;
  croppedCanvas: HTMLCanvasElement | null;
  photos?: SheetPhotoItem[];
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  layout,
  config,
  croppedCanvas,
  photos
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingJpeg, setIsExportingJpeg] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    if (!croppedCanvas && (!photos || photos.length === 0)) return;
    setIsExportingPdf(true);
    setSuccessMessage(null);
    try {
      // Small timeout to allow spinner to render
      setTimeout(() => {
        downloadSheetsAsPdf(layout, config, croppedCanvas, photos);
        setIsExportingPdf(false);
        setSuccessMessage('A4 Print PDF successfully generated and downloaded!');
        setTimeout(() => setSuccessMessage(null), 5000);
      }, 50);
    } catch (err) {
      console.error(err);
      setIsExportingPdf(false);
    }
  };

  const handleDownloadJpeg = async (sheetIdx: number = 0) => {
    if (!croppedCanvas && (!photos || photos.length === 0)) return;
    setIsExportingJpeg(true);
    setSuccessMessage(null);
    try {
      setTimeout(() => {
        if (layout.totalSheets > 1) {
          // Download each sheet
          for (let s = 0; s < layout.totalSheets; s++) {
            downloadSheetAsJpeg(s, layout, config, croppedCanvas, photos);
          }
          setSuccessMessage(`Downloaded all ${layout.totalSheets} A4 JPEG sheets at 300 DPI!`);
        } else {
          downloadSheetAsJpeg(0, layout, config, croppedCanvas, photos);
          setSuccessMessage('High-resolution 300 DPI A4 JPEG downloaded!');
        }
        setIsExportingJpeg(false);
        setTimeout(() => setSuccessMessage(null), 5000);
      }, 50);
    } catch (err) {
      console.error(err);
      setIsExportingJpeg(false);
    }
  };

  const handlePrint = () => {
    if (!croppedCanvas && (!photos || photos.length === 0)) return;
    printSheets(layout, config, croppedCanvas, photos);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 sm:p-6 mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-600" />
            4. Download & Print Official A4 Sheets
          </h2>
          <p className="text-xs text-zinc-500">
            Export true 100% scale A4 sheets with cutting gaps in JPEG or PDF format:
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-lg">
          <span>Resolution:</span>
          <strong className="text-zinc-900">300 DPI High-Def</strong>
        </div>
      </div>

      {successMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      {/* Main Download Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* PDF Download Button */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={!croppedCanvas || isExportingPdf}
          className="p-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold transition-all flex flex-col items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
            <FileText className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-sm font-bold block">
              {isExportingPdf ? 'Generating PDF...' : 'Download PDF (Print Ready)'}
            </span>
            <span className="text-[11px] text-zinc-400 block font-normal">
              100% True millimeter scale A4 • Vector & Raster
            </span>
          </div>
        </button>

        {/* JPEG Download Button */}
        <button
          type="button"
          onClick={() => handleDownloadJpeg(0)}
          disabled={!croppedCanvas || isExportingJpeg}
          className="p-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold transition-all flex flex-col items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-amber-400/80 group-hover:bg-amber-300 flex items-center justify-center transition-colors">
            <ImageIcon className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <span className="text-sm font-bold block">
              {isExportingJpeg ? 'Rendering JPEG...' : 'Download JPEG (300 DPI)'}
            </span>
            <span className="text-[11px] text-zinc-900/80 block font-normal">
              Ultra HD 2480 × 3508 px image file
            </span>
          </div>
        </button>

        {/* Direct Print Button */}
        <button
          type="button"
          onClick={handlePrint}
          disabled={!croppedCanvas}
          className="p-4 rounded-xl bg-white border-2 border-zinc-300 hover:border-zinc-400 text-zinc-800 font-semibold transition-all flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-100 group-hover:bg-zinc-200 flex items-center justify-center transition-colors">
            <Printer className="w-5 h-5 text-zinc-700" />
          </div>
          <div>
            <span className="text-sm font-bold block">
              Direct Print (1:1 Scale)
            </span>
            <span className="text-[11px] text-zinc-500 block font-normal">
              Opens system printer dialog directly
            </span>
          </div>
        </button>
      </div>

      {/* Official Printing Advice Note */}
      <div className="mt-5 p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-2">
        <div className="flex items-center gap-2 text-zinc-900 font-bold">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          Official Submission & Print Instructions
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-zinc-600">
          <div>
            <strong className="text-zinc-800 block mb-0.5">1. Printer Scaling Setting:</strong>
            In your printer dialog, always choose <strong>"Actual Size"</strong> or <strong>"Scale: 100%"</strong>. Do <em>not</em> select "Fit to page" or "Shrink oversized pages", which alters the official 35×45mm or 20×25mm specifications.
          </div>
          <div>
            <strong className="text-zinc-800 block mb-0.5">2. Paper Type & Cutting:</strong>
            For government ID, visa, or civil exam submissions, print on <strong>180–240 GSM Glossy or Semi-Gloss Photo Paper</strong>. Cut along the {config.gapMm}mm dashed gap lines with sharp scissors or a paper trimmer.
          </div>
        </div>
      </div>
    </div>
  );
};
