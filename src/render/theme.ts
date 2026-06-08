export const theme = {
  width: 880,
  summaryHeight: 368,
  tableGap: 56,
  tableTitleH: 40,
  radius: 16,
  pad: 32,
  gap: 16,
  metricH: 108,
  metricPad: 18,

  bg: "#181b28",
  bgDeep: "#141624",
  panel: "rgba(255,255,255,0.045)",
  panelBorder: "rgba(212,175,55,0.22)",

  text: "#eef1f8",
  sub: "#9aa3b5",
  label: "#7b849a",

  purple: "#c4a5fd",
  blue: "#8ec5ff",
  green: "#6ee7a0",
  amber: "#f0ca5a",
  orange: "#ffb86b",
  pink: "#ff8a8a",

  goldLight: "#f5e6a3",
  gold: "#d4af37",
  goldDark: "#9a7b2e",

  font: "Segoe UI,system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
  mono: "SFMono-Regular,Consolas,ui-monospace,monospace",

  tableRowH: 44,
  tableHeaderH: 46,
} as const;

export function cardHeight(yearCount: number): number {
  const tableRows = Math.max(yearCount, 1);
  const tableBlock =
    theme.tableTitleH +
    theme.tableHeaderH +
    tableRows * theme.tableRowH +
    theme.pad;
  return theme.summaryHeight + theme.tableGap + tableBlock;
}
