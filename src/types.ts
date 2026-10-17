export type StrokeStyle = 'heiti' | 'kaiti';

export interface StrokeData {
  strokes: string[];
  medians: number[][][];
  radStrokes?: number[];
}

export interface CharacterItem {
  id: string;
  char: string;
  pinyin: string;
  strokeCount: number;
  strokeData?: StrokeData | null;
  loading?: boolean;
}

export interface WorksheetSettings {
  title: string;
  characterSizeMm: number; // 12 to 24 (default 17)
  strokeStyle: StrokeStyle; // 'heiti' (sans-serif) or 'kaiti' (brush)
  faintTrace: boolean;
  strokeOrderBreakdown: boolean;
  pinyin: boolean;
  tianzigeGridlines: boolean;
  headerStudentName: boolean;
  headerDate: boolean;
}

export const getRowsPerPage = (sizeMm: number = 18): number => {
  if (sizeMm <= 14) return 12;
  if (sizeMm <= 16) return 11;
  if (sizeMm <= 18) return 10;
  if (sizeMm <= 20) return 9;
  if (sizeMm <= 22) return 8;
  return 7; // 24mm (Jumbo)
};
