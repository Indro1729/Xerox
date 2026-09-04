import React, { useRef, useState } from 'react';
import {
  X,
  Upload,
  Camera,
  Sparkles,
  AlertCircle,
  Plus
} from 'lucide-react';
import { SAMPLE_IMAGES } from '../utils/sampleImages';

interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoAdded: (imageDataUrl: string, fileName?: string) => void;
  existingCount: number;
}

export const AddPhotoModal: React.FC<AddPhotoModalProps> = ({
  isOpen,
  onClose,
  onPhotoAdded,
  existingCount
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WEBP).');
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
        onPhotoAdded(e.target.result, file.name.replace(/\.[^/.]+$/, ''));
        onClose();
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
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      stopCamera();
      onPhotoAdded(dataUrl, `Camera Capture ${existingCount + 1}`);
      onClose();
    }
  };

  const handleSelectSample = (url: string, name: string) => {
    onPhotoAdded(url, name);
    onClose();
  };

  const handleModalClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Add Another Photo to A4 Sheet
              </h3>
              <p className="text-xs text-zinc-500">
                Both photos will be printed together on the same A4 paper sheet
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Camera View Mode */}
          {isCameraActive ? (
            <div className="bg-zinc-900 rounded-2xl overflow-hidden p-3 flex flex-col items-center">
              <div className="relative w-full max-w-md aspect-4/3 bg-black rounded-xl overflow-hidden mb-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={captureCameraPhoto}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel Camera
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Drag & Drop Area */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-amber-500 bg-amber-50/50'
                    : 'border-zinc-300 hover:border-amber-400 bg-zinc-50/50 hover:bg-zinc-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-3">
                  <Upload className="w-6 h-6" />
                </div>

                <h4 className="text-sm font-bold text-zinc-800 mb-1">
                  Click to Browse or Drag & Drop Photo {existingCount + 1}
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-3">
                  High resolution portrait photo (JPEG, PNG, WEBP up to 25MB). You can crop and set background right after adding.
                </p>

                <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-100/70 border border-amber-200 px-3.5 py-1.5 rounded-lg">
                  <Upload className="w-3.5 h-3.5" />
                  Select File from Computer / Phone
                </div>
              </div>

              {/* Alternative Options */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-amber-600" />
                  Take Photo with Webcam
                </button>

                {/* Instant Sample Pickers */}
                <div className="w-full sm:w-auto flex items-center justify-end gap-2">
                  <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Quick sample:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {SAMPLE_IMAGES.map((sample, idx) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => handleSelectSample(sample.url, sample.name || `Sample ${idx + 1}`)}
                        className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 hover:border-amber-500 transition-all hover:scale-110 shadow-xs cursor-pointer"
                        title={sample.name}
                      >
                        <img
                          src={sample.url}
                          alt={sample.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
