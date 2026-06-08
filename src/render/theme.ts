export const theme = {
  width: 880,
  summaryHeight: 320,
  radius: 16,
  pad: 32,
  gap: 14,
  cellPad: 18,

  bg: "#0d1117",
  panel: "#161b22",
  panelBorder: "rgba(255,255,255,0.08)",

  text: "#f0f6fc",
  sub: "#8b949e",
  label: "#7d8590",

  purple: "#bc8cff",
  blue: "#79c0ff",
  green: "#56d364",
  amber: "#e3b341",
  orange: "#ffa657",
  pink: "#ff7b72",

  goldLight: "#f5e6a3",
  gold: "#d4af37",
  goldDark: "#9a7b2e",

  font: "Segoe UI,system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
  mono: "SFMono-Regular,Consolas,ui-monospace,monospace",

  tableRowH: 36,
  tableHeaderH: 40,
} as const;

export function cardHeight(yearCount: number): number {
  const tableRows = Math.max(yearCount, 1);
  const tableBlock =
    theme.tableHeaderH + tableRows * theme.tableRowH + theme.pad;
  return theme.summaryHeight + tableBlock;
}
