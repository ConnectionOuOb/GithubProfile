import type { ProfileData, YearlyActivity } from "../types.js";
import { compact, escapeXml } from "./format.js";
import { iconSvg } from "./icons.js";
import { cardHeight, theme as t } from "./theme.js";

interface RenderOptions {
  showReviews?: boolean;
  avatarDataUri?: string;
}

function streakValue(data: ProfileData, key: string): number {
  if (key === "total") return data.streak.totalContributions;
  if (key === "current") return data.streak.currentStreak.length;
  return data.streak.longestStreak.length;
}

function defs(): string {
  return `
    <defs>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${t.goldLight}"/>
        <stop offset="45%" stop-color="${t.gold}"/>
        <stop offset="100%" stop-color="${t.goldDark}"/>
      </linearGradient>
    </defs>
  `;
}

function goldRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r = 12,
  fill: string = t.panel,
): string {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="url(#gold)" stroke-width="1.5"/>
    <rect x="${x + 1.5}" y="${y + 1.5}" width="${w - 3}" height="${h - 3}" rx="${r - 1}" fill="none" stroke="${t.goldLight}" stroke-width="0.5" opacity="0.25"/>
  `;
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
  const py = t.cellPad;
  const valueY = y + h - py;

  return `
    ${goldRect(x, y, w, h)}
    <g transform="translate(${x + py}, ${y + py})">
      ${iconSvg(icon, 0, 0, 18, color)}
      <text x="28" y="15" fill="${t.label}" font-family="${t.font}" font-size="14" font-weight="600">${label}</text>
    </g>
    <text x="${cx}" y="${valueY}" text-anchor="middle" fill="${t.text}" font-family="${t.mono}" font-size="28" font-weight="700">${value}</text>
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
  const py = t.cellPad;
  const fill = accent ? "rgba(188,140,255,0.08)" : t.panel;
  const labelY = y + py + 18;
  const valueY = y + h - py - 4;

  return `
    ${goldRect(x, y, w, h, 12, fill)}
    <text x="${cx}" y="${labelY}" text-anchor="middle" fill="${t.label}" font-family="${t.font}" font-size="13" font-weight="600">${label}</text>
    <text x="${cx}" y="${valueY}" text-anchor="middle" fill="${accent ? t.purple : t.text}" font-family="${t.mono}" font-size="${accent ? "38" : "32"}" font-weight="700">${value}</text>
  `;
}

