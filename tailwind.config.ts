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
        // Custom colors from your globals.css
        dark: "#381C64",
        light: "#FFFFFF",
        primary: {
          DEFAULT: "#8342EC",
          light: "#7039CA",
          dark: "#381C64",
          'extra-light': "#d4b9ff",
        },
        label: {
          orange: "#FF9800",
          blue: "#1E88E5",
          green: "#4CAF50",
          pink: "#E91E63",
          purple: "#AB47BC",
          coral: "#FF7043",
        },
        status: {
          danger: "#E30000",
          warning: "#FFBB00",
          success: "#00DE0F",
          info: "#0077FF",
        },
        cta: "#00C49A",
      },
      fontSize: {
        // Desktop typography
        'h1-desktop': '48px',
        'h2-desktop': '36px',
        'h3-desktop': '32px',
        'body-desktop': '24px',
        'caption-desktop': '20px',
        'btn-desktop': '24px',
        // Mobile typography
        'h1-mobile': '32px',
        'h2-mobile': '28px',
        'h3-mobile': '24px',
        'body-mobile': '20px',
        'caption-mobile': '18px',
        'btn-mobile': '20px',
      },
    },
  },
  plugins: [],
};

export default config; 