import React from 'react';
import {
  Scissors,
  FileSpreadsheet,
  MoveUpLeft
} from 'lucide-react';
import { SheetConfig, SheetLayoutResult, SheetPhotoItem } from '../types';

interface PrintConfigPanelProps {
  config: SheetConfig;
  onChangeConfig: (newConfig: SheetConfig) => void;
  layout: SheetLayoutResult;
  photos?: SheetPhotoItem[];
}

export const PrintConfigPanel: React.FC<PrintConfigPanelProps> = ({
  config,
  onChangeConfig,
  layout
}) => {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 sm:p-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cutting Gap & Guides */}
        <div className="lg:col-span-6 space-y-4">
          {/* Cutting Gap Configuration */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wide flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-amber-600" />
                Cutting Gap Between Photos
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white text-zinc-900 border border-zinc-300">
                {config.gapMm} mm
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mb-3">
              Standard official spacing to easily cut photos with scissors or paper trimmer without damaging adjacent portraits.
            </p>

            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={config.gapMm}
              onChange={(e) =>
                onChangeConfig({ ...config, gapMm: parseInt(e.target.value, 10) })
              }
              className="w-full accent-amber-600 h-2 bg-zinc-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-1 mb-2.5">
              <span>0mm (Flush)</span>
              <span>1mm (Tight)</span>
              <span>4mm (Standard)</span>
              <span>8mm</span>
            </div>

            {/* Quick Gap Selection Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, gapMm: 0 })}
                className={`py-1 px-1 rounded text-[11px] font-medium border text-center transition-colors cursor-pointer ${
                  config.gapMm === 0
                    ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                0mm (Flush)
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, gapMm: 1 })}
                className={`py-1 px-1 rounded text-[11px] font-medium border text-center transition-colors cursor-pointer ${
                  config.gapMm === 1
                    ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                1mm (Tight)
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, gapMm: 2 })}
                className={`py-1 px-1 rounded text-[11px] font-medium border text-center transition-colors cursor-pointer ${
                  config.gapMm === 2
                    ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                2mm (Compact)
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, gapMm: 4 })}
                className={`py-1 px-1 rounded text-[11px] font-medium border text-center transition-colors cursor-pointer ${
                  config.gapMm === 4
                    ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                4mm (Standard)
              </button>
            </div>

            {/* Cutting Guides Toggles */}
            <div className="mt-4 pt-3 border-t border-zinc-200 space-y-2.5">
              <label className="flex items-center justify-between text-xs text-zinc-700 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Scissors className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Dashed cut lines through gaps</span>
                </span>
                <input
                  type="checkbox"
                  checked={config.showCutLines}
                  onChange={(e) =>
                    onChangeConfig({ ...config, showCutLines: e.target.checked })
                  }
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-zinc-700 cursor-pointer">
                <span className="flex items-center gap-2">
                  <span className="w-3.5 text-center font-bold text-zinc-400">⌜</span>
                  <span>Corner tick crop-marks</span>
                </span>
                <input
                  type="checkbox"
                  checked={config.showCornerMarks}
                  onChange={(e) =>
                    onChangeConfig({ ...config, showCornerMarks: e.target.checked })
                  }
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-zinc-700 cursor-pointer">
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-zinc-400 rounded-xs inline-block"></span>
                  <span>Thin 0.5pt border around each photo (eases white background cuts)</span>
                </span>
                <input
                  type="checkbox"
                  checked={config.showPhotoBorder}
                  onChange={(e) =>
                    onChangeConfig({ ...config, showPhotoBorder: e.target.checked })
                  }
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Margin Offset & Sheet Layout Stats */}
        <div className="lg:col-span-6 space-y-4">
          {/* Top-Left Corner Margin Control */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wide flex items-center gap-1.5">
                <MoveUpLeft className="w-4 h-4 text-amber-600" />
                Top-Left Corner Margin
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white text-zinc-900 border border-zinc-300">
                {config.marginMm} mm
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mb-3">
              Photos start directly from the top-left corner of the A4 sheet with zero sheet text.
            </p>

            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={config.marginMm}
              onChange={(e) =>
                onChangeConfig({ ...config, marginMm: parseInt(e.target.value, 10) })
              }
              className="w-full accent-amber-600 h-2 bg-zinc-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-1 mb-3">
              <span>0mm (Corner Flush)</span>
              <span>5mm (Standard)</span>
              <span>15mm (Spacious)</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, marginMm: 0 })}
                className={`flex-1 py-1 px-2 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                  config.marginMm === 0
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                0mm Flush
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, marginMm: 5 })}
                className={`flex-1 py-1 px-2 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                  config.marginMm === 5
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                5mm Standard
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, marginMm: 10 })}
                className={`flex-1 py-1 px-2 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                  config.marginMm === 10
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                10mm Safe
              </button>
            </div>
          </div>

          {/* Sheet Layout Stats summary */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-3">
            <FileSpreadsheet className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">
                A4 Layout Packing: {layout.photosPerSheet} Photos per Sheet
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Grid: {layout.columns} columns × {layout.rows} rows on standard 210 × 297 mm A4 paper.
                {layout.totalSheets === 1 ? (
                  <span className="font-semibold ml-1">
                    All {layout.quantity} photos fit onto 1 single A4 sheet!
                  </span>
                ) : (
                  <span className="font-semibold ml-1">
                    Spans across {layout.totalSheets} A4 sheets ({layout.photosPerSheet} on Sheet 1, {layout.quantity - layout.photosPerSheet * (layout.totalSheets - 1)} on last sheet).
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
