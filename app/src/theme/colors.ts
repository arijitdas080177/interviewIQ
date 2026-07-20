/**
 * Executive-friendly palette: deep navy as the primary tone, warm neutrals
 * for text/surfaces, and a restrained gold used only for emphasis (progress,
 * active state) — deliberately avoiding bright/playful consumer-app colors.
 * Mirrors the Tailwind config in tailwind.config.js so plain RN styles and
 * NativeWind classes stay visually consistent.
 */
export const colors = {
  light: {
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#0b1220",
    textMuted: "#3d5580",
    border: "#d6dde8",
    primary: "#1f2f4d",
    primaryText: "#ffffff",
    accent: "#a9843a",
    danger: "#b3261e",
    inference: "#6b7280",
  },
  dark: {
    background: "#0b1220",
    surface: "#141f36",
    text: "#eef1f6",
    textMuted: "#8497b6",
    border: "#2c4066",
    primary: "#d6dde8",
    primaryText: "#0b1220",
    accent: "#d9b871",
    danger: "#f2b8b5",
    inference: "#9ca3af",
  },
} as const;

export type ThemeColors = typeof colors.light;
