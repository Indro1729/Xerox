import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  FlipHorizontal,
  Sliders,
  Maximize2,
  RefreshCw,
  Eye,
  Check,
  Crop as CropIcon,
  Sparkles
} from 'lucide-react';
import { PhotoSizePreset, ImageAdjustments } from '../types';
import { PHOTO_SIZE_PRESETS, PX_PER_MM_300 } from '../utils/photoSizes';
import { BackgroundConfig, DEFAULT_BACKGROUND_CONFIG } from '../utils/backgroundEngine';

interface CropStudioProps {
  imageSrc: string;
  selectedPreset: PhotoSizePreset;
  onSelectPreset: (preset: PhotoSizePreset) => void;
  onCropComplete: (croppedCanvas: HTMLCanvasElement) => void;
  backgroundConfig?: BackgroundConfig;
  subjectCutoutUrl?: string | null;
  isExtractingCutout?: boolean;
  extractionProgress?: string;
}

export const CropStudio: React.FC<CropStudioProps> = ({
  imageSrc,
  selectedPreset,
  onSelectPreset,
  onCropComplete,
  backgroundConfig = DEFAULT_BACKGROUND_CONFIG,
  subjectCutoutUrl = null,
  isExtractingCutout = false,
  extractionProgress = ''
}) => {
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [loadedCutoutImage, setLoadedCutoutImage] = useState<HTMLImageElement | null>(null);
  const [loadedDeviceBg, setLoadedDeviceBg] = useState<HTMLImageElement | null>(null);
  const [loadedInternetBg, setLoadedInternetBg] = useState<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Adjustments state
  const [zoom, setZoom] = useState<number>(1.15);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0); // in degrees
  const [fineRotation, setFineRotation] = useState<number>(0); // -15 to +15
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(100); // percentage
  const [contrast, setContrast] = useState<number>(100); // percentage
  const [showFaceGuide, setShowFaceGuide] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // Dragging state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setLoadedImage(img);
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      // Reset pan/zoom on new image
      setPan({ x: 0, y: 0 });
      setZoom(1.15);
      setRotation(0);
      setFineRotation(0);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Load subject cutout image
  useEffect(() => {
    if (!subjectCutoutUrl) {
      setLoadedCutoutImage(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setLoadedCutoutImage(img);
    };
    img.src = subjectCutoutUrl;
  }, [subjectCutoutUrl]);

  // Load device background image
  useEffect(() => {
    if (!backgroundConfig.deviceImageSrc) {
      setLoadedDeviceBg(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setLoadedDeviceBg(img);
    };
    img.src = backgroundConfig.deviceImageSrc;
  }, [backgroundConfig.deviceImageSrc]);

  // Load internet background image
  useEffect(() => {
    if (!backgroundConfig.internetImageUrl) {
      setLoadedInternetBg(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setLoadedInternetBg(img);
    };
    img.src = backgroundConfig.internetImageUrl;
  }, [backgroundConfig.internetImageUrl]);

  // Generate cropped output canvas
  const generateCroppedCanvas = useCallback(() => {
    if (!loadedImage) return;

    // Target output dimensions in pixels at 300 DPI
    const targetWidthPx = Math.round(selectedPreset.widthMm * PX_PER_MM_300);
    const targetHeightPx = Math.round(selectedPreset.heightMm * PX_PER_MM_300);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = targetWidthPx;
    outCanvas.height = targetHeightPx;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    // Enable high-quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const isCustomBg = backgroundConfig.type !== 'original' && loadedCutoutImage;

    // 1. Draw Background Layer
    if (isCustomBg) {
      if (backgroundConfig.type === 'color') {
        ctx.fillStyle = backgroundConfig.color;
        ctx.fillRect(0, 0, targetWidthPx, targetHeightPx);
      } else if (backgroundConfig.type === 'device' && loadedDeviceBg) {
        ctx.save();
        if (backgroundConfig.blurBackground > 0) {
          ctx.filter = `blur(${Math.round(backgroundConfig.blurBackground * (targetWidthPx / 300))}px)`;
        }
        const bgScale = Math.max(
          targetWidthPx / loadedDeviceBg.naturalWidth,
          targetHeightPx / loadedDeviceBg.naturalHeight
        );
        const bgW = loadedDeviceBg.naturalWidth * bgScale;
        const bgH = loadedDeviceBg.naturalHeight * bgScale;
        ctx.drawImage(loadedDeviceBg, (targetWidthPx - bgW) / 2, (targetHeightPx - bgH) / 2, bgW, bgH);
        ctx.restore();
      } else if (backgroundConfig.type === 'internet' && loadedInternetBg) {
        ctx.save();
        if (backgroundConfig.blurBackground > 0) {
          ctx.filter = `blur(${Math.round(backgroundConfig.blurBackground * (targetWidthPx / 300))}px)`;
        }
        const bgScale = Math.max(
          targetWidthPx / loadedInternetBg.naturalWidth,
          targetHeightPx / loadedInternetBg.naturalHeight
        );
        const bgW = loadedInternetBg.naturalWidth * bgScale;
        const bgH = loadedInternetBg.naturalHeight * bgScale;
        ctx.drawImage(loadedInternetBg, (targetWidthPx - bgW) / 2, (targetHeightPx - bgH) / 2, bgW, bgH);
        ctx.restore();
      } else {
        ctx.fillStyle = backgroundConfig.color || '#FFFFFF';
        ctx.fillRect(0, 0, targetWidthPx, targetHeightPx);
      }
    } else {
      // Background: pure white base
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidthPx, targetHeightPx);
    }

    // 2. Draw Subject Portrait Layer
    const activeSubject = isCustomBg ? loadedCutoutImage : loadedImage;

    ctx.save();

    // Filters: brightness & contrast
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    // Move origin to center of output canvas
    ctx.translate(targetWidthPx / 2, targetHeightPx / 2);

    // Apply rotation
    const totalRotationRad = ((rotation + fineRotation) * Math.PI) / 180;
    ctx.rotate(totalRotationRad);

    // Flip if mirrored
    if (isFlipped) {
      ctx.scale(-1, 1);
    }

    // Compute scale to cover target canvas
    const baseScale = Math.max(
      targetWidthPx / activeSubject.naturalWidth,
      targetHeightPx / activeSubject.naturalHeight
    );
    const finalScale = baseScale * zoom;

    // Translate by user pan offset (scaled to target dimensions)
    ctx.translate(pan.x * (targetWidthPx / 320), pan.y * (targetHeightPx / (320 / selectedPreset.aspectRatio)));

    // Draw image centered
    const drawW = activeSubject.naturalWidth * finalScale;
    const drawH = activeSubject.naturalHeight * finalScale;
    ctx.drawImage(activeSubject, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();

    // Update live preview in previewCanvasRef if mounted
    if (previewCanvasRef.current) {
      const pCtx = previewCanvasRef.current.getContext('2d');
      if (pCtx) {
        previewCanvasRef.current.width = targetWidthPx;
        previewCanvasRef.current.height = targetHeightPx;
        pCtx.drawImage(outCanvas, 0, 0);
      }
    }

    onCropComplete(outCanvas);
  }, [
    loadedImage,
    loadedCutoutImage,
    loadedDeviceBg,
    loadedInternetBg,
    backgroundConfig,
    selectedPreset,
    zoom,
    pan,
    rotation,
    fineRotation,
    isFlipped,
    brightness,
    contrast,
    onCropComplete
  ]);

  // Trigger crop update whenever adjustment parameters change
  useEffect(() => {
    generateCroppedCanvas();
  }, [generateCroppedCanvas]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y
    });
  };

  const resetAdjustments = () => {
    setZoom(1.15);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setFineRotation(0);
    setIsFlipped(false);
    setBrightness(100);
    setContrast(100);
  };

  // Compute aspect ratio dimensions for the interactive crop container
  const boxWidth = 280;
  const boxHeight = Math.round(boxWidth / selectedPreset.aspectRatio);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 sm:p-6 mb-8">
      {/* Preset Selector Tabs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 flex items-center gap-2">
              <CropIcon className="w-5 h-5 text-amber-600" />
              1. Select Official Photo Size
            </h2>
            <p className="text-xs text-zinc-500">
              Select standard dimensions for passport, official stamp, or exam postcard:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PHOTO_SIZE_PRESETS.map((preset) => {
            const isSelected = preset.id === selectedPreset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-sm'
                    : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-zinc-100/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-3" />
                  </div>
                )}
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 block mb-0.5">
                  {preset.category}
                </span>
                <span className="font-bold text-sm text-zinc-900 block">
                  {preset.name}
                </span>
                <span className="font-mono text-xs text-zinc-600 font-semibold block mt-0.5">
                  {preset.widthMm} × {preset.heightMm} mm
                </span>
                <span className="text-[11px] text-zinc-500 mt-1 block line-clamp-1">
                  {preset.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cropper Viewport (Left / Center) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-zinc-700">
              Interactive Framing Area
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFaceGuide(!showFaceGuide)}
                className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1 transition-colors cursor-pointer ${
                  showFaceGuide
                    ? 'bg-amber-100/80 border-amber-300 text-amber-900 font-medium'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Biometric Face Guide</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1 transition-colors cursor-pointer ${
                  showGrid
                    ? 'bg-amber-100/80 border-amber-300 text-amber-900 font-medium'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Grid 3×3</span>
              </button>
            </div>
          </div>

          {/* Cropping Stage */}
          <div
            className="relative bg-zinc-900/95 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-6 w-full max-w-md select-none touch-none cursor-grab active:cursor-grabbing border border-zinc-800"
            style={{ minHeight: '380px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            onWheel={(e) => {
              e.preventDefault();
              setZoom((prev) => Math.min(3, Math.max(0.8, prev - e.deltaY * 0.001)));
            }}
          >
            {/* Cropping Aperture / Frame */}
            <div
              className="relative overflow-hidden shadow-2xl rounded-sm ring-4 ring-amber-500/80 bg-zinc-800"
              style={{
                width: `${boxWidth}px`,
                height: `${boxHeight}px`
              }}
            >
              {/* Background Layer inside Aperture */}
              {backgroundConfig.type === 'color' && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ backgroundColor: backgroundConfig.color }}
                />
              )}
              {backgroundConfig.type === 'device' && backgroundConfig.deviceImageSrc && (
                <img
                  src={backgroundConfig.deviceImageSrc}
                  alt="Device Background"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{
                    filter: backgroundConfig.blurBackground > 0 ? `blur(${backgroundConfig.blurBackground}px)` : 'none'
                  }}
                />
              )}
              {backgroundConfig.type === 'internet' && backgroundConfig.internetImageUrl && (
                <img
                  src={backgroundConfig.internetImageUrl}
                  alt="Internet Background"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{
                    filter: backgroundConfig.blurBackground > 0 ? `blur(${backgroundConfig.blurBackground}px)` : 'none'
                  }}
                  crossOrigin="anonymous"
                />
              )}

              {/* Rendered Image under transform */}
              {loadedImage && (
                <div
                  className="w-full h-full relative"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.05s ease-out'
                  }}
                >
                  {((backgroundConfig.type !== 'original' && subjectCutoutUrl) || imageSrc) ? (
                    <img
                      src={
                        backgroundConfig.type !== 'original' && subjectCutoutUrl
                          ? subjectCutoutUrl
                          : imageSrc
                      }
                      alt="Customer Portrait"
                      className="absolute max-w-none pointer-events-none origin-center"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) scale(${zoom}) rotate(${rotation + fineRotation}deg) scaleX(${isFlipped ? -1 : 1})`,
                        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                        width: `${Math.max(boxWidth, boxHeight * (imageSize.width / (imageSize.height || 1)))}px`
                      }}
                      crossOrigin="anonymous"
                    />
                  ) : null}
                </div>
              )}

              {/* Subject Isolation Progress Overlay */}
              {isExtractingCutout && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white pointer-events-none z-20 p-4 text-center">
                  <RefreshCw className="w-7 h-7 animate-spin text-amber-400 mb-2" />
                  <span className="text-xs font-bold">Isolating Portrait...</span>
                  <span className="text-[10px] text-zinc-300 mt-1 max-w-[180px] truncate">
                    {extractionProgress || 'AI neural background removal...'}
                  </span>
                </div>
              )}

              {/* Biometric Oval Guide Overlay */}
              {showFaceGuide && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  {/* Head Oval */}
                  <div
                    className="border-2 border-dashed border-amber-300/80 rounded-[50%_50%_45%_45%] shadow-sm"
                    style={{
                      width: `${boxWidth * 0.58}px`,
                      height: `${boxHeight * 0.7}px`,
                      marginTop: `-${boxHeight * 0.04}px`
                    }}
                  />
                  {/* Eye Level Guideline */}
                  <div
                    className="absolute w-3/4 border-b border-amber-300/60"
                    style={{ top: `${boxHeight * 0.45}px` }}
                  >
                    <span className="absolute -top-4 right-0 text-[9px] font-mono text-amber-300/90 font-bold tracking-tight">
                      EYE LEVEL (32-36mm)
                    </span>
                  </div>
                  {/* Chin Level Guideline */}
                  <div
                    className="absolute w-1/2 border-b border-dashed border-amber-300/40"
                    style={{ top: `${boxHeight * 0.8}px` }}
                  >
                    <span className="absolute -bottom-3.5 right-0 text-[8px] font-mono text-amber-300/80">
                      CHIN LINE
                    </span>
                  </div>
                </div>
              )}

              {/* 3x3 Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-b border-white/20"></div>
                  <div className="border-r border-white/20"></div>
                  <div className="border-r border-white/20"></div>
                  <div></div>
                </div>
              )}

              {/* Corner tick marks */}
              <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
              <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
              <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
              <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400 pointer-events-none" />
            </div>

            {/* Instruction badge */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] text-zinc-300 pointer-events-none">
              Drag to position photo • Scroll to zoom
            </div>
          </div>
        </div>

        {/* Controls & Live Preview (Right) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Live Cropped Result Card */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                Live Cropped Photo Result
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-zinc-700 border border-zinc-200 font-semibold">
                {selectedPreset.widthMm} × {selectedPreset.heightMm} mm
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="shrink-0 p-1.5 bg-white border border-zinc-300 rounded-lg shadow-sm">
                <canvas
                  ref={previewCanvasRef}
                  className="rounded object-cover"
                  style={{
                    width: '64px',
                    height: `${Math.round(64 / selectedPreset.aspectRatio)}px`
                  }}
                />
              </div>

              <div className="text-xs text-zinc-600 space-y-1">
                <p className="font-semibold text-zinc-900">
                  {selectedPreset.name} Ready
                </p>
                <p className="text-[11px] text-zinc-500">
                  {selectedPreset.commonUse}
                </p>
                <p className="text-[10px] text-zinc-400 font-mono">
                  Scale: 300 DPI ({Math.round(selectedPreset.widthMm * PX_PER_MM_300)} × {Math.round(selectedPreset.heightMm * PX_PER_MM_300)} px)
                </p>
              </div>
            </div>
          </div>

          {/* Zoom & Transform Controls */}
          <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-3.5 text-xs">
            {/* Zoom Slider */}
            <div>
              <div className="flex items-center justify-between text-zinc-700 font-medium mb-1.5">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5 text-zinc-500" /> Zoom / Scale
                </span>
                <span className="font-mono text-zinc-500">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <ZoomOut className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="range"
                  min="0.8"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                />
                <ZoomIn className="w-3.5 h-3.5 text-zinc-400" />
              </div>
            </div>

            {/* Fine Angle Straighten */}
            <div>
              <div className="flex items-center justify-between text-zinc-700 font-medium mb-1.5">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-zinc-500" /> Straighten Angle
                </span>
                <span className="font-mono text-zinc-500">
                  {fineRotation > 0 ? `+${fineRotation}°` : `${fineRotation}°`}
                </span>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                step="0.5"
                value={fineRotation}
                onChange={(e) => setFineRotation(parseFloat(e.target.value))}
                className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5">
                <span>-15°</span>
                <span onClick={() => setFineRotation(0)} className="cursor-pointer hover:text-zinc-700">0° Center</span>
                <span>+15°</span>
              </div>
            </div>

            {/* 90-degree Rotation & Flip Quick Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>-90°</span>
              </button>

              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>+90°</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFlipped(!isFlipped)}
                className={`p-2 rounded-lg border font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                  isFlipped
                    ? 'border-amber-400 bg-amber-50 text-amber-900'
                    : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>Mirror</span>
              </button>
            </div>

            {/* Brightness & Contrast */}
            <div className="pt-2 border-t border-zinc-100 space-y-2.5">
              <div>
                <div className="flex items-center justify-between text-zinc-600 text-[11px] mb-1">
                  <span>Lighting / Brightness</span>
                  <span className="font-mono">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="125"
                  step="1"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-zinc-600 text-[11px] mb-1">
                  <span>Contrast</span>
                  <span className="font-mono">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="125"
                  step="1"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Reset button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={resetAdjustments}
                className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Crop & Color</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
