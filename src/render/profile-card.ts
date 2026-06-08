import type { ProfileData } from "../types.js";
import { compact, escapeXml } from "./format.js";
import { theme } from "./theme.js";

interface RenderOptions {
  showReviews?: boolean;
}

const STREAK_METRICS = [
  { key: "totalContributions" as const, label: "Contributions" },
  { key: "currentStreak" as const, label: "Current Streak" },
  { key: "longestStreak" as const, label: "Longest Streak" },
];

function streakValue(
  data: ProfileData,
  key: (typeof STREAK_METRICS)[number]["key"],
): number {
  if (key === "totalContributions") return data.streak.totalContributions;
  return data.streak[key].length;
}

function statItems(data: ProfileData, showReviews: boolean) {
  const items = [
    { value: data.stats.totalStars, label: "Stars" },
    { value: data.stats.totalCommits, label: "Commits" },
    { value: data.stats.totalPRs, label: "PRs" },
    { value: data.stats.totalIssues, label: "Issues" },
  ];

  if (showReviews) {
    items.push({ value: data.stats.totalReviews, label: "Reviews" });
  }

  return items;
}

function defs(width: number): string {
  const stops = theme.gradient
    .map((color, i) => {
      const offset = (i / (theme.gradient.length - 1)) * 100;
      return `<stop offset="${offset}%" stop-color="${color}"/>`;
    })
    .join("");

  return `
    <defs>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        ${stops}
      </linearGradient>
      <linearGradient id="bg-fade" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${theme.bgElevated}" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="${theme.bg}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="3" fill="url(#accent)" rx="1.5"/>
  `;
}

function streakSection(data: ProfileData, width: number): string {
  const pad = 24;
  const colW = (width - pad * 2) / 3;

  return STREAK_METRICS.map((metric, i) => {
    const x = pad + i * colW + colW / 2;
    const value = streakValue(data, metric.key);
    const divider =
      i < STREAK_METRICS.length - 1
        ? `<line x1="${pad + (i + 1) * colW}" y1="0" x2="${pad + (i + 1) * colW}" y2="52" stroke="${theme.border}" stroke-width="1"/>`
        : "";

    return `
      ${divider}
      <text
        x="${x}" y="0"
        text-anchor="middle"
        fill="${theme.text}"
        font-family="${theme.font}"
        font-size="30"
        font-weight="700"
        letter-spacing="-0.5"
      >${compact(value)}</text>
      <text
        x="${x}" y="24"
        text-anchor="middle"
        fill="${theme.textMuted}"
        font-family="${theme.font}"
        font-size="11"
        font-weight="500"
        letter-spacing="0.2"
      >${metric.label}</text>
    `;
  }).join("");
}

function statsRow(data: ProfileData, showReviews: boolean, width: number): string {
  const items = statItems(data, showReviews);
  const pad = 24;
  const gap = 10;
  const available = width - pad * 2 - gap * (items.length - 1);
  const pillW = available / items.length;
  const pillH = 44;

  return items
    .map((item, i) => {
      const x = pad + i * (pillW + gap);

      return `
        <g transform="translate(${x}, 0)">
          <rect
            width="${pillW}" height="${pillH}" rx="10"
            fill="${theme.accentSoft}"
            stroke="${theme.border}"
            stroke-width="1"
          />
          <text
            x="${pillW / 2}" y="20"
            text-anchor="middle"
            fill="${theme.text}"
            font-family="${theme.fontMono}"
            font-size="15"
            font-weight="600"
          >${compact(item.value)}</text>
          <text
            x="${pillW / 2}" y="36"
            text-anchor="middle"
            fill="${theme.textDim}"
            font-family="${theme.font}"
            font-size="10"
            font-weight="500"
          >${item.label}</text>
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
  const { width, height, radius, bg, border, font, text, textMuted } = theme;
  const displayName = escapeXml(data.stats.name);
  const login = escapeXml(data.stats.login);

  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
  role="img"
  aria-label="GitHub profile stats for ${login}"
>
  <title>${displayName} (@${login}) — GitHub Profile</title>
  ${defs(width)}

  <rect
    x="0.5" y="3.5"
    width="${width - 1}" height="${height - 4}"
    rx="${radius}" ry="${radius}"
    fill="${bg}"
    stroke="${border}"
    stroke-width="1"
  />
  <rect
    x="0.5" y="3.5"
    width="${width - 1}" height="80"
    rx="${radius}" ry="${radius}"
    fill="url(#bg-fade)"
  />

  <text
    x="24" y="36"
    fill="${text}"
    font-family="${font}"
    font-size="16"
    font-weight="600"
  >${displayName}</text>
  <text
    x="24" y="56"
    fill="${textMuted}"
    font-family="${font}"
    font-size="12"
  >@${login}</text>

  <g transform="translate(0, 88)">
    ${streakSection(data, width)}
  </g>

  <line
    x1="24" y1="152" x2="${width - 24}" y2="152"
    stroke="${border}" stroke-width="1"
  />

  <g transform="translate(0, 162)">
    ${statsRow(data, showReviews, width)}
  </g>
</svg>`;
}
