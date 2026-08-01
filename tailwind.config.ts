import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "teal-deep": "#0B4F4C",
        "teal-bright": "#1E8C86",
        orange: "#F5A623",
        ink: "#141414",
        cream: "#FFF7EA",
        red: "#E2402F",
      },
      fontFamily: {
        anton: ["var(--font-anton)", "sans-serif"],
        work: ["var(--font-work-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
