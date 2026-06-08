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

/** Approximate rendered width for Segoe UI bold labels in SVG. */
export function estimateTextWidth(text: string, fontSize: number, bold = true): number {
  const lower = bold ? 0.62 : 0.58;
  const upper = bold ? 0.78 : 0.72;
  let width = 0;
  for (const ch of text) {
    if (ch === " ") width += fontSize * 0.28;
    else if (ch >= "A" && ch <= "Z") width += fontSize * upper;
    else width += fontSize * lower;
  }
  return width;
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
