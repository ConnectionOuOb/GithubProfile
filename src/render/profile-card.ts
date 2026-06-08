import type { ProfileData } from "../types.js";
import { compact, escapeXml } from "./format.js";
import { theme } from "./theme.js";

interface RenderOptions {
  showReviews?: boolean;
}

const STREAK = [
  { key: "totalContributions" as const, label: "Contributions", highlight: false },
  { key: "currentStreak" as const, label: "Current Streak", highlight: true },
  { key: "longestStreak" as const, label: "Longest Streak", highlight: false },
];

function streakValue(
  data: ProfileData,
  key: (typeof STREAK)[number]["key"],
): number {
  if (key === "totalContributions") return data.streak.totalContributions;
  return data.streak[key].length;
}

function statItems(data: ProfileData, showReviews: boolean) {
  const items: { value: number; label: string; color: string }[] = [
    { value: data.stats.totalStars, label: "Stars", color: theme.statColors[0] },
    { value: data.stats.totalCommits, label: "Commits", color: theme.statColors[1] },
    { value: data.stats.totalPRs, label: "PRs", color: theme.statColors[2] },
    { value: data.stats.totalIssues, label: "Issues", color: theme.statColors[3] },
  ];

  if (showReviews) {
    items.push({
      value: data.stats.totalReviews,
      label: "Reviews",
      color: theme.accent2,
    });
  }

  return items;
}

function defs(): string {
  const stops = theme.gradient
    .map((color, i) => {
      const offset = (i / (theme.gradient.length - 1)) * 100;
      return `<stop offset="${offset}%" stop-color="${color}"/>`;
    })
    .join("");

  return `
    <defs>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">${stops}</linearGradient>
      <linearGradient id="accent-h" x1="0%" y1="0%" x2="100%" y2="0%">${stops}</linearGradient>
      <radialGradient id="orb-l" cx="0%" cy="0%" r="70%">
        <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="${theme.bg}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="orb-r" cx="100%" cy="100%" r="65%">
        <stop offset="0%" stop-color="${theme.accent3}" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="${theme.bg}" stop-opacity="0"/>
      </radialGradient>
      <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.35"/>
      </filter>
      <clipPath id="avatar-clip"><circle cx="0" cy="0" r="30"/></clipPath>
    </defs>
  `;
}

function header(data: ProfileData): string {
  const { font, text, textMuted, borderSoft } = theme;
  const name = escapeXml(data.stats.name);
  const login = escapeXml(data.stats.login);
  const avatar = escapeXml(data.stats.avatarUrl);
  const ax = 32;
  const ay = 36;

  return `
    <circle cx="${ax}" cy="${ay}" r="34" fill="url(#accent)" opacity="0.85"/>
    <circle cx="${ax}" cy="${ay}" r="31" fill="${theme.surface}"/>
    <g transform="translate(${ax}, ${ay})">
      <image href="${avatar}" x="-30" y="-30" width="60" height="60" clip-path="url(#avatar-clip)" preserveAspectRatio="xMidYMid slice"/>
    </g>
    <text x="84" y="44" fill="${text}" font-family="${font}" font-size="20" font-weight="700" letter-spacing="-0.4">${name}</text>
    <text x="84" y="66" fill="${textMuted}" font-family="${font}" font-size="13">@${login}</text>
    <rect x="84" y="76" width="58" height="20" rx="10" fill="${borderSoft}" stroke="${theme.border}" stroke-width="1"/>
    <text x="113" y="90" text-anchor="middle" fill="${textMuted}" font-family="${font}" font-size="10" font-weight="600" letter-spacing="0.4">GITHUB</text>
  `;
}

function streakPanels(data: ProfileData): string {
  const { width, font, fontMono, text, textMuted, surface, border, borderSoft, glow } = theme;
  const pad = 28;
  const gap = 14;
  const panelW = (width - pad * 2 - gap * 2) / 3;
  const panelH = 88;
  const y = 118;

  return STREAK.map((metric, i) => {
    const x = pad + i * (panelW + gap);
    const value = streakValue(data, metric.key);
    const valueFill = metric.highlight ? "url(#accent-h)" : text;
    const glowRect = metric.highlight
      ? `<rect x="${x}" y="${y}" width="${panelW}" height="${panelH}" rx="14" fill="${glow}"/>`
      : "";

    return `
      ${glowRect}
      <rect x="${x}" y="${y}" width="${panelW}" height="${panelH}" rx="14" fill="${surface}" stroke="${metric.highlight ? theme.accent : border}" stroke-width="1" stroke-opacity="${metric.highlight ? "0.45" : "1"}"/>
      <rect x="${x + 1}" y="${y + 1}" width="${panelW - 2}" height="${panelH - 2}" rx="13" fill="none" stroke="${borderSoft}" stroke-width="1"/>
      <text x="${x + 18}" y="${y + 38}" fill="${valueFill}" font-family="${fontMono}" font-size="${metric.highlight ? 32 : 28}" font-weight="700" letter-spacing="-1">${compact(value)}</text>
      <text x="${x + 18}" y="${y + 62}" fill="${textMuted}" font-family="${font}" font-size="11" font-weight="500">${metric.label}</text>
    `;
  }).join("");
}

function statsRow(data: ProfileData, showReviews: boolean): string {
  const items = statItems(data, showReviews);
  const { width, font, fontMono, text, textDim, surface, border } = theme;
  const pad = 28;
  const gap = 12;
  const rowY = 222;
  const pillH = 36;
  const pillW = (width - pad * 2 - gap * (items.length - 1)) / items.length;

  return items
    .map((item, i) => {
      const x = pad + i * (pillW + gap);

      return `
        <g transform="translate(${x}, ${rowY})">
          <rect width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${surface}" stroke="${border}" stroke-width="1"/>
          <circle cx="16" cy="${pillH / 2}" r="4" fill="${item.color}"/>
          <text x="28" y="23" fill="${text}" font-family="${fontMono}" font-size="13" font-weight="600">${compact(item.value)}</text>
          <text x="${pillW - 14}" y="23" text-anchor="end" fill="${textDim}" font-family="${font}" font-size="10" font-weight="500">${item.label}</text>
        </g>
      `;
    })
    .join("");
}

export function renderProfileCard(
  data: ProfileData,
  options: RenderOptions = {},
): string {
  const { showReviews = false } = options;
  const { width, height, radius, bg, border } = theme;
  const login = escapeXml(data.stats.login);
  const name = escapeXml(data.stats.name);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="GitHub profile for ${login}">
  <title>${name} (@${login})</title>
  ${defs()}
  <rect width="${width}" height="${height}" rx="${radius}" fill="${bg}"/>
  <rect width="${width}" height="${height}" rx="${radius}" fill="url(#orb-l)"/>
  <rect width="${width}" height="${height}" rx="${radius}" fill="url(#orb-r)"/>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${radius}" fill="none" stroke="${border}" stroke-width="1" filter="url(#soft-shadow)"/>
  <rect x="16" y="0" width="${width - 32}" height="2.5" rx="1.25" fill="url(#accent-h)" opacity="0.9"/>
  ${header(data)}
  ${streakPanels(data)}
  ${statsRow(data, showReviews)}
</svg>`;
}
