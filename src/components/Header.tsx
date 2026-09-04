import React from 'react';
import { Printer, Sparkles, FileText, Image as ImageIcon, Scissors } from 'lucide-react';

interface HeaderProps {
  onLoadSample: () => void;
  onReset: () => void;
  hasImage: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onReset,
  hasImage
}) => {
  return (
    <header className="border-b border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
              <Printer className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-zinc-950 font-mono">
                  XEROX
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 tracking-wider">
                  Official Print Studio
                </span>
              </div>
              <p className="text-xs text-zinc-500 hidden sm:block">
                Passport, Stamp & Postcard photo layout on A4 with precision cut gaps
              </p>
            </div>
          </div>

          {/* Quick Info & Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!hasImage ? (
              <button
                type="button"
                onClick={onLoadSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
                title="Load a sample portrait to test immediately"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Try Sample Photo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <span>New Photo</span>
              </button>
            )}

            <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500 pl-2 border-l border-zinc-200">
              <span className="inline-flex items-center gap-1 text-zinc-600">
                <Scissors className="w-3.5 h-3.5 text-zinc-400" /> Cut Gaps
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-zinc-600">
                <FileText className="w-3.5 h-3.5 text-zinc-400" /> PDF & JPEG
              </span>
              <span>•</span>
              <span className="font-mono text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded text-[11px]">
                300 DPI A4
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
