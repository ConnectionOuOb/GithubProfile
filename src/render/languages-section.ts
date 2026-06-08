import type { LanguageStat } from "../types.js";
import { escapeXml, formatLines, textMiddleY } from "./format.js";
import { renderLanguageIcon } from "./language-icon.js";
import { languagesPanelHeight } from "./layout.js";
import { theme as t } from "./theme.js";

function langRow(
  lang: LanguageStat,
  x: number,
  y: number,
  colW: number,
  totalSize: number,
): string {
  const pct = totalSize > 0 ? (lang.size / totalSize) * 100 : 0;
  const stats = `${formatLines(lang.size)} · ${pct.toFixed(1)}%`;
  const iconX = x + 12;
  const iconY = y + (t.langRowH - t.langIconSize) / 2;
  const contentX = iconX + t.langIconSize + t.langIconGap;
  const nameY = y + 12;
  const barH = t.langBarH;
  const barY = y + t.langRowH - barH - 2;
  const barW = colW - (contentX - x) - 12;
  const fillW = Math.max(2, (pct / 100) * barW);

  return `
    ${renderLanguageIcon(lang.name, iconX, iconY, t.langIconSize, lang.color)}
    <text x="${contentX}" y="${textMiddleY(nameY, t.fsLangName)}" fill="${t.text}" font-family="${t.font}" font-size="${t.fsLangName}" font-weight="600">${escapeXml(lang.name)}</text>
    <text x="${x + colW - 12}" y="${textMiddleY(nameY, t.fsLangPct)}" text-anchor="end" fill="${t.sub}" font-family="${t.mono}" font-size="${t.fsLangPct}">${stats}</text>
    <rect x="${contentX}" y="${barY}" width="${barW}" height="${barH}" rx="4" fill="rgba(255,255,255,0.06)"/>
    <rect x="${contentX}" y="${barY}" width="${fillW}" height="${barH}" rx="4" fill="${lang.color}" opacity="0.85"/>
  `;
}

export { languagesPanelHeight };

export function renderLanguagesSection(
  langs: LanguageStat[],
  contentY: number,
  excludedNote?: string,
): string {
  if (langs.length === 0) return "";

  const x = t.pad;
  const w = t.width - t.pad * 2;
  const cx = t.width / 2;
  const colGap = t.gap;
  const colW = (w - colGap) / 2;
  const totalSize = langs.reduce((sum, l) => sum + l.size, 0);
  const mid = Math.ceil(langs.length / 2);
  const left = langs.slice(0, mid);
  const right = langs.slice(mid);
  const rows = mid;
  const withNote = Boolean(excludedNote);
  const panelH = rows * t.langRowH + t.langPadBottom;

  const leftCol = left
    .map((lang, i) => langRow(lang, x, contentY + i * t.langRowH, colW, totalSize))
    .join("");

  const rightCol = right
    .map((lang, i) =>
      langRow(lang, x + colW + colGap, contentY + i * t.langRowH, colW, totalSize),
    )
    .join("");

  const noteY = contentY + panelH + t.langNoteGap;
  const note = excludedNote
    ? `<text x="${cx}" y="${textMiddleY(noteY + t.langNoteH / 2, t.fsLangNote)}" text-anchor="middle" fill="${t.sub}" font-family="${t.font}" font-size="${t.fsLangNote}">${escapeXml(excludedNote)}</text>`
    : "";

  return `
    <rect x="${x}" y="${contentY}" width="${w}" height="${panelH}" rx="12" fill="${t.panel}" stroke="${t.panelBorder}" stroke-width="1"/>
    ${leftCol}
    ${rightCol}
    ${note}
  `;
}
