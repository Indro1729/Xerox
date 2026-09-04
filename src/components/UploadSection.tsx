import React, { useRef, useState } from 'react';
import { Upload, Camera, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { SAMPLE_IMAGES } from '../utils/sampleImages';

interface UploadSectionProps {
  onImageSelected: (imageDataUrl: string) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('Image size is too large (max 25MB).');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        onImageSelected(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const startCamera = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setErrorMessage('Camera access was denied or not available. Please upload a file instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Flip horizontal for natural selfie mirror
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      stopCamera();
      onImageSelected(dataUrl);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
          Print Ready Official Photos on A4
        </h1>
        <p className="mt-3 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto">
          Upload your portrait, crop to standard <span className="font-semibold text-zinc-900">Passport</span>,{' '}
          <span className="font-semibold text-zinc-900">Stamp</span>, or{' '}
          <span className="font-semibold text-zinc-900">Postcard</span> size, select any even number up to 50, and download high-resolution A4 sheets with cutting gaps.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {isCameraActive ? (
        <div className="bg-zinc-900 rounded-2xl p-6 text-center text-white max-w-xl mx-auto shadow-xl">
          <h3 className="font-medium text-lg mb-2">Align Face for Official Photo</h3>
          <p className="text-xs text-zinc-400 mb-4">
            Look directly into camera with neutral expression and balanced lighting
          </p>
          <div className="relative rounded-xl overflow-hidden bg-black aspect-4/3 max-w-md mx-auto border border-zinc-700">
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && streamRef.current && el.srcObject !== streamRef.current) {
                  el.srcObject = streamRef.current;
                }
              }}
              autoPlay
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
            {/* Biometric guide overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-64 border-2 border-dashed border-amber-400/80 rounded-[50%_50%_45%_45%]"></div>
            </div>
          </div>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={captureCameraPhoto}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-md"
            >
              Take Photo
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Drag-Drop Upload Area */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-amber-500 bg-amber-50/50 scale-[1.01]'
                : 'border-zinc-300 hover:border-zinc-400 bg-white hover:bg-zinc-50/50 shadow-sm'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            <div className="w-16 h-16 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-zinc-900">
              Upload Customer Photo
            </h2>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
              Drag & drop your portrait here, or{' '}
              <span className="text-amber-700 font-semibold underline underline-offset-2">
                browse files
              </span>
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> JPEG, PNG, WEBP supported
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> High-res up to 25MB
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Instant local processing
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-200/80 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startCamera();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-zinc-600" />
                <span>Use Webcam / Selfie</span>
              </button>
            </div>
          </div>

          {/* Sample Photos for Quick Test */}
          <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Quick Test with Sample Portraits
                </h3>
                <p className="text-xs text-zinc-500">
                  Click any sample portrait to test the passport cropping and A4 sheet generator right away:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => onImageSelected(sample.url)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-zinc-200 hover:border-amber-400 hover:shadow-sm text-left transition-all group cursor-pointer"
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-12 h-14 object-cover rounded-lg border border-zinc-200 group-hover:scale-105 transition-transform"
                    crossOrigin="anonymous"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-900 truncate">
                      {sample.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 leading-snug truncate">
                      {sample.note}
                    </p>
                    <span className="text-[10px] text-amber-700 font-medium mt-0.5 inline-block">
                      Click to use →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Official Photo Specs Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-600">
            <div className="p-4 rounded-xl bg-white border border-zinc-200">
              <span className="font-bold text-zinc-900 block mb-1 text-sm">
                🛂 Passport Size (35 × 45 mm)
              </span>
              Standard international ratio (7:9). 70-80% face coverage from chin to crown, eye level centered.
            </div>
            <div className="p-4 rounded-xl bg-white border border-zinc-200">
              <span className="font-bold text-zinc-900 block mb-1 text-sm">
                🏷️ Stamp Size (20 × 25 mm)
              </span>
              Standard 2.0 × 2.5 cm compact size for admit cards, certificates, hall tickets & official applications.
            </div>
            <div className="p-4 rounded-xl bg-white border border-zinc-200">
              <span className="font-bold text-zinc-900 block mb-1 text-sm">
                ✉️ Postcard Size (100 × 150 mm)
              </span>
              4×6 inch standard print size for medical/competitive exam postcards, portfolios & archival sheets.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
