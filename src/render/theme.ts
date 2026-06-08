export const theme = {
  width: 760,
  height: 200,
  radius: 16,
  pad: 20,

  bg: "#0a0b10",
  panel: "rgba(255,255,255,0.035)",
  panelBorder: "rgba(255,255,255,0.07)",

  text: "#eef1f6",
  textMuted: "#8b929a",
  textDim: "#565c64",

  accent: "#7c9cff",
  accentGlow: "rgba(124,156,255,0.12)",
  streakHot: "#a78bfa",

  statColors: ["#f0c14a", "#4ade80", "#60a5fa", "#fb923c"] as const,

  font: "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
} as const;
