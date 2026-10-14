import { StrokeData } from '../types';

const strokeCache = new Map<string, StrokeData | null>();

/**
 * Fetch stroke data for a single character
 */
export async function fetchStrokeData(char: string): Promise<StrokeData | null> {
  if (!char || char.trim() === '') return null;
  if (strokeCache.has(char)) {
    return strokeCache.get(char)!;
  }

  // 1. Try local server API if running in fullstack mode
  try {
    const res = await fetch(`/api/strokes/${encodeURIComponent(char)}`);
    if (res.ok) {
      const data: StrokeData = await res.json();
      strokeCache.set(char, data);
      return data;
    }
  } catch {
    // Continue to external CDN endpoints
  }

  // 2. Dedicated CDN endpoints: ggez89 github.io, ggez89 raw github fallback, and jsdelivr fallback
  const cdnEndpoints = [
    `https://ggez89.github.io/hanzi-writer-data/data/${encodeURIComponent(char)}.json`,
    `https://raw.githubusercontent.com/ggez89/hanzi-writer-data/master/data/${encodeURIComponent(char)}.json`,
    `https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/${encodeURIComponent(char)}.json`,
  ];

  for (const cdnUrl of cdnEndpoints) {
    try {
      const res = await fetch(cdnUrl);
      if (res.ok) {
        const data: StrokeData = await res.json();
        strokeCache.set(char, data);
        return data;
      }
    } catch {
      // Try next endpoint in sequence
    }
  }

  strokeCache.set(char, null);
  return null;
}

/**
 * Convert median coordinate points [[x, y], [x, y], ...] to an SVG smooth path (HeiTi style)
 */
export function medianToSvgPath(points: number[][]): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0][0]} ${points[0][1]} L ${points[0][0]} ${points[0][1]}`;
  }

  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i][0]} ${points[i][1]}`;
  }
  return d;
}
