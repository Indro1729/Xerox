import { removeBackground, Config } from '@imgly/background-removal';

export interface BackgroundConfig {
  type: 'original' | 'color' | 'device' | 'internet';
  color: string;
  isGradient: boolean;
  gradientSecondaryColor: string;
  deviceImageSrc: string | null;
  deviceImageName: string | null;
  internetImageUrl: string;
  internetPresetId: string | null;
  blurBackground: number; // 0 to 15px blur
  edgeSmoothing: number; // 0 to 5px
}

export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  type: 'original',
  color: '#FFFFFF', // Default official white
  isGradient: false,
  gradientSecondaryColor: '#E2E8F0',
  deviceImageSrc: null,
  deviceImageName: null,
  internetImageUrl: '',
  internetPresetId: null,
  blurBackground: 0,
  edgeSmoothing: 1
};

export interface InternetBackgroundPreset {
  id: string;
  name: string;
  category: 'Studio' | 'Office' | 'Gradient' | 'Minimal';
  url: string;
  thumbnail: string;
  description: string;
}

export const INTERNET_BACKGROUND_PRESETS: InternetBackgroundPreset[] = [
  {
    id: 'studio-soft-grey',
    name: 'Studio Soft Grey',
    category: 'Studio',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop',
    description: 'Clean professional neutral studio gradient'
  },
  {
    id: 'studio-light-blue',
    name: 'Studio Light Blue',
    category: 'Studio',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=200&auto=format&fit=crop',
    description: 'Subtle light blue tone for official & academic IDs'
  },
  {
    id: 'clean-white-wall',
    name: 'Clean White Wall',
    category: 'Minimal',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=200&auto=format&fit=crop',
    description: 'Pure neutral bright minimalist wall'
  },
  {
    id: 'modern-office-blur',
    name: 'Modern Executive Office',
    category: 'Office',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=200&auto=format&fit=crop',
    description: 'Soft blurred contemporary workplace'
  },
  {
    id: 'executive-bookshelf',
    name: 'Academic Library',
    category: 'Office',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=200&auto=format&fit=crop',
    description: 'Sophisticated warm academic background'
  },
  {
    id: 'studio-navy-gradient',
    name: 'Studio Deep Navy',
    category: 'Gradient',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=200&auto=format&fit=crop',
    description: 'Classic dark royal blue studio backdrop'
  },
  {
    id: 'soft-beige-linen',
    name: 'Warm Linen Texture',
    category: 'Minimal',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=200&auto=format&fit=crop',
    description: 'Natural warm textured canvas'
  },
  {
    id: 'nature-bokeh',
    name: 'Outdoor Garden Bokeh',
    category: 'Minimal',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=200&auto=format&fit=crop',
    description: 'Soft out-of-focus natural green bokeh'
  }
];

export const OFFICIAL_COLOR_PRESETS = [
  { id: 'white', name: 'Official Pure White', hex: '#FFFFFF', use: 'US, Schengen, India, UK (Universal Standard)' },
  { id: 'light-blue', name: 'Passport Light Blue', hex: '#BCE0FD', use: 'Malaysia, Kuwait, Exam Admit Cards' },
  { id: 'sky-blue', name: 'Vibrant Sky Blue', hex: '#60A5FA', use: 'School, University & Corporate ID' },
  { id: 'royal-blue', name: 'Royal Navy Blue', hex: '#1D4ED8', use: 'Philippines, Sri Lanka, Singapore ID' },
  { id: 'light-grey', name: 'Light Neutral Grey', hex: '#E2E8F0', use: 'UK & Canada Passport Standard' },
  { id: 'off-white', name: 'Clean Off-White', hex: '#F8FAFC', use: 'Studio Portrait Standard' },
  { id: 'official-red', name: 'Official Crimson Red', hex: '#DC2626', use: 'Indonesia, China, Vietnam Standard' },
  { id: 'cream', name: 'Soft Warm Ivory', hex: '#FEF3C7', use: 'Warm Vintage / Postcard' },
  { id: 'charcoal', name: 'Executive Charcoal', hex: '#334155', use: 'Corporate Profile' },
  { id: 'slate', name: 'Cool Slate', hex: '#64748B', use: 'Badge / Modern ID' },
  { id: 'emerald', name: 'Studio Forest Green', hex: '#065F46', use: 'Specialty Passport / ID' },
  { id: 'black', name: 'Studio Pure Black', hex: '#09090B', use: 'Dramatic / Artistic' },
];

// In-memory cache of extracted subject cutouts to avoid re-running segmentation
const cutoutCache = new Map<string, string>();

/**
 * Fast client-side fallback segmentation algorithm based on corner background sampling and edge feathering.
 * Used if network is disconnected, offline, or if neural model fails to load.
 */
export async function fastClientSideSegment(imageSrc: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 1200;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        resolve(imageSrc);
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Sample 4 corners to detect background color
      const samplePoints = [
        { x: 5, y: 5 },
        { x: w - 6, y: 5 },
        { x: 5, y: h - 6 },
        { x: w - 6, y: h - 6 },
        { x: Math.round(w / 2), y: 5 },
        { x: 5, y: Math.round(h / 3) },
        { x: w - 6, y: Math.round(h / 3) }
      ];

      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      samplePoints.forEach((p) => {
        const idx = (p.y * w + p.x) * 4;
        totalR += data[idx];
        totalG += data[idx + 1];
        totalB += data[idx + 2];
      });
      const bgR = totalR / samplePoints.length;
      const bgG = totalG / samplePoints.length;
      const bgB = totalB / samplePoints.length;

      // Color distance threshold
      const threshold = 38;
      const softFeather = 25;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color distance in RGB
        const dist = Math.sqrt(
          Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
        );

        if (dist < threshold) {
          data[i + 3] = 0; // Transparent
        } else if (dist < threshold + softFeather) {
          const alphaFactor = (dist - threshold) / softFeather;
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image for client segmentation'));
    img.src = imageSrc;
  });
}

/**
 * Extracts the portrait subject with transparent background using AI Neural Network,
 * with graceful fallback to client-side chromatic segmentation.
 */
export async function extractSubjectCutout(
  imageSrc: string,
  onProgress?: (status: string, percent?: number) => void
): Promise<string> {
  // Check cache first
  if (cutoutCache.has(imageSrc)) {
    return cutoutCache.get(imageSrc)!;
  }

  onProgress?.('Initializing AI Portrait Isolator...', 15);

  try {
    const config: Config = {
      model: 'isnet_fp16',
      progress: (key: string, current: number, total: number) => {
        if (total > 0) {
          const pct = Math.round((current / total) * 100);
          onProgress?.(`Processing portrait AI (${key}): ${pct}%`, pct);
        }
      }
    };

    onProgress?.('Extracting subject from background with AI...', 40);
    const blob = await removeBackground(imageSrc, config);
    const transparentDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    cutoutCache.set(imageSrc, transparentDataUrl);
    onProgress?.('Cutout complete!', 100);
    return transparentDataUrl;
  } catch (err) {
    console.warn('AI neural background removal failed or timed out, using fast client segmentation fallback:', err);
    onProgress?.('Using high-speed smart edge segmentation...', 70);
    try {
      const fallbackUrl = await fastClientSideSegment(imageSrc);
      cutoutCache.set(imageSrc, fallbackUrl);
      onProgress?.('Cutout complete (Smart Edge Mode)!', 100);
      return fallbackUrl;
    } catch (fallbackErr) {
      console.error('All background removal methods failed:', fallbackErr);
      throw fallbackErr;
    }
  }
}
