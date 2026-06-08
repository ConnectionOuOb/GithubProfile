import type { ProfileData } from "../types.js";
import { compact, escapeXml } from "./format.js";
import { iconSvg } from "./icons.js";
import { theme as t } from "./theme.js";

interface RenderOptions {
  showReviews?: boolean;
  avatarDataUri?: string;
}

function streakValue(data: ProfileData, key: string): number {
  if (key === "total") return data.streak.totalContributions;
  if (key === "current") return data.streak.currentStreak.length;
  return data.streak.longestStreak.length;
}

function statCell(
  x: number,
  y: number,
  w: number,
  h: number,
  icon: "star" | "commit" | "pr" | "issue" | "review",
  label: string,
  value: string,
  color: string,
): string {
  const cx = x + w / 2;
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${t.panel}" stroke="${t.panelBorder}"/>
    <g transform="translate(${x + 14}, ${y + 14})">
      ${iconSvg(icon, 0, 0, 18, color)}
      <text x="26" y="14" fill="${t.label}" font-family="${t.font}" font-size="14" font-weight="600">${label}</text>
    </g>
    <text x="${cx}" y="${y + h - 18}" text-anchor="middle" fill="${t.text}" font-family="${t.mono}" font-size="28" font-weight="700">${value}</text>
  `;
}

function streakCell(
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  accent = false,
): string {
  const cx = x + w / 2;
  const inner = accent
    ? `<rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="10" fill="rgba(188,140,255,0.1)" stroke="rgba(188,140,255,0.25)" stroke-width="1"/>`
    : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${t.panel}" stroke="${t.panelBorder}"/>`;

  return `
    ${inner}
    <text x="${cx}" y="${y + 30}" text-anchor="middle" fill="${t.label}" font-family="${t.font}" font-size="13" font-weight="600">${label}</text>
    <text x="${cx}" y="${y + h - 16}" text-anchor="middle" fill="${accent ? t.purple : t.text}" font-family="${t.mono}" font-size="${accent ? "40" : "34"}" font-weight="700">${value}</text>
  `;
}

export function renderProfileCard(
  data: ProfileData,
  options: RenderOptions = {},
): string {
  const { showReviews = false, avatarDataUri } = options;
  const name = escapeXml(data.stats.name);
  const login = escapeXml(data.stats.login);
  const W = t.width;
  const H = t.height;
  const ax = t.pad + 44;
  const ay = 62;

  const statCount = showReviews ? 5 : 4;
  const gap = 12;
  const statsW = W - t.pad * 2;
  const cellW = (statsW - gap * (statCount - 1)) / statCount;
  const statsY = 210;
  const statsH = 62;

  const statRow: {
    icon: "star" | "commit" | "pr" | "issue" | "review";
    label: string;
    value: string;
    color: string;
  }[] = [
    { icon: "star", label: "Stars", value: compact(data.stats.totalStars), color: t.amber },
    { icon: "commit", label: "Commits", value: compact(data.stats.totalCommits), color: t.green },
    { icon: "pr", label: "Pull Requests", value: compact(data.stats.totalPRs), color: t.blue },
    { icon: "issue", label: "Issues", value: compact(data.stats.totalIssues), color: t.orange },
  ];
  if (showReviews) {
    statRow.push({
      icon: "review",
      label: "Reviews",
      value: compact(data.stats.totalReviews),
      color: t.purple,
    });
  }

  const streakX = 196;
  const streakY = 118;
  const streakH = 72;
  const streakW = W - streakX - t.pad;
  const streakGap = 12;
  const streakCellW = (streakW - streakGap * 2) / 3;
  const streak = data.streak.currentStreak.length;

  const avatar = (dataUri?: string) =>
    dataUri
      ? `<image href="${dataUri}" x="${ax - 44}" y="${ay - 44}" width="88" height="88" clip-path="url(#av)" preserveAspectRatio="xMidYMid slice"/>`
      : `<circle cx="${ax}" cy="${ay}" r="42" fill="${t.panel}"/>
         <text x="${ax}" y="${ay + 13}" text-anchor="middle" fill="${t.text}" font-family="${t.font}" font-size="36" font-weight="700">${escapeXml(name.charAt(0).toUpperCase())}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="GitHub profile for ${login}">
  <title>${name} (@${login})</title>
  <defs>
    <clipPath id="av"><circle cx="${ax}" cy="${ay}" r="42"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" rx="${t.radius}" fill="${t.bg}"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="${t.radius}" fill="none" stroke="${t.panelBorder}"/>

  <circle cx="${ax}" cy="${ay}" r="46" fill="${t.purple}" opacity="0.25"/>
  ${avatar(avatarDataUri)}

  <text x="196" y="52" fill="${t.text}" font-family="${t.font}" font-size="28" font-weight="700">${name}</text>
  <text x="196" y="80" fill="${t.sub}" font-family="${t.font}" font-size="16">@${login}</text>
  ${
    streak > 0
      ? `<g transform="translate(${W - t.pad - 148}, 44)">
    ${iconSvg("fire", 0, 0, 18, t.purple)}
    <text x="26" y="14" fill="${t.purple}" font-family="${t.font}" font-size="15" font-weight="600">${streak} day streak</text>
  </g>`
      : ""
  }

  <line x1="${t.pad}" y1="104" x2="${W - t.pad}" y2="104" stroke="${t.panelBorder}"/>

  ${streakCell(streakX, streakY, streakCellW, streakH, "Total Contributions", compact(streakValue(data, "total")))}
  ${streakCell(streakX + streakCellW + streakGap, streakY, streakCellW, streakH, "Current Streak", compact(streakValue(data, "current")), true)}
  ${streakCell(streakX + (streakCellW + streakGap) * 2, streakY, streakCellW, streakH, "Longest Streak", compact(streakValue(data, "longest")))}

  ${statRow
    .map((s, i) =>
      statCell(
        t.pad + i * (cellW + gap),
        statsY,
        cellW,
        statsH,
        s.icon,
        s.label,
        s.value,
        s.color,
      ),
    )
    .join("")}
</svg>`;
}
