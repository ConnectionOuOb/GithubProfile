export const theme = {
  width: 720,
  height: 210,
  radius: 14,

  bg: "#0d1117",
  bgElevated: "#161b22",
  border: "rgba(255,255,255,0.08)",

  text: "#e6edf3",
  textMuted: "#8b949e",
  textDim: "#6e7681",

  accent: "#58a6ff",
  accentSoft: "#388bfd26",
  gradient: ["#58a6ff", "#a371f7", "#f778ba"] as const,

  font: "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
  fontMono: "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace",
} as const;
