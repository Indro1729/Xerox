import React, { useState, useRef } from 'react';
import {
  Palette,
  Upload,
  Globe,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Sparkles,
  Sliders,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  BackgroundConfig,
  OFFICIAL_COLOR_PRESETS,
  INTERNET_BACKGROUND_PRESETS,
  InternetBackgroundPreset
} from '../utils/backgroundEngine';

interface BackgroundSelectorProps {
  config: BackgroundConfig;
  onChangeConfig: (newConfig: BackgroundConfig) => void;
  isExtracting: boolean;
  extractionProgress: string;
  hasCutout: boolean;
  onTriggerExtraction: () => void;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  config,
  onChangeConfig,
  isExtracting,
  extractionProgress,
  hasCutout,
  onTriggerExtraction
}) => {
  const [activeTab, setActiveTab] = useState<'color' | 'device' | 'internet'>(
    config.type === 'original' ? 'color' : config.type
  );
  const [customHex, setCustomHex] = useState(config.color);
  const [internetInputUrl, setInternetInputUrl] = useState(config.internetImageUrl);
  const [internetError, setInternetError] = useState<string | null>(null);
  const [isLoadingInternetImg, setIsLoadingInternetImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Apply color preset
  const handleSelectColor = (hex: string) => {
    setCustomHex(hex);
    onChangeConfig({
      ...config,
      type: 'color',
      color: hex
    });
    if (!hasCutout && !isExtracting) {
      onTriggerExtraction();
    }
  };

  // Handle custom color input
  const handleCustomColorChange = (hex: string) => {
    setCustomHex(hex);
    onChangeConfig({
      ...config,
      type: 'color',
      color: hex
    });
    if (!hasCutout && !isExtracting) {
      onTriggerExtraction();
    }
  };

  // Handle local device image file upload
  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChangeConfig({
        ...config,
        type: 'device',
        deviceImageSrc: dataUrl,
        deviceImageName: file.name
      });
      if (!hasCutout && !isExtracting) {
        onTriggerExtraction();
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected if needed
    e.target.value = '';
  };

  // Handle internet image URL apply
  const handleApplyInternetUrl = (urlToLoad: string) => {
    if (!urlToLoad.trim()) {
      setInternetError('Please enter a valid image URL');
      return;
    }

    setInternetError(null);
    setIsLoadingInternetImg(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      setIsLoadingInternetImg(false);
      onChangeConfig({
        ...config,
        type: 'internet',
        internetImageUrl: urlToLoad,
        internetPresetId: null
      });
      if (!hasCutout && !isExtracting) {
        onTriggerExtraction();
      }
    };

    img.onerror = () => {
      // Try fallback with cors proxy if direct failed
      const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(urlToLoad)}`;
      const proxyImg = new Image();
      proxyImg.crossOrigin = 'anonymous';
      proxyImg.onload = () => {
        setIsLoadingInternetImg(false);
        onChangeConfig({
          ...config,
          type: 'internet',
          internetImageUrl: proxyUrl,
          internetPresetId: null
        });
        if (!hasCutout && !isExtracting) {
          onTriggerExtraction();
        }
      };
      proxyImg.onerror = () => {
        setIsLoadingInternetImg(false);
        setInternetError('Unable to load image from this URL. Check connection or CORS permissions.');
      };
      proxyImg.src = proxyUrl;
    };

    img.src = urlToLoad;
  };

  // Select internet preset
  const handleSelectInternetPreset = (preset: InternetBackgroundPreset) => {
    setInternetInputUrl(preset.url);
    setInternetError(null);
    onChangeConfig({
      ...config,
      type: 'internet',
      internetImageUrl: preset.url,
      internetPresetId: preset.id
    });
    if (!hasCutout && !isExtracting) {
      onTriggerExtraction();
    }
  };

  // Reset to original background
  const handleResetToOriginal = () => {
    onChangeConfig({
      ...config,
      type: 'original'
    });
  };

  const isOriginal = config.type === 'original';

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 sm:p-6 mb-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-900">
              Change Photo Background
            </h2>
            {config.type !== 'original' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-3 h-3 stroke-3" />
                AI Cutout Active
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Replace original background with official passport colours, your own device photo, or web images:
          </p>
        </div>

        {/* Original vs Replaced Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToOriginal}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
              isOriginal
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Keep Original</span>
          </button>

          {config.type !== 'original' && (
            <button
              type="button"
              onClick={handleResetToOriginal}
              className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1 cursor-pointer transition-colors"
              title="Revert back to original photo background"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress alert when AI model is extracting subject */}
      {isExtracting && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-800 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold block">Isolating Portrait with AI...</span>
            <span className="text-[11px] text-amber-700">{extractionProgress || 'Removing original background cleanly...'}</span>
          </div>
        </div>
      )}

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-zinc-200 mb-5">
        <button
          type="button"
          onClick={() => {
            setActiveTab('color');
            if (config.type !== 'color') {
              onChangeConfig({ ...config, type: 'color' });
              if (!hasCutout && !isExtracting) onTriggerExtraction();
            }
          }}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'color' && !isOriginal
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>1. Any Colour</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('device');
            if (config.type !== 'device' && config.deviceImageSrc) {
              onChangeConfig({ ...config, type: 'device' });
              if (!hasCutout && !isExtracting) onTriggerExtraction();
            }
          }}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'device' && !isOriginal
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>2. Image from Device</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('internet');
            if (config.type !== 'internet' && config.internetImageUrl) {
              onChangeConfig({ ...config, type: 'internet' });
              if (!hasCutout && !isExtracting) onTriggerExtraction();
            }
          }}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'internet' && !isOriginal
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>3. Image from Internet</span>
        </button>
      </div>

      {/* Tab 1: Solid Colour & Custom Colour */}
      {activeTab === 'color' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                Official Standard Colours
              </span>
              <span className="text-[11px] text-zinc-500">
                Click any preset to apply instantly
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {OFFICIAL_COLOR_PRESETS.map((preset) => {
                const isSelected = !isOriginal && config.type === 'color' && config.color.toUpperCase() === preset.hex.toUpperCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectColor(preset.hex)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-sm'
                        : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-zinc-100/50'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg border border-zinc-300 shadow-inner shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && (
                        <Check
                          className={`w-4 h-4 ${
                            preset.hex === '#FFFFFF' || preset.hex === '#F8FAFC' || preset.hex === '#FEF3C7'
                              ? 'text-zinc-900'
                              : 'text-white'
                          } stroke-3`}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-zinc-900 block truncate">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 block truncate font-mono">
                        {preset.use}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Picker & Hex Input */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-600" />
                  Custom Colour (Any Hex / Palette)
                </span>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Choose any custom tone, pastel, or corporate brand color
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="relative cursor-pointer flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 transition-colors shadow-sm">
                  <input
                    type="color"
                    value={customHex}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-xs font-semibold text-zinc-700">Pick Color</span>
                </label>

                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-zinc-300 font-mono text-xs">
                  <span className="text-zinc-400">#</span>
                  <input
                    type="text"
                    maxLength={6}
                    value={customHex.replace('#', '')}
                    onChange={(e) => {
                      const val = `#${e.target.value.replace(/[^0-9A-Fa-f]/g, '')}`;
                      setCustomHex(val);
                      if (val.length === 7) {
                        handleCustomColorChange(val);
                      }
                    }}
                    className="w-16 font-mono text-xs text-zinc-800 uppercase focus:outline-none"
                    placeholder="FFFFFF"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Image from Device */}
      {activeTab === 'device' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-zinc-300 hover:border-amber-500 rounded-2xl p-6 text-center transition-colors bg-zinc-50/50">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleDeviceFileUpload}
              className="hidden"
            />

            {config.deviceImageSrc ? (
              <div className="space-y-3">
                <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden border border-zinc-300 shadow-sm bg-white">
                  <img
                    src={config.deviceImageSrc}
                    alt="Device background"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-xs font-semibold text-zinc-800 block">
                    Current Device Background: {config.deviceImageName || 'Custom Photo'}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-1 mt-0.5">
                    <Check className="w-3 h-3" />
                    Applied as portrait background
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Choose Different Device Photo
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-zinc-800">
                  Upload Any Image from Your Device
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Select any photo, wall texture, scenery, or custom backdrop from your computer or phone.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Browse Device Files
                </button>
              </div>
            )}
          </div>

          {/* Background Blur Slider for Depth of Field */}
          {config.deviceImageSrc && (
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="flex items-center justify-between text-xs font-medium text-zinc-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                  Portrait Depth Blur (Simulate Studio Bokeh)
                </span>
                <span className="font-mono text-zinc-600">{config.blurBackground}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={config.blurBackground}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    blurBackground: parseInt(e.target.value, 10)
                  })
                }
                className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                <span>0px (Sharp)</span>
                <span>4px (Subtle Depth)</span>
                <span>12px (Soft Studio Blur)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Image from Internet */}
      {activeTab === 'internet' && (
        <div className="space-y-4">
          {/* URL Input Box */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
            <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide block">
              Enter Any Web Image URL
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={internetInputUrl}
                onChange={(e) => setInternetInputUrl(e.target.value)}
                placeholder="https://example.com/wallpaper.jpg or Unsplash link..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
              <button
                type="button"
                onClick={() => handleApplyInternetUrl(internetInputUrl)}
                disabled={isLoadingInternetImg || !internetInputUrl.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-zinc-300 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
              >
                {isLoadingInternetImg ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span>Apply URL</span>
                  </>
                )}
              </button>
            </div>

            {internetError && (
              <div className="p-2 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{internetError}</span>
              </div>
            )}
          </div>

          {/* Curated Internet Studio Presets Gallery */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                Curated High-Res Studio Internet Backdrops
              </span>
              <span className="text-[11px] text-zinc-500">1-click web download</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {INTERNET_BACKGROUND_PRESETS.map((preset) => {
                const isSelected =
                  !isOriginal &&
                  config.type === 'internet' &&
                  (config.internetPresetId === preset.id || config.internetImageUrl === preset.url);

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectInternetPreset(preset)}
                    className={`group relative rounded-xl border overflow-hidden text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-600 ring-2 ring-amber-500/30 shadow-md'
                        : 'border-zinc-200 hover:border-zinc-300 shadow-sm'
                    }`}
                  >
                    <div className="aspect-video w-full bg-zinc-100 overflow-hidden relative">
                      <img
                        src={preset.thumbnail}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        crossOrigin="anonymous"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 stroke-3" />
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                        {preset.category}
                      </span>
                    </div>

                    <div className="p-2 bg-white">
                      <span className="text-xs font-bold text-zinc-900 block truncate">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 block truncate">
                        {preset.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Blur Slider for Depth of Field */}
          {config.type === 'internet' && config.internetImageUrl && (
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="flex items-center justify-between text-xs font-medium text-zinc-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                  Portrait Depth Blur (Simulate Studio Bokeh)
                </span>
                <span className="font-mono text-zinc-600">{config.blurBackground}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={config.blurBackground}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    blurBackground: parseInt(e.target.value, 10)
                  })
                }
                className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                <span>0px (Crisp Wall)</span>
                <span>4px (Natural Blur)</span>
                <span>12px (Deep Studio Bokeh)</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
