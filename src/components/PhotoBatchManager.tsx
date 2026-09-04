import React from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  Scissors,
  Split,
  Maximize2
} from 'lucide-react';
import { SheetPhotoItem, SheetLayoutResult } from '../types';

interface PhotoBatchManagerProps {
  photos: SheetPhotoItem[];
  activePhotoId: string | null;
  onSelectPhoto: (id: string) => void;
  onAddPhotoClick: () => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemovePhoto: (id: string) => void;
  onSplitEvenly: () => void;
  layout: SheetLayoutResult;
}

export const PhotoBatchManager: React.FC<PhotoBatchManagerProps> = ({
  photos,
  activePhotoId,
  onSelectPhoto,
  onAddPhotoClick,
  onUpdateQuantity,
  onRemovePhoto,
  onSplitEvenly,
  layout
}) => {
  const totalQuantity = photos.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 sm:p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-900">
              Photos on this A4 Sheet ({photos.length})
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              Multi-Photo Batch Ready
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Add multiple different photos to print together on the exact same A4 paper:
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {photos.length > 1 && (
            <button
              type="button"
              onClick={onSplitEvenly}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
              title="Distribute available slots evenly among all photos"
            >
              <Split className="w-3.5 h-3.5 text-zinc-500" />
              Split Evenly
            </button>
          )}

          <button
            type="button"
            onClick={onAddPhotoClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-sm hover:shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Add Another Photo
          </button>
        </div>
      </div>

      {/* Photo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-4">
        {photos.map((photo, index) => {
          const isActive = photo.id === activePhotoId;
          const percentage = totalQuantity > 0 ? Math.round((photo.quantity / totalQuantity) * 100) : 0;

          return (
            <div
              key={photo.id}
              className={`relative rounded-xl border p-3 transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-amber-50/40 border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                  : 'bg-zinc-50/70 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Thumbnail Preview */}
                <div
                  onClick={() => onSelectPhoto(photo.id)}
                  className="relative w-14 h-18 rounded-lg overflow-hidden border border-zinc-300 shadow-xs bg-white shrink-0 cursor-pointer group"
                  title="Click to edit and adjust this photo"
                >
                  {photo.croppedDataUrl || photo.originalSrc ? (
                    <img
                      src={photo.croppedDataUrl || photo.originalSrc}
                      alt={photo.name || 'Photo preview'}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-200" />
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Details & Controls */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-zinc-900 truncate">
                      {photo.name || `Photo ${index + 1}`}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                        Editing Now
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mb-2">
                    <span className="capitalize">
                      {photo.backgroundConfig.type === 'transparent'
                        ? 'White (default)'
                        : photo.backgroundConfig.type === 'color'
                        ? 'Custom Color'
                        : photo.backgroundConfig.type === 'device'
                        ? 'Device Image'
                        : photo.backgroundConfig.type === 'web'
                        ? 'Web Backdrop'
                        : 'Original'}
                    </span>
                    <span>•</span>
                    <span>{percentage}% of sheet</span>
                  </div>

                  {/* Quantity Stepper for this specific photo */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-zinc-600">Copies:</span>
                    <div className="flex items-center border border-zinc-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(photo.id, Math.max(2, photo.quantity - 2))}
                        disabled={photo.quantity <= 2}
                        className="px-2 py-0.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Decrease copies by 2"
                      >
                        -2
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-zinc-900 min-w-[28px] text-center">
                        {photo.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(photo.id, Math.min(50, photo.quantity + 2))}
                        disabled={photo.quantity >= 50}
                        className="px-2 py-0.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Increase copies by 2"
                      >
                        +2
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-3 pt-2.5 border-t border-zinc-200/80 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => onSelectPhoto(photo.id)}
                  className={`inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'text-amber-700 hover:text-amber-800'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isActive ? 'Currently Editing' : 'Edit / Adjust'}
                </button>

                {photos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(photo.id)}
                    className="text-zinc-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50 cursor-pointer"
                    title="Remove this photo from sheet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Big Add Photo Tile */}
        <button
          type="button"
          onClick={onAddPhotoClick}
          className="border-2 border-dashed border-zinc-300 hover:border-amber-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-amber-700 hover:bg-amber-50/20 transition-all cursor-pointer min-h-[120px] group"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
            <Plus className="w-5 h-5 text-zinc-600 group-hover:text-amber-700" />
          </div>
          <div className="text-center">
            <span className="text-xs font-bold block text-zinc-800 group-hover:text-amber-900">
              + Upload Another Photo
            </span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">
              Crop & put on the same A4 sheet
            </span>
          </div>
        </button>
      </div>

      {/* Summary Allocation Bar */}
      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-zinc-700">
            <strong>Total on Sheet:</strong> {totalQuantity} photos (
            {photos.map((p, idx) => (
              <span key={p.id}>
                {p.quantity} × {p.name || `Photo ${idx + 1}`}
                {idx < photos.length - 1 ? ' + ' : ''}
              </span>
            ))}
            )
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="px-2 py-0.5 rounded bg-white border border-zinc-200 font-mono font-medium text-zinc-700">
            {layout.totalSheets === 1
              ? `Fits 1 Single A4 Sheet (${totalQuantity}/${layout.photosPerSheet} capacity)`
              : `Spans across ${layout.totalSheets} A4 Sheets`}
          </span>
        </div>
      </div>
    </div>
  );
};
