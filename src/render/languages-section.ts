import type { LanguageStat } from "../types.js";
import { escapeXml } from "./format.js";
import { centeredIconLabel } from "./icons.js";
import { theme as t } from "./theme.js";

function langRow(
  lang: LanguageStat,
  x: number,
  y: number,
  colW: number,
  totalSize: number,
): string {
  const pct = totalSize > 0 ? (lang.size / totalSize) * 100 : 0;
  const pctLabel = `${pct.toFixed(1)}%`;
  const barX = x + 12;
  const barY = y + 18;
  const barW = colW - 24;
  const barH = 6;
  const fillW = Math.max(2, (pct / 100) * barW);

  return `
    <circle cx="${x + 12}" cy="${y + 10}" r="5" fill="${lang.color}"/>
    <text x="${x + 24}" y="${y + 14}" dominant-baseline="central" fill="${t.text}" font-family="${t.font}" font-size="${t.fsLangName}" font-weight="600">${escapeXml(lang.name)}</text>
    <text x="${x + colW - 12}" y="${y + 14}" text-anchor="end" dominant-baseline="central" fill="${t.gold}" font-family="${t.mono}" font-size="${t.fsLangPct}">${pctLabel}</text>
    <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="3" fill="rgba(255,255,255,0.06)"/>
    <rect x="${barX}" y="${barY}" width="${fillW}" height="${barH}" rx="3" fill="${lang.color}" opacity="0.85"/>
  `;
}

export function languagesSectionHeight(langCount: number): number {
  if (langCount <= 0) return 0;
  const rows = Math.ceil(langCount / 2);
  return t.langTitleH + rows * t.langRowH + t.langPadBottom;
}

export function renderLanguagesSection(
  langs: LanguageStat[],
  startY: number,
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

  const leftCol = left
    .map((lang, i) => langRow(lang, x, startY + t.langTitleH + i * t.langRowH, colW, totalSize))
    .join("");

  const rightCol = right
    .map((lang, i) =>
      langRow(lang, x + colW + colGap, startY + t.langTitleH + i * t.langRowH, colW, totalSize),
    )
    .join("");

  return `
    ${centeredIconLabel(cx, startY + t.langTitleH / 2, "code", "Top Languages", t.goldLight, t.iconLangTitle, t.fsLangTitle, t.gold)}
    <rect x="${x}" y="${startY + t.langTitleH - 6}" width="${w}" height="${rows * t.langRowH + t.langPadBottom + 6}" rx="12" fill="${t.panel}" stroke="${t.panelBorder}" stroke-width="1"/>
    ${leftCol}
    ${rightCol}
  `;
}
