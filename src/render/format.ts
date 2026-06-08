export function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${Math.round(n / 1_000)}k`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

/** GitHub reports bytes; ~30 bytes/line is a common LOC estimate for display. */
export function formatLines(bytes: number): string {
  const lines = Math.max(1, Math.round(bytes / 30));
  return `${compact(lines)} lines`;
}

/** SVG text y for visual vertical center (avoids dominant-baseline; better on GitHub). */
export function textMiddleY(cy: number, fontSize: number): number {
  return cy + fontSize * 0.35;
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
