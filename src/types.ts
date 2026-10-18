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
  characterSizeMm: number; // 14 to 32 (default 18)
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
  if (sizeMm <= 24) return 7; // 24mm (fits 6 blank squares)
  if (sizeMm <= 28) return 6; // 28mm (fits 5 blank squares)
  return 5; // 32mm (fits 4 blank squares)
};
