import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#00BAF2", hover: "#33C8F5", dim: "rgba(0,186,242,0.14)" },
        navy: { DEFAULT: "#002970", mid: "#003D8C", deep: "#001233" },
        surface: { DEFAULT: "#F4F7FB", card: "#FFFFFF" },
        ink: { DEFAULT: "#0A0F1A", secondary: "#3D4F66", muted: "#64748B" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 41, 112, 0.06), 0 1px 2px rgba(0, 41, 112, 0.04)",
        lift: "0 8px 24px rgba(0, 41, 112, 0.08), 0 2px 8px rgba(0, 41, 112, 0.04)",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
