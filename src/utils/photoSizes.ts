import { PhotoSizePreset } from '../types';

export const PHOTO_SIZE_PRESETS: PhotoSizePreset[] = [
  {
    id: 'passport',
    name: 'Passport Size',
    category: 'Official & Visa',
    widthMm: 35,
    heightMm: 45,
    aspectRatio: 35 / 45, // ~0.7778
    description: 'Standard 35 × 45 mm (3.5 × 4.5 cm)',
    commonUse: 'Passport, Visa, Driving License, Govt ID & Civil Exam applications'
  },
  {
    id: 'stamp',
    name: 'Stamp Size',
    category: 'Official Stamp',
    widthMm: 20,
    heightMm: 25,
    aspectRatio: 20 / 25, // 0.8
    description: 'Standard 20 × 25 mm (2.0 × 2.5 cm)',
    commonUse: 'Admit cards, College registers, Service books, Official seals'
  },
  {
    id: 'postcard',
    name: 'Postcard Size',
    category: 'Standard Print',
    widthMm: 100,
    heightMm: 150,
    aspectRatio: 100 / 150, // ~0.6667 (4x6 inch)
    description: 'Standard 100 × 150 mm (10 × 15 cm / 4" × 6")',
    commonUse: 'NEET / Medical exam postcard, formal portfolio, official record print'
  },
  {
    id: 'passport_us',
    name: 'US Passport (2×2")',
    category: 'International Visa',
    widthMm: 50.8,
    heightMm: 50.8,
    aspectRatio: 1, // 1:1
    description: 'Square 51 × 51 mm (2 × 2 inches)',
    commonUse: 'US Visa, Green Card, Canadian & Japanese specific documents'
  }
];

export const DEFAULT_PRESET = PHOTO_SIZE_PRESETS[0];

// Standard A4 paper dimensions in millimeters
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
// High-resolution print standard: 300 Dots Per Inch
export const DPI_300 = 300;
// 1 inch = 25.4 mm => pixels per mm at 300 DPI:
export const PX_PER_MM_300 = DPI_300 / 25.4; // ~11.811 pixels per mm
export const A4_WIDTH_PX_300 = Math.round(A4_WIDTH_MM * PX_PER_MM_300); // 2480 px
export const A4_HEIGHT_PX_300 = Math.round(A4_HEIGHT_MM * PX_PER_MM_300); // 3508 px
