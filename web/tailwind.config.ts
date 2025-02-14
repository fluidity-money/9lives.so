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
        arial: ["var(--font-arial)"],
      },
      backgroundImage: {
        closeIdle: "url('/icons/close.svg')",
        closePressed: "url('/icons/close-pressed.svg')",
        watchlistAdd: "url('/icons/plus.svg')",
        watchlistAddEye: "url('/icons/not-watching.svg')",
        watchlistIn: "url('/icons/watching.svg')",
        watchlistRemove: "url('/icons/x.svg')",
      },
      colors: {
        "9green": "#B8F2AA",
        "9red": "#FFB3B3",
        "9blueLight": "#DDEAEF",
        "9blueDark": "#52AACC",
        "9yellow": "#FFD699",
        "9purple": "#D0ABFF",
        "9black": "#0C0C0C",
        "9gray": "#EEEEEE",
        "9layer": "#F5F5F5",
      },
      boxShadow: {
        "9btnPrimaryIdle":
          "-2px -2px 0 rgba(0,0,0,0.20) inset, 2px 2px 0 rgba(0, 0, 0, 0.25)",
        "9btnPrimaryFocus":
          "-3px -3px 0 rgba(0,0,0,0.20) inset, 2px 2px 0 rgba(0, 0, 0, 0.25)",
        "9btnPrimaryHover":
          "4px 4px 0px rgba(232.38, 232.38, 232.38, 0.60) inset, 1px 1px 0 rgba(0, 0, 0, 0.25)",
        "9btnPrimaryActive":
          "3px 3px 0px rgba(0, 0, 0, 0.30) inset, 1px 1px 0 rgba(0, 0, 0, 0.25)",
        "9btnPrimaryDisabled":
          "-2px -2px 0 rgba(0,0,0,0.20) inset, 2px 2px 0 rgba(0, 0, 0, 0.25)",
        "9btnSecondaryIdle": "-2px -2px 0 rgba(68, 68, 68, 0.20) inset",
        "9btnSecondaryFocus": "-3px -3px 0 rgba(68, 68, 68, 0.20) inset",
        "9btnSecondaryHover":
          "-4px -4px 0 rgba(235, 235, 235, 0.20) inset,  1px 1px 0 rgba(0, 0, 0, 0.25)",
        "9btnSecondaryActive":
          "-3px -3px 0 rgba(0, 0, 0, 0.25) inset, -2px -2px 0 rgba(0, 0, 0, 0.30) inset, 1px 1px 0 rgba(0, 0, 0, 0.25)",
        "9btnSecondaryDisabled":
          "-2px -2px 0 rgba(0,0,0,0.20) inset, 2px 2px 0 rgba(0, 0, 0, 0.25)",
        "9card": "5px 5px 0 rgba(12, 12, 12, 0.20)",
        "9cookieCard": "4px 4px 0 rgba(56, 105, 123, 0.20)",
        "9input": "3px 3px 0 rgba(0, 0, 0, 0.25) inset",
        "9selectedOutcome": "2px 2px 0 rgba(0, 0, 0, 0.25)",
        "9orderSummary": "2px 2px 0px 0px rgba(0, 0, 0, 0.25) inset;",
        "9tableHeader":
          "-2px -2px 0px 0px rgba(102, 102, 102, 0.50) inset, 2px 2px 0px 0px rgba(255, 255, 255, 0.40) inset;",
        "9degen":
          "1px 1px 0px 0px rgba(255, 255, 255, 0.25) inset, -1px -1px 0px 0px rgba(0, 0, 0, 0.25) inset;",
        "9aiButtonEnabled":
          "1px 1px 0px 0px rgba(0, 0, 0, 0.25), -2px -2px 0px 0px rgba(68, 68, 68, 0.20) inset;",
        "9aiButtonDisabled": "2px 2px 0px 0px rgba(68, 68, 68, 0.20) inset;",
      },
      animation: {
        fade: "fade linear 2s;",
      },
      keyframes: {
        fade: {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@headlessui/tailwindcss")],
};
export default config;
