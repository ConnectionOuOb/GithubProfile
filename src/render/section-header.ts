import { centeredIconLabel, type IconName } from "./icons.js";
import { theme as t } from "./theme.js";

export function sectionContentY(sectionY: number): number {
  return sectionY + t.sectionTitleH + t.sectionTitleGap;
}

export function sectionBlockHeight(contentHeight: number): number {
  return t.sectionTitleH + t.sectionTitleGap + contentHeight;
}

export function renderSectionHeader(
  sectionY: number,
  icon: IconName,
  title: string,
): string {
  const cx = t.width / 2;
  const titleCy = sectionY + t.sectionTitleH / 2;
  const barY = sectionY + t.sectionTitleH - t.sectionBarH;
  const x = t.pad;
  const w = t.width - t.pad * 2;

  return `
    ${centeredIconLabel(cx, titleCy, icon, title, t.goldLight, t.iconSectionTitle, t.fsSectionTitle, t.gold)}
    <rect x="${x}" y="${barY}" width="${w}" height="${t.sectionBarH}" rx="1" fill="url(#gold)" opacity="0.8"/>
  `;
}