function yearlyTable(data: ProfileData, startY: number, showReviews: boolean): string {
  const years = [...data.yearly].sort((a, b) => b.year - a.year);
  if (years.length === 0) return "";

  const x = t.pad;
  const w = t.width - t.pad * 2;
  const rowH = t.tableRowH;
  const headerH = t.tableHeaderH;

  const cols = showReviews
    ? [
        { key: "year", label: "Year", w: 0.12 },
        { key: "commits", label: "Commits", w: 0.16 },
        { key: "pullRequests", label: "PRs", w: 0.14 },
        { key: "issues", label: "Issues", w: 0.14 },
        { key: "reviews", label: "Reviews", w: 0.16 },
        { key: "contributions", label: "Activity", w: 0.28 },
      ]
    : [
        { key: "year", label: "Year", w: 0.14 },
        { key: "commits", label: "Commits", w: 0.18 },
        { key: "pullRequests", label: "PRs", w: 0.16 },
        { key: "issues", label: "Issues", w: 0.16 },
        { key: "contributions", label: "Activity", w: 0.36 },
      ];

  const colWidths = cols.map((c) => Math.floor(w * c.w));
  colWidths[colWidths.length - 1] = w - colWidths.slice(0, -1).reduce((a, b) => a + b, 0);

  const tableH = headerH + years.length * rowH;

  let colX = x;
  const headerCells = cols
    .map((col, i) => {
      const cw = colWidths[i];
      const cx = colX + cw / 2;
      const cell = `
        <rect x="${colX}" y="${startY}" width="${cw}" height="${headerH}" fill="rgba(212,175,55,0.08)" stroke="url(#gold)" stroke-width="1"/>
        <text x="${cx}" y="${startY + 30}" text-anchor="middle" fill="${t.goldLight}" font-family="${t.font}" font-size="13" font-weight="700">${col.label}</text>
      `;
      colX += cw;
      return cell;
    })
    .join("");

  const rows = years
    .map((row, rowIndex) => {
      const y = startY + headerH + rowIndex * rowH;
      const bg = rowIndex % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent";
      colX = x;

      const cells = cols
        .map((col, i) => {
          const cw = colWidths[i];
          const cx = colX + cw / 2;
          const raw = row[col.key as keyof YearlyActivity];
          const text = col.key === "year" ? String(raw) : compact(Number(raw));
          const color = col.key === "year" ? t.gold : t.text;
          const weight = col.key === "year" ? "700" : "600";
          const cell = `
            <rect x="${colX}" y="${y}" width="${cw}" height="${rowH}" fill="${bg}" stroke="url(#gold)" stroke-width="0.75" opacity="0.95"/>
            <text x="${cx}" y="${y + 27}" text-anchor="middle" fill="${color}" font-family="${col.key === "year" ? t.font : t.mono}" font-size="14" font-weight="${weight}">${text}</text>
          `;
          colX += cw;
          return cell;
        })
        .join("");

      return cells;
    })
    .join("");

  return `
    ${goldRect(x, startY, w, tableH + 12, 14, "rgba(13,17,23,0.6)")}
    <text x="${x + 16}" y="${startY - 12}" fill="${t.goldLight}" font-family="${t.font}" font-size="15" font-weight="700">Yearly Activity</text>
    ${headerCells}
    ${rows}
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
  const H = cardHeight(data.yearly.length);
  const ax = t.pad + 44;
  const ay = 68;

  const statCount = showReviews ? 5 : 4;
  const statsW = W - t.pad * 2;
  const cellW = (statsW - t.gap * (statCount - 1)) / statCount;
  const statsY = 232;
  const statsH = 96;

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

  const streakX = 204;
  const streakY = 124;
  const streakH = 96;
  const streakW = W - streakX - t.pad;
  const streakCellW = (streakW - t.gap * 2) / 3;
  const streak = data.streak.currentStreak.length;
  const tableY = t.summaryHeight + t.tableGap + t.tableTitleH;

  const avatar = (dataUri?: string) =>
    dataUri
      ? `<image href="${dataUri}" x="${ax - 44}" y="${ay - 44}" width="88" height="88" clip-path="url(#av)" preserveAspectRatio="xMidYMid slice"/>`
      : `<circle cx="${ax}" cy="${ay}" r="42" fill="${t.panel}"/>
         <text x="${ax}" y="${ay + 13}" text-anchor="middle" fill="${t.text}" font-family="${t.font}" font-size="36" font-weight="700">${escapeXml(name.charAt(0).toUpperCase())}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="GitHub profile for ${login}">
  <title>${name} (@${login})</title>
  ${defs()}
  <defs><clipPath id="av"><circle cx="${ax}" cy="${ay}" r="42"/></clipPath></defs>
  <rect width="${W}" height="${H}" rx="${t.radius}" fill="${t.bg}"/>
  ${goldRect(0.5, 0.5, W - 1, H - 1, t.radius, "none")}

  <circle cx="${ax}" cy="${ay}" r="46" fill="${t.purple}" opacity="0.2"/>
  ${avatar(avatarDataUri)}

  <text x="204" y="56" fill="${t.text}" font-family="${t.font}" font-size="28" font-weight="700">${name}</text>
  <text x="204" y="86" fill="${t.sub}" font-family="${t.font}" font-size="16">@${login}</text>
  ${
    streak > 0
      ? `<g transform="translate(${W - t.pad - 156}, 48)">
    ${iconSvg("fire", 0, 0, 18, t.purple)}
    <text x="28" y="15" fill="${t.purple}" font-family="${t.font}" font-size="15" font-weight="600">${streak} day streak</text>
  </g>`
      : ""
  }

  <line x1="${t.pad}" y1="112" x2="${W - t.pad}" y2="112" stroke="url(#gold)" stroke-width="1" opacity="0.5"/>

  ${streakCell(streakX, streakY, streakCellW, streakH, "Total Contributions", compact(streakValue(data, "total")))}
  ${streakCell(streakX + streakCellW + t.gap, streakY, streakCellW, streakH, "Current Streak", compact(streakValue(data, "current")), true)}
  ${streakCell(streakX + (streakCellW + t.gap) * 2, streakY, streakCellW, streakH, "Longest Streak", compact(streakValue(data, "longest")))}

  ${statRow
    .map((s, i) =>
      statCell(
        t.pad + i * (cellW + t.gap),
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

  <line x1="${t.pad}" y1="${t.summaryHeight - 8}" x2="${W - t.pad}" y2="${t.summaryHeight - 8}" stroke="url(#gold)" stroke-width="1" opacity="0.35"/>
  ${yearlyTable(data, tableY, showReviews)}
</svg>`;
}
