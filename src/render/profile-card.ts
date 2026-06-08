import type { ProfileData } from "../types.js";
import { compact, escapeXml } from "./format.js";
import { theme as t } from "./theme.js";

interface RenderOptions {
  showReviews?: boolean;
}

function streakValue(data: ProfileData, key: string): number {
  if (key === "total") return data.streak.totalContributions;
  if (key === "current") return data.streak.currentStreak.length;
  return data.streak.longestStreak.length;
}

function statItems(data: ProfileData, showReviews: boolean) {
  const items: { value: number; label: string; color: string }[] = [
    { value: data.stats.totalStars, label: "Stars", color: t.amber },
    { value: data.stats.totalCommits, label: "Commits", color: t.green },
    { value: data.stats.totalPRs, label: "PRs", color: t.blue },
    { value: data.stats.totalIssues, label: "Issues", color: t.orange },
  ];
  if (showReviews) {
    items.push({ value: data.stats.totalReviews, label: "Reviews", color: t.purple });
  }
  return items;
}

export function renderProfileCard(
  data: ProfileData,
  options: RenderOptions = {},
): string {
  const { showReviews = false } = options;
  const name = escapeXml(data.stats.name);
  const login = escapeXml(data.stats.login);
  const avatar = escapeXml(data.stats.avatarUrl);
  const stats = statItems(data, showReviews);
  const currentStreak = data.streak.currentStreak.length;

  const W = t.width;
  const H = t.height;

  const streakItems = [
    { key: "total", label: "Contributions", value: compact(streakValue(data, "total")) },
    { key: "current", label: "Current Streak", value: compact(streakValue(data, "current")) },
    { key: "longest", label: "Longest Streak", value: compact(streakValue(data, "longest")) },
  ];

  // Layout zones
  const leftW = 280;
  const rightX = leftW;
  const rightW = W - leftW;

  // --- DEFS ---
  const defs = `
    <defs>
      <linearGradient id="g-ring" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${t.purple}"/>
        <stop offset="100%" stop-color="${t.pink}"/>
      </linearGradient>
      <linearGradient id="g-bar" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${t.purple}" stop-opacity="0.8"/>
        <stop offset="50%" stop-color="${t.blue}" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="${t.pink}" stop-opacity="0.8"/>
      </linearGradient>
      <radialGradient id="g-glow" cx="25%" cy="30%" r="60%">
        <stop offset="0%" stop-color="${t.purple}" stop-opacity="0.06"/>
        <stop offset="100%" stop-color="${t.bg}" stop-opacity="0"/>
      </radialGradient>
      <clipPath id="clip-av"><circle cx="0" cy="0" r="32"/></clipPath>
    </defs>
  `;

  // --- LEFT SECTION: Avatar + Name + Stats ---
  const avatarY = 56;
  const leftSection = `
    <g transform="translate(32, ${avatarY})">
      <circle cx="0" cy="0" r="35" fill="url(#g-ring)" opacity="0.85"/>
      <circle cx="0" cy="0" r="33" fill="${t.bg}"/>
      <image href="${avatar}" x="-32" y="-32" width="64" height="64" clip-path="url(#clip-av)" preserveAspectRatio="xMidYMid slice"/>
    </g>
    <g transform="translate(80, 42)">
      <text fill="${t.text}" font-family="${t.font}" font-size="18" font-weight="700" letter-spacing="-0.3">${name}</text>
      <text y="22" fill="${t.sub}" font-family="${t.font}" font-size="12" font-weight="400">@${login}</text>
    </g>
    ${currentStreak > 0 ? `
    <g transform="translate(80, 88)">
      <rect width="96" height="24" rx="12" fill="rgba(167,139,250,0.1)" stroke="rgba(167,139,250,0.2)" stroke-width="0.5"/>
      <text x="48" y="16" text-anchor="middle" fill="${t.purple}" font-family="${t.font}" font-size="10" font-weight="600">${currentStreak} day streak</text>
    </g>
    ` : ""}
    <g transform="translate(32, 132)">
      ${stats.map((s, i) => {
        const sx = i * 60;
        return `
          <circle cx="${sx}" cy="0" r="3" fill="${s.color}" opacity="0.85"/>
          <text x="${sx + 10}" y="4" fill="${t.text}" font-family="${t.mono}" font-size="12" font-weight="600">${compact(s.value)}</text>
          <text x="${sx}" y="18" fill="${t.dim}" font-family="${t.font}" font-size="8.5" font-weight="500">${s.label}</text>
        `;
      }).join("")}
    </g>
  `;

  // --- RIGHT SECTION: Streak panels ---
  const panelPad = 24;
  const panelGap = 12;
  const panelCount = streakItems.length;
  const panelInnerW = rightW - panelPad * 2;
  const colW = (panelInnerW - panelGap * (panelCount - 1)) / panelCount;
  const panelY = 30;
  const panelH = H - panelY * 2;

  const rightSection = `
    <g transform="translate(${rightX}, 0)">
      <rect x="0" y="${panelY}" width="${rightW}" height="${panelH}" rx="14" fill="${t.card}" stroke="${t.border}" stroke-width="1"/>
      ${streakItems.map((item, i) => {
        const cx = panelPad + i * (colW + panelGap) + colW / 2;
        const isHot = item.key === "current";
        const valueColor = isHot ? t.purple : t.text;
        const fontSize = isHot ? 36 : 30;
        const hotBg = isHot
          ? `<rect x="${panelPad + i * (colW + panelGap)}" y="${panelY + 12}" width="${colW}" height="${panelH - 24}" rx="10" fill="rgba(167,139,250,0.06)" stroke="rgba(167,139,250,0.12)" stroke-width="0.5"/>`
          : "";
        const divider = i > 0
          ? `<line x1="${panelPad + i * (colW + panelGap) - panelGap / 2}" y1="${panelY + 28}" x2="${panelPad + i * (colW + panelGap) - panelGap / 2}" y2="${panelY + panelH - 28}" stroke="${t.divider}"/>`
          : "";

        return `
          ${divider}
          ${hotBg}
          <text x="${cx}" y="${panelY + 48}" text-anchor="middle" fill="${t.dim}" font-family="${t.font}" font-size="9" font-weight="600" letter-spacing="0.6">${item.label.toUpperCase()}</text>
          <text x="${cx}" y="${panelY + 48 + fontSize + 6}" text-anchor="middle" fill="${valueColor}" font-family="${t.mono}" font-size="${fontSize}" font-weight="700" letter-spacing="-1.5">${item.value}</text>
        `;
      }).join("")}
    </g>
  `;

  // --- COMPOSE ---
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="GitHub profile for ${login}">
  <title>${name} (@${login})</title>
  ${defs}
  <rect width="${W}" height="${H}" rx="${t.radius}" fill="${t.bg}"/>
  <rect width="${W}" height="${H}" rx="${t.radius}" fill="url(#g-glow)"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="${t.radius}" fill="none" stroke="${t.border}"/>
  <rect x="${t.radius}" y="0" width="${W - t.radius * 2}" height="2" rx="1" fill="url(#g-bar)" opacity="0.7"/>
  <line x1="${leftW}" y1="24" x2="${leftW}" y2="${H - 24}" stroke="${t.divider}"/>
  ${leftSection}
  ${rightSection}
</svg>`;
}
