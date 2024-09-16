import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        chicago: ["var(--font-chicago)"],
        geneva: ["var(--font-geneva)"],
      },
      colors: {
        primary9: "#B8F2AA",
        secondary9: "#FFB3B3",
        ctaLight9: "#DDEAEF",
        ctaDark9: "#52AACC",
        alert9: "#FFD699",
        black9: "#0C0C0C",
        gray9: "#EEEEEE",
      },
    },
  },
  plugins: [require("@headlessui/tailwindcss")],
};
export default config;
