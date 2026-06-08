import type { ProfileData, YearlyActivity } from "../types.js";
import { compact, escapeXml } from "./format.js";
import { centeredIconLabel, iconSvg, type IconName } from "./icons.js";
import { cardHeight, theme as t } from "./theme.js";

interface RenderOptions {
  showReviews?: boolean;
  avatarDataUri?: string;
}

interface MetricProps {
  title: string;
  value: string;
  icon: IconName;
  accent: string;
  subtitle?: string;
}

const TABLE_COL_ICONS: Record<string, IconName> = {
  year: "calendar",
  commits: "commit",
  pullRequests: "pr",
  issues: "issue",
  reviews: "review",
  contributions: "activity",
};

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
        <stop offset="50%" stop-color="${t.gold}"/>
        <stop offset="100%" stop-color="${t.goldDark}"/>
      </linearGradient>
      <radialGradient id="ambient-purple" cx="0%" cy="0%" r="75%">
        <stop offset="0%" stop-color="#7c5cbf" stop-opacity="0.22"/>
        <stop offset="55%" stop-color="#4a3d78" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="${t.bgDeep}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="ambient-gold" cx="100%" cy="100%" r="70%">
        <stop offset="0%" stop-color="#c9a227" stop-opacity="0.16"/>
        <stop offset="60%" stop-color="#8b6914" stop-opacity="0.06"/>
        <stop offset="100%" stop-color="${t.bgDeep}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="ambient-blue" cx="80%" cy="15%" r="55%">
        <stop offset="0%" stop-color="#5b8def" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="${t.bgDeep}" stop-opacity="0"/>
      </radialGradient>
    </defs>
  `;
}

function background(W: number, H: number): string {
  return `
    <rect width="${W}" height="${H}" rx="${t.radius}" fill="${t.bg}"/>
    <rect width="${W}" height="${H}" rx="${t.radius}" fill="url(#ambient-purple)"/>
    <rect width="${W}" height="${H}" rx="${t.radius}" fill="url(#ambient-gold)"/>
    <rect width="${W}" height="${H}" rx="${t.radius}" fill="url(#ambient-blue)"/>
    <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="${t.radius}" fill="none" stroke="url(#gold)" stroke-width="1.2" opacity="0.55"/>
  `;
}

/** Elastic UI Metric-style card: title top-left, icon top-right, value bottom-left, accent bar left */
function renderMetric(
  x: number,
  y: number,
  w: number,
  h: number,
  { title, value, icon, accent, subtitle }: MetricProps,
): string {
  const pad = t.metricPad;
  const iconSize = 18;
  const iconCx = x + w - pad - 10;
  const iconCy = y + pad + 12;

  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${t.panel}" stroke="${t.panelBorder}" stroke-width="1"/>
    <rect x="${x + 6}" y="${y + 10}" width="4" height="${h - 20}" rx="2" fill="${accent}" opacity="0.9"/>
    <circle cx="${iconCx}" cy="${iconCy}" r="18" fill="${accent}" opacity="0.12"/>
    ${iconSvg(icon, iconCx - iconSize / 2, iconCy - iconSize / 2, iconSize, accent)}
    <text x="${x + pad + 8}" y="${y + pad + 18}" fill="${t.text}" font-family="${t.font}" font-size="14" font-weight="600">${title}</text>
    ${
      subtitle
        ? `<text x="${x + pad + 8}" y="${y + pad + 36}" fill="${t.sub}" font-family="${t.font}" font-size="11">${subtitle}</text>`
        : ""
    }
    <text x="${x + pad + 8}" y="${y + h - pad}" fill="${t.text}" font-family="${t.mono}" font-size="32" font-weight="700">${value}</text>
  `;
}

function metricRow(
  metrics: MetricProps[],
  y: number,
  x: number,
  totalW: number,
): string {
  const gap = t.gap;
  const w = (totalW - gap * (metrics.length - 1)) / metrics.length;
  return metrics
    .map((m, i) => renderMetric(x + i * (w + gap), y, w, t.metricH, m))
    .join("");
}

