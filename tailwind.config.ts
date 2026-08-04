import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#0B0D10", 2: "#0F1115", 3: "#141820", 4: "#1a2030", 5: "#1f2840" },
        border: { DEFAULT: "#1e2535", 2: "#263147" },
        text: { primary: "#e8ecf4", secondary: "#8fa3c4", muted: "#546380" },
        accent: {
          green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
          blue: "#3b82f6", purple: "#a855f7", cyan: "#06b6d4",
        },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"], mono: ["JetBrains Mono", "monospace"] },
    },
  },
  plugins: [],
};
export default config;
