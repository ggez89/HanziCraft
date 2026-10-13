import { pinyin } from 'pinyin-pro';

/**
 * Get pinyin for a single Chinese character with tone marks (e.g. "nǐ")
 */
export function getCharPinyin(char: string): string {
  if (!char) return '';
  // Check if it's a Chinese character
  if (/[\u4e00-\u9fa5]/.test(char)) {
    try {
      const result = pinyin(char, { toneType: 'symbol' });
      return result || '';
    } catch {
      return '';
    }
  }
  return '';
}

/**
 * Split string into individual Chinese characters
 */
export function extractChineseChars(text: string, deduplicate = false): string[] {
  const chars: string[] = [];
  for (const ch of text) {
    if (/[\u4e00-\u9fa5]/.test(ch)) {
      if (!deduplicate || !chars.includes(ch)) {
        chars.push(ch);
      }
    }
  }
  return chars;
}