function yearlyTable(data: ProfileData, startY: number, showReviews: boolean): string {
  const years = [...data.yearly].sort((a, b) => b.year - a.year);
  if (years.length === 0) return "";

  const x = t.pad;
  const w = t.width - t.pad * 2;
  const cx = t.width / 2;
  const rowH = t.tableRowH;
  const headerH = t.tableHeaderH;
  const titleY = startY - 22;

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
      const cellCx = colX + cw / 2;
      const icon = TABLE_COL_ICONS[col.key];
      const cell = `
        <rect x="${colX}" y="${startY}" width="${cw}" height="${headerH}" fill="rgba(212,175,55,0.06)" stroke="${t.panelBorder}" stroke-width="1"/>
        ${centeredIconLabel(cellCx, startY + headerH / 2 + 2, icon, col.label, t.goldLight, 14, 13)}
      `;
      colX += cw;
      return cell;
    })
    .join("");

  const rows = years
    .map((row, rowIndex) => {
      const y = startY + headerH + rowIndex * rowH;
      const bg = rowIndex % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent";
      colX = x;

      return cols
        .map((col, i) => {
          const cw = colWidths[i];
          const cellCx = colX + cw / 2;
          const raw = row[col.key as keyof YearlyActivity];
          const text = col.key === "year" ? String(raw) : compact(Number(raw));
          const color = col.key === "year" ? t.goldLight : t.text;
          const cell = `
            <rect x="${colX}" y="${y}" width="${cw}" height="${rowH}" fill="${bg}" stroke="${t.panelBorder}" stroke-width="0.75"/>
            <text x="${cellCx}" y="${y + 29}" text-anchor="middle" fill="${color}" font-family="${col.key === "year" ? t.font : t.mono}" font-size="14" font-weight="${col.key === "year" ? "700" : "600"}">${text}</text>
          `;
          colX += cw;
          return cell;
        })
        .join("");
    })
    .join("");

  return `
    ${centeredIconLabel(cx, titleY, "calendar", "Yearly Activity", t.goldLight, 22, 22)}
    <rect x="${x}" y="${startY}" width="${w}" height="${tableH}" rx="12" fill="${t.panel}" stroke="${t.panelBorder}" stroke-width="1"/>
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
  const ay = 58;
  const contentW = W - t.pad * 2;
  const streak = data.streak.currentStreak.length;

  const streakMetrics: MetricProps[] = [
    {
      title: "Total Contributions",
      subtitle: "All-time activity",
      value: compact(streakValue(data, "total")),
      icon: "activity",
      accent: t.amber,
    },
    {
      title: "Current Streak",
      subtitle: streak > 0 ? `${streak} days active` : "No active streak",
      value: compact(streakValue(data, "current")),
      icon: "fire",
      accent: t.purple,
    },
    {
      title: "Longest Streak",
      subtitle: "Personal best",
      value: compact(streakValue(data, "longest")),
      icon: "trophy",
      accent: t.gold,
    },
  ];

  const statMetrics: MetricProps[] = [
    { title: "Stars", value: compact(data.stats.totalStars), icon: "star", accent: t.amber },
    { title: "Commits", value: compact(data.stats.totalCommits), icon: "commit", accent: t.green },
    { title: "Pull Requests", value: compact(data.stats.totalPRs), icon: "pr", accent: t.blue },
    { title: "Issues", value: compact(data.stats.totalIssues), icon: "issue", accent: t.orange },
  ];
  if (showReviews) {
    statMetrics.push({
      title: "Reviews",
      value: compact(data.stats.totalReviews),
      icon: "review",
      accent: t.purple,
    });
  }

  const metricsY1 = 108;
  const metricsY2 = metricsY1 + t.metricH + t.gap;
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
  ${background(W, H)}

  <circle cx="${ax}" cy="${ay}" r="46" fill="${t.purple}" opacity="0.15"/>
  ${avatar(avatarDataUri)}

  <text x="196" y="50" fill="${t.text}" font-family="${t.font}" font-size="26" font-weight="700">${name}</text>
  <text x="196" y="76" fill="${t.sub}" font-family="${t.font}" font-size="15">@${login}</text>
  ${
    streak > 0
      ? `<g transform="translate(${W - t.pad - 148}, 42)">
    ${iconSvg("fire", 0, 0, 16, t.purple)}
    <text x="24" y="13" fill="${t.purple}" font-family="${t.font}" font-size="14" font-weight="600">${streak} day streak</text>
  </g>`
      : ""
  }

  ${metricRow(streakMetrics, metricsY1, t.pad, contentW)}
  ${metricRow(statMetrics, metricsY2, t.pad, contentW)}

  ${yearlyTable(data, tableY, showReviews)}
</svg>`;
}
