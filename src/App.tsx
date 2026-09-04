import React, { useState, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { CropStudio } from './components/CropStudio';
import { BackgroundSelector } from './components/BackgroundSelector';
import { PhotoBatchManager } from './components/PhotoBatchManager';
import { AddPhotoModal } from './components/AddPhotoModal';
import { PrintConfigPanel } from './components/PrintConfigPanel';
import { A4SheetPreview } from './components/A4SheetPreview';
import { ExportActions } from './components/ExportActions';
import { PhotoSizePreset, SheetConfig, SheetPhotoItem } from './types';
import { PHOTO_SIZE_PRESETS, DEFAULT_PRESET } from './utils/photoSizes';
import { calculateSheetLayout } from './utils/sheetLayout';
import { SAMPLE_IMAGES } from './utils/sampleImages';
import {
  BackgroundConfig,
  DEFAULT_BACKGROUND_CONFIG,
  extractSubjectCutout
} from './utils/backgroundEngine';
import { Plus, Sparkles } from 'lucide-react';

export default function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PhotoSizePreset>(DEFAULT_PRESET);
  const [croppedCanvas, setCroppedCanvas] = useState<HTMLCanvasElement | null>(null);

  // Multi-Photo on same A4 Sheet state
  const [sheetPhotos, setSheetPhotos] = useState<SheetPhotoItem[]>([]);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Background replacement state (for the currently active photo)
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>(DEFAULT_BACKGROUND_CONFIG);
  const [subjectCutoutUrl, setSubjectCutoutUrl] = useState<string | null>(null);
  const [isExtractingCutout, setIsExtractingCutout] = useState<boolean>(false);
  const [extractionProgress, setExtractionProgress] = useState<string>('');

  // Default Sheet Configuration: Passport size, 24 photos (even number!), 4mm cutting gap
  const [config, setConfig] = useState<SheetConfig>({
    selectedPresetId: DEFAULT_PRESET.id,
    quantity: 24, // Even number between 2 and 50
    gapMm: 4, // 4mm official cutting gap
    marginMm: 5, // Starts from top-left corner of A4 sheet (5mm margin)
    showCutLines: true, // Dashed lines for cutting
    showCornerMarks: true, // Corner crop marks
    showPhotoBorder: true, // 0.5pt border for white background clarity
    addNameDate: false,
    customText: ''
  });

  // Calculate layout whenever config, preset or sheetPhotos change
  const layout = useMemo(() => {
    return calculateSheetLayout(
      {
        ...config,
        selectedPresetId: selectedPreset.id
      },
      sheetPhotos
    );
  }, [config, selectedPreset, sheetPhotos]);

  // Extract subject cutout for transparent background replacement
  const handleTriggerExtraction = useCallback(async (srcToUse?: string, targetPhotoId?: string) => {
    const targetSrc = srcToUse || imageSrc;
    if (!targetSrc || isExtractingCutout) return;

    setIsExtractingCutout(true);
    setExtractionProgress('Analyzing portrait subject...');
    try {
      const cutout = await extractSubjectCutout(targetSrc, (status) => {
        setExtractionProgress(status);
      });
      setSubjectCutoutUrl(cutout);

      // Update in sheetPhotos if photo ID is known or active
      const idToUpdate = targetPhotoId || activePhotoId;
      if (idToUpdate) {
        setSheetPhotos((prev) =>
          prev.map((p) => (p.id === idToUpdate ? { ...p, subjectCutoutUrl: cutout } : p))
        );
      }
    } catch (err) {
      console.error('Extraction error:', err);
    } finally {
      setIsExtractingCutout(false);
    }
  }, [imageSrc, isExtractingCutout, activePhotoId]);

  // Initial first image selected
  const handleImageSelected = (src: string, name?: string) => {
    const newId = 'photo-' + Date.now();
    const newPhotoItem: SheetPhotoItem = {
      id: newId,
      name: name || 'Photo 1',
      originalSrc: src,
      croppedCanvas: document.createElement('canvas'),
      croppedDataUrl: src,
      quantity: config.quantity,
      backgroundConfig: DEFAULT_BACKGROUND_CONFIG,
      subjectCutoutUrl: null,
      presetId: selectedPreset.id
    };

    setSheetPhotos([newPhotoItem]);
    setActivePhotoId(newId);
    setImageSrc(src);
    setSubjectCutoutUrl(null);
    setBackgroundConfig(DEFAULT_BACKGROUND_CONFIG);
    // Kick off extraction in background
    handleTriggerExtraction(src, newId);
  };

  // Adding another photo to the SAME A4 sheet
  const handleAddAnotherPhoto = (src: string, name?: string) => {
    const newId = 'photo-' + Date.now();

    setSheetPhotos((prev) => {
      const currentTotal = prev.reduce((sum, p) => sum + p.quantity, 0) || config.quantity;
      const newTotalCount = prev.length + 1;
      // Distribute evenly among all photos (enforcing even numbers >= 2)
      let perPhoto = Math.floor(currentTotal / newTotalCount / 2) * 2;
      if (perPhoto < 2) perPhoto = 2;

      const updated = prev.map((p) => ({
        ...p,
        quantity: perPhoto
      }));

      // If there's an even remainder, add it to the first photo so total matches sheet nicely
      const remainingDiff = currentTotal - perPhoto * newTotalCount;
      if (remainingDiff > 0 && remainingDiff % 2 === 0 && updated.length > 0) {
        updated[0].quantity += remainingDiff;
      }

      const newPhotoItem: SheetPhotoItem = {
        id: newId,
        name: name || `Photo ${newTotalCount}`,
        originalSrc: src,
        croppedCanvas: document.createElement('canvas'),
        croppedDataUrl: src,
        quantity: perPhoto,
        backgroundConfig: DEFAULT_BACKGROUND_CONFIG,
        subjectCutoutUrl: null,
        presetId: selectedPreset.id
      };

      return [...updated, newPhotoItem];
    });

    setActivePhotoId(newId);
    setImageSrc(src);
    setSubjectCutoutUrl(null);
    setBackgroundConfig(DEFAULT_BACKGROUND_CONFIG);
    handleTriggerExtraction(src, newId);
  };

  // Switch which photo is currently being edited in CropStudio & BackgroundStudio
  const handleSelectActivePhoto = (id: string) => {
    const target = sheetPhotos.find((p) => p.id === id);
    if (!target) return;
    setActivePhotoId(id);
    setImageSrc(target.originalSrc);
    setBackgroundConfig(target.backgroundConfig);
    setSubjectCutoutUrl(target.subjectCutoutUrl);
    setCroppedCanvas(target.croppedCanvas);
  };

  // Update background config for active photo
  const handleChangeBackgroundConfig = (newBg: BackgroundConfig) => {
    setBackgroundConfig(newBg);
    if (activePhotoId) {
      setSheetPhotos((prev) =>
        prev.map((p) => (p.id === activePhotoId ? { ...p, backgroundConfig: newBg } : p))
      );
    }
  };

  // Update quantity copies for a single photo item
  const handleUpdatePhotoQuantity = (id: string, newQty: number) => {
    const evenQty = Math.max(2, Math.min(50, newQty % 2 === 0 ? newQty : newQty + 1));
    setSheetPhotos((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, quantity: evenQty } : p));
      const newTotal = updated.reduce((sum, p) => sum + p.quantity, 0);
      setConfig((c) => ({ ...c, quantity: newTotal }));
      return updated;
    });
  };

  // Split sheet slots evenly among all photos on the sheet
  const handleSplitEvenly = () => {
    setSheetPhotos((prev) => {
      if (prev.length <= 1) return prev;
      const total = prev.reduce((sum, p) => sum + p.quantity, 0) || config.quantity;
      let perPhoto = Math.floor(total / prev.length / 2) * 2;
      if (perPhoto < 2) perPhoto = 2;
      const remainder = total - perPhoto * prev.length;

      return prev.map((p, idx) => ({
        ...p,
        quantity: idx === 0 && remainder > 0 && remainder % 2 === 0 ? perPhoto + remainder : perPhoto
      }));
    });
  };

  // Remove photo from sheet (if more than 1)
  const handleRemovePhoto = (id: string) => {
    setSheetPhotos((prev) => {
      if (prev.length <= 1) return prev;
      const remaining = prev.filter((p) => p.id !== id);

      if (activePhotoId === id && remaining.length > 0) {
        const nextActive = remaining[0];
        setActivePhotoId(nextActive.id);
        setImageSrc(nextActive.originalSrc);
        setBackgroundConfig(nextActive.backgroundConfig);
        setSubjectCutoutUrl(nextActive.subjectCutoutUrl);
        setCroppedCanvas(nextActive.croppedCanvas);
      }

      const newTotal = remaining.reduce((sum, p) => sum + p.quantity, 0);
      setConfig((c) => ({ ...c, quantity: newTotal }));
      return remaining;
    });
  };

  const handleLoadSample = () => {
    if (SAMPLE_IMAGES.length > 0) {
      const sample = SAMPLE_IMAGES[0];
      handleImageSelected(sample.url, sample.name);
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setCroppedCanvas(null);
    setSubjectCutoutUrl(null);
    setBackgroundConfig(DEFAULT_BACKGROUND_CONFIG);
    setSheetPhotos([]);
    setActivePhotoId(null);
  };

  const handleSelectPreset = (preset: PhotoSizePreset) => {
    setSelectedPreset(preset);
    setConfig((prev) => {
      let adjustedQty = prev.quantity;
      if (preset.id === 'postcard' && prev.quantity > 8) {
        adjustedQty = 4;
      } else if (preset.id === 'stamp' && prev.quantity < 16) {
        adjustedQty = 30;
      }
      return {
        ...prev,
        selectedPresetId: preset.id,
        quantity: adjustedQty
      };
    });
  };

  // Crop studio finished rendering output canvas
  const handleCropComplete = useCallback((canvas: HTMLCanvasElement) => {
    setCroppedCanvas(canvas);
    if (activePhotoId) {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setSheetPhotos((prev) =>
        prev.map((p) =>
          p.id === activePhotoId
            ? { ...p, croppedCanvas: canvas, croppedDataUrl: dataUrl }
            : p
        )
      );
    }
  }, [activePhotoId]);

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 flex flex-col font-sans selection:bg-amber-200 selection:text-zinc-900">
      {/* Top Header */}
      <Header
        onLoadSample={handleLoadSample}
        onReset={handleReset}
        hasImage={!!imageSrc}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!imageSrc ? (
          <UploadSection onImageSelected={(src) => handleImageSelected(src, 'Photo 1')} />
        ) : (
          <div className="space-y-6">
            {/* Step 0: Multi-Photo A4 Sheet Manager */}
            {sheetPhotos.length > 0 && (
              <PhotoBatchManager
                photos={sheetPhotos}
                activePhotoId={activePhotoId}
                onSelectPhoto={handleSelectActivePhoto}
                onAddPhotoClick={() => setIsAddModalOpen(true)}
                onUpdateQuantity={handleUpdatePhotoQuantity}
                onRemovePhoto={handleRemovePhoto}
                onSplitEvenly={handleSplitEvenly}
                layout={layout}
              />
            )}

            {/* Background Studio: Any Colour, Device Image, or Internet Image */}
            <BackgroundSelector
              config={backgroundConfig}
              onChangeConfig={handleChangeBackgroundConfig}
              isExtracting={isExtractingCutout}
              extractionProgress={extractionProgress}
              hasCutout={!!subjectCutoutUrl}
              onTriggerExtraction={() => handleTriggerExtraction()}
            />

            {/* Step 1: Interactive Cropping Studio */}
            <CropStudio
              key={activePhotoId || 'studio'}
              imageSrc={imageSrc}
              selectedPreset={selectedPreset}
              onSelectPreset={handleSelectPreset}
              onCropComplete={handleCropComplete}
              backgroundConfig={backgroundConfig}
              subjectCutoutUrl={subjectCutoutUrl}
              isExtractingCutout={isExtractingCutout}
              extractionProgress={extractionProgress}
            />

            {/* Step 2: Print Configuration & Even Quantity Selection */}
            <PrintConfigPanel
              config={config}
              onChangeConfig={setConfig}
              layout={layout}
              photos={sheetPhotos}
            />

            {/* Step 3: Realistic A4 Sheet Preview */}
            <A4SheetPreview
              layout={layout}
              config={config}
              croppedCanvas={croppedCanvas}
              photos={sheetPhotos}
            />

            {/* Quick Add Another Photo Banner under Sheet Preview */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">
                    Want to add another photo to this same A4 sheet?
                  </h4>
                  <p className="text-xs text-zinc-600">
                    Upload another person's photo or pose, set its background, and print them together side-by-side.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                + Upload Another Photo
              </button>
            </div>

            {/* Step 4: Download in JPEG, PDF, and Direct Print */}
            <ExportActions
              layout={layout}
              config={config}
              croppedCanvas={croppedCanvas}
              photos={sheetPhotos}
            />
          </div>
        )}
      </main>

      {/* Modal for adding another photo */}
      <AddPhotoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPhotoAdded={handleAddAnotherPhoto}
        existingCount={sheetPhotos.length}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-mono">
            <span className="font-bold text-zinc-800">XEROX</span> • Precision Photo & A4 Sheet Layout Studio
          </p>
          <p>
            Standard Sizes: Passport (35×45mm), Stamp (20×25mm), Postcard (100×150mm) • 300 DPI High Resolution
          </p>
        </div>
      </footer>
    </div>
  );
}
