/** Shields-style SI metric formatting (ported from shields/services/text-formatters.js). */
const metricPrefix = ["k", "M", "G", "T", "P", "E", "Z", "Y"] as const;
const metricPower = metricPrefix.map((_, i) => Math.pow(1000, i + 1));

export function metric(n: number): string {
  for (let i = metricPrefix.length - 1; i >= 0; i--) {
    const limit = metricPower[i];
    const absN = Math.abs(n);
    if (absN >= limit) {
      const scaledN = absN / limit;
      if (scaledN < 10) {
        const oneDecimalN = scaledN.toFixed(1);
        if (oneDecimalN.charAt(oneDecimalN.length - 1) !== "0") {
          const res = `${oneDecimalN}${metricPrefix[i]}`;
          return n > 0 ? res : `-${res}`;
        }
      }
      const roundedN = Math.round(scaledN);
      if (roundedN < 1000) {
        const res = `${roundedN}${metricPrefix[i]}`;
        return n > 0 ? res : `-${res}`;
      }
      const res = `1${metricPrefix[i + 1]}`;
      return n > 0 ? res : `-${res}`;
    }
  }
  return `${n}`;
}

/** @deprecated Use metric() — kept as alias for call sites. */
export const compact = metric;

/** GitHub reports bytes; ~30 bytes/line is a common LOC estimate for display. */
export function formatLines(bytes: number): string {
  const lines = Math.max(1, Math.round(bytes / 30));
  return `${metric(lines)} lines`;
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

/** Shields-style XML escaping (badge-maker/lib/xml.js). */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Shields-style SVG whitespace compaction (badge-maker/lib/xml.js). */
export function stripXmlWhitespace(xml: string): string {
  return xml.replace(/>\s+/g, ">").replace(/<\s+/g, "<").trim();
}
