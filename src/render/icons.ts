export const icons = {
  star: `<path fill="currentColor" d="M8 .5l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 11.3 4.8 13.5l.8-4.7L2.2 5.5l4.7-.7L8 .5z"/>`,
  commit: `<path fill="currentColor" d="M8 1a3 3 0 100 6 3 3 0 000-6zm0 8.5a5.5 5.5 0 014.7 2.6l-1.4 1.4A3.5 3.5 0 008 12.5a3.5 3.5 0 01-3.3 2l-1.4-1.4A5.5 5.5 0 008 9.5z"/>`,
  pr: `<path fill="currentColor" d="M3 2.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm10 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8 5.5a2 2 0 00-2 2v1H4.5a1 1 0 100 2H6v3.5a2 2 0 104 0V10.5h1.5a1 1 0 100-2H10v-1a2 2 0 00-2-2z"/>`,
  issue: `<path fill="currentColor" d="M8 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zm0 2a1 1 0 100 2 1 1 0 000-2zm1 3H7v5h2V6.5z"/>`,
  review: `<path fill="currentColor" d="M2 2.5A1.5 1.5 0 013.5 1h9A1.5 1.5 0 0114 2.5v8A1.5 1.5 0 0112.5 12H8l-3 2.5V12H3.5A1.5 1.5 0 012 10.5v-8z"/>`,
  fire: `<path fill="currentColor" d="M8 1.5c1.2 2.2 2.5 3.1 2.5 5.5a2.5 2.5 0 01-5 0c0-1.2.5-2.2 1.2-3.4C5.8 4.8 5 6.5 5 8a3 3 0 006 0c0-1-.4-2-1.2-3.2.5 1.5.7 2.2.7 3.2a1.5 1.5 0 01-3 0C7.5 5.8 7.8 4.5 8 1.5z"/>`,
  trophy: `<path fill="currentColor" d="M3 2.5h10v2a3 3 0 01-2.8 3 2.5 2.5 0 01-4.4 0A3 3 0 013 4.5v-2zm2 9.5h6v1.5H5V12zm1.5 1.5h3V15H6.5v-1z"/>`,
  calendar: `<path fill="currentColor" d="M3.5 2A1.5 1.5 0 012 3.5v1h12v-1A1.5 1.5 0 0012.5 2h-1V1h-1v1h-4V1H5.5v1h-1zM2 6v7.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V6H2z"/>`,
  activity: `<path fill="currentColor" d="M1.5 8.5a1 1 0 011-1h2v7h-2a1 1 0 01-1-1v-5zm5 2a1 1 0 011-1h2v5h-2a1 1 0 01-1-1v-3zm5-3a1 1 0 011-1h2v8h-2a1 1 0 01-1-1V7.5z"/>`,
  code: `<path fill="currentColor" d="M5.5 4.5L1 8l4.5 3.5V9l-2-1 2-1V4.5zm5 0V7l2-1-2-1v2.5L15 8l-4.5 3.5V10l2 1-2 1V11.5L15 8l-4.5-3.5z"/>`,
} as const;

export type IconName = keyof typeof icons;

import { estimateTextWidth, textMiddleY } from "./format.js";

export function iconSvg(
  name: IconName,
  x: number,
  y: number,
  size: number,
  color: string,
): string {
  const path = icons[name].replaceAll("currentColor", color);
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 16 16">${path}</svg>`;
}

/** Icon immediately left of label; group centered at cx (GitHub-safe inline layout). */
export function centeredIconLabel(
  cx: number,
  cy: number,
  icon: IconName,
  label: string,
  color: string,
  iconSize = 16,
  fontSize = 13,
  textColor = color,
): string {
  const gap = 6;
  const textW = estimateTextWidth(label, fontSize, true);
  const totalW = iconSize + gap + textW;
  const startX = cx - totalW / 2;
  const iconY = cy - iconSize / 2;
  const textY = textMiddleY(cy, fontSize);

  return `
    ${iconSvg(icon, startX, iconY, iconSize, color)}
    <text x="${startX + iconSize + gap}" y="${textY}" fill="${textColor}" font-family="Segoe UI,system-ui,sans-serif" font-size="${fontSize}" font-weight="700">${label}</text>
  `;
}

export function centeredIconStack(
  cx: number,
  y: number,
  icon: IconName,
  label: string,
  color: string,
  iconSize = 20,
  fontSize = 13,
): string {
  return `
    ${iconSvg(icon, cx - iconSize / 2, y, iconSize, color)}
    <text x="${cx}" y="${y + iconSize + 16}" text-anchor="middle" fill="${color}" font-family="Segoe UI,system-ui,sans-serif" font-size="${fontSize}" font-weight="600">${label}</text>
  `;
}
