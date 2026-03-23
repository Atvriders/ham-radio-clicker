// ============================================================
// Ham Radio Clicker — Formatting Utilities
// ============================================================

/**
 * Format a large number with K / M / B / T suffixes.
 * Numbers below 1000 are shown with up to 1 decimal place.
 */
export function formatNumber(n: number): string {
  if (n < 0) return '-' + formatNumber(-n);

  if (n < 1_000) {
    return n % 1 === 0 ? n.toString() : n.toFixed(1);
  }

  const suffixes: [number, string][] = [
    [1e12, 'T'],
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'K'],
  ];

  for (const [threshold, suffix] of suffixes) {
    if (n >= threshold) {
      const value = n / threshold;
      // Show 1 decimal if < 10, otherwise whole number
      return (value < 10 ? value.toFixed(1) : Math.floor(value).toString()) + suffix;
    }
  }

  return Math.floor(n).toString();
}

/**
 * Format an SWR value as "X.X:1".
 */
export function formatSWR(swr: number): string {
  return swr.toFixed(1) + ':1';
}

/**
 * Format elapsed seconds as HH:MM:SS.
 */
export function formatTime(totalSeconds: number): string {
  const seconds = Math.floor(totalSeconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const pad = (v: number) => v.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
