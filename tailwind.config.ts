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
        // Old Mutual Corporate Primary Colors (2020 Guidelines)
        "om-heritage-green": "#009677", // Primary brand color
        "om-fresh-green": "#50b848",
        "om-future-green": "#8dc63f",
        // Secondary Colors
        "om-sky": "#00c0e8",
        "om-sun": "#fff200",
        "om-naartjie": "#f37021",
        "om-cerise": "#ed0080",
        // Neutral Colors
        "om-black": "#000000",
        "om-white": "#ffffff",
        "om-grey-80": "#575757", // 80% black
        "om-grey-60": "#878787", // 60% black
        "om-grey-40": "#b2b2b2", // 40% black
        "om-grey-15": "#e3e3e3", // 15% black
        "om-grey-5": "#f6f6f6", // 5% black
        // Legacy colors for backward compatibility
        "om-green": "#009677", // Maps to Heritage Green
        "om-navy": "#003B5C", // Keep for compatibility
        "om-gold": "#f37021", // Maps to Naartjie
        "om-grey": "#8C8C8C",
        "om-light-grey": "#F5F5F5",
      },
      fontFamily: {
        sans: [
          "Montserrat",
          "Century Gothic",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        display: [
          "Montserrat",
          "Century Gothic",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        body: [
          "Montserrat",
          "Century Gothic",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        // Old Mutual Vignette Gradients (Primary)
        "om-vignette-primary-90":
          "linear-gradient(90deg, #8dc63f 40%, #009677 60%)",
        "om-vignette-primary-45":
          "linear-gradient(45deg, #8dc63f 40%, #009677 60%)",
        // Old Mutual Vignette Gradients (Secondary)
        "om-vignette-secondary-90":
          "linear-gradient(90deg, #009677 30%, #8dc63f 55%, #f37021 15%)",
        "om-vignette-secondary-45":
          "linear-gradient(45deg, #009677 30%, #8dc63f 55%, #f37021 15%)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        lifecompass: {
          primary: "#009677", // Heritage Green
          "primary-focus": "#007d63", // Darker Heritage Green
          "primary-content": "#ffffff", // White text on primary

          secondary: "#50b848", // Fresh Green
          "secondary-focus": "#429a3c", // Darker Fresh Green
          "secondary-content": "#ffffff",

          accent: "#8dc63f", // Future Green
          "accent-focus": "#7ab035", // Darker Future Green
          "accent-content": "#000000",

          neutral: "#000000", // Black
          "neutral-focus": "#575757", // Grey 80
          "neutral-content": "#ffffff",

          "base-100": "#ffffff", // White background
          "base-200": "#f6f6f6", // Grey 5
          "base-300": "#e3e3e3", // Grey 15
          "base-content": "#000000", // Black text

          info: "#00c0e8", // Sky
          "info-content": "#ffffff",

          success: "#50b848", // Fresh Green
          "success-content": "#ffffff",

          warning: "#fff200", // Sun
          "warning-content": "#000000",

          error: "#ed0080", // Cerise
          "error-content": "#ffffff",

          "--rounded-box": "0.5rem", // 8px (cards)
          "--rounded-btn": "0.25rem", // 4px (buttons per brand guide)
          "--rounded-badge": "0.75rem", // 12px

          "--animation-btn": "0.3s",
          "--animation-input": "0.15s",

          "--btn-text-case": "uppercase",
          "--btn-focus-scale": "0.98",

          "--border-btn": "2px",
          "--tab-border": "2px",

          "--padding-card": "1.5rem", // 24px
        },
      },
    ],
  },
};
export default config;
