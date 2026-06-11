import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0a0a0f",
          card: "#13131a",
          elevated: "#1a1a25",
        },
        "b": {
          DEFAULT: "rgba(255,255,255,0.08)",
          hover: "rgba(255,255,255,0.15)",
          accent: "rgba(99,102,241,0.3)",
        },
        content: {
          DEFAULT: "#f0f0f5",
          secondary: "#8a8a9a",
          tertiary: "#5a5a6a",
        },
        accent: {
          DEFAULT: "#6366f1",
          light: "#818cf8",
          dark: "#4f46e5",
          violet: "#8b5cf6",
        },
        success: {
          DEFAULT: "#10b981",
          light: "#34d399",
        },
        danger: "#ef4444",
        warning: "#f59e0b",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        page: "1320px",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(99,102,241,0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(99,102,241,0.4)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        shimmer: "shimmer 2s infinite linear",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
