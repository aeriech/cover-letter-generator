import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        text: "#0b1020",
        muted: "#5e6882",
        accent: "#6366f1",
        "accent-hover": "#4f51e6",
        panel: "#ffffff",
        "panel-2": "#f4f6fb",
        border: "#e2e8f0",
        "info-bg": "#eef2ff",
        "danger": "#ef4444",
        "danger-bg": "#fef2f2",
      },
      animation: {
        caret: "caret 1s steps(1) infinite",
      },
      keyframes: {
        caret: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
};

export default config;
