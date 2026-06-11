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
          DEFAULT: "#e8f7fd",
          card: "rgba(255,255,255,0.68)",
          elevated: "rgba(255,255,255,0.82)",
        },
        "b": {
          DEFAULT: "rgba(50,103,138,0.14)",
          hover: "rgba(50,103,138,0.24)",
          accent: "rgba(35,136,201,0.28)",
        },
        content: {
          DEFAULT: "#172033",
          secondary: "#4e6374",
          tertiary: "#7891a5",
        },
        accent: {
          DEFAULT: "#2388c9",
          light: "#59b7e8",
          dark: "#145d8c",
          violet: "#7bbfe7",
        },
        success: {
          DEFAULT: "#138c64",
          light: "#58c69b",
        },
        danger: "#dc3b3b",
        warning: "#d9911e",
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
          "0%, 100%": { boxShadow: "0 14px 36px rgba(35,136,201,0.16)" },
          "50%": { boxShadow: "0 18px 52px rgba(35,136,201,0.25)" },
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
