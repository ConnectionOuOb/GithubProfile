import type { LanguageStat } from "../types.js";
import { escapeXml, formatLines, textMiddleY } from "./format.js";
import { centeredIconLabel } from "./icons.js";
import { languagesSectionHeight } from "./layout.js";
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
  const nameY = y + 12;
  const barX = x + 12;
  const barY = y + 22;
  const barW = colW - 24;
  const barH = 6;
  const fillW = Math.max(2, (pct / 100) * barW);

  return `
    <circle cx="${x + 12}" cy="${nameY}" r="5" fill="${lang.color}"/>
    <text x="${x + 24}" y="${textMiddleY(nameY, t.fsLangName)}" fill="${t.text}" font-family="${t.font}" font-size="${t.fsLangName}" font-weight="600">${escapeXml(lang.name)}</text>
    <text x="${x + colW - 12}" y="${textMiddleY(nameY, t.fsLangPct)}" text-anchor="end" fill="${t.sub}" font-family="${t.mono}" font-size="${t.fsLangPct}">${stats}</text>
    <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="3" fill="rgba(255,255,255,0.06)"/>
    <rect x="${barX}" y="${barY}" width="${fillW}" height="${barH}" rx="3" fill="${lang.color}" opacity="0.85"/>
  `;
}

export { languagesSectionHeight };

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
  const panelY = startY + t.langTitleH - 6;
  const panelH = rows * t.langRowH + t.langPadBottom + 6;

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
    <rect x="${x}" y="${panelY}" width="${w}" height="${panelH}" rx="12" fill="${t.panel}" stroke="${t.panelBorder}" stroke-width="1"/>
    ${leftCol}
    ${rightCol}
  `;
}
