import { BackgroundConfig } from './utils/backgroundEngine';

export interface PhotoSizePreset {
  id: 'passport' | 'passport_us' | 'stamp' | 'postcard';
  name: string;
  category: string;
  widthMm: number;
  heightMm: number;
  aspectRatio: number; // width / height
  description: string;
  commonUse: string;
}

export interface ImageAdjustments {
  brightness: number; // 0.5 to 1.5, default 1
  contrast: number; // 0.5 to 1.5, default 1
  rotate: number; // degrees: 0, 90, 180, 270 or fine-tuned
  zoom: number; // 1 to 3
  cropX: number; // normalized center offset or pan
  cropY: number;
  mirror: boolean;
}

export interface SheetPhotoItem {
  id: string;
  name: string;
  originalSrc: string;
  croppedCanvas: HTMLCanvasElement;
  croppedDataUrl: string;
  quantity: number; // Number of copies of this photo on the sheet (even number >= 2)
  backgroundConfig: BackgroundConfig;
  subjectCutoutUrl: string | null;
  presetId: PhotoSizePreset['id'];
  adjustments?: ImageAdjustments;
}

export interface SheetConfig {
  selectedPresetId: PhotoSizePreset['id'];
  quantity: number; // Even number between 2 and 50
  gapMm: number; // Gap between photos for cutting (e.g., 3-8mm)
  marginMm: number; // Outer sheet margin (e.g., 8-15mm)
  showCutLines: boolean; // Dotted/dashed lines in the gaps for cutting
  showCornerMarks: boolean; // Corner tick crop marks
  showPhotoBorder: boolean; // Subtle 0.5pt border around each photo for cutting guidance
  addNameDate: boolean; // Optional official stamp text below photo (e.g. date of photo)
  customText?: string;
}

export interface PhotoCellPosition {
  sheetIndex: number;
  photoIndex: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  photoItemId?: string; // ID of the SheetPhotoItem placed in this cell
}

export interface SheetLayoutResult {
  preset: PhotoSizePreset;
  quantity: number;
  columns: number;
  rows: number;
  photosPerSheet: number;
  totalSheets: number;
  sheetWidthMm: number;
  sheetHeightMm: number;
  gapMm: number;
  marginX: number;
  marginY: number;
  cells: PhotoCellPosition[][]; // array of sheets, each has array of photo cells
}
