export const theme = {
  width: 800,
  height: 268,
  radius: 18,

  bg: "#010409",
  surface: "#0d1117",
  surfaceHover: "#161b22",
  border: "rgba(255,255,255,0.09)",
  borderSoft: "rgba(255,255,255,0.05)",

  text: "#f0f6fc",
  textMuted: "#9198a1",
  textDim: "#656d76",

  accent: "#4493f8",
  accent2: "#ab7df8",
  accent3: "#f778ba",
  glow: "rgba(68,147,248,0.15)",

  gradient: ["#4493f8", "#8957e5", "#db61a2"] as const,
  statColors: ["#e3b341", "#3fb950", "#4493f8", "#db6d28"] as const,

  font: "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
  fontMono: "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace",
} as const;
