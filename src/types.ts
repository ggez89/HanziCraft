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
