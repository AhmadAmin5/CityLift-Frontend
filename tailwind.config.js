/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#008C78",
          dark: "#006F60",
          light: "#E8F7F4",
          soft: "#F1FBF9",
        },
        neutral: {
          background: "#FFFFFF",
          surface: "#FFFFFF",
          muted: "#F7F8FA",
          border: "#E1E5EA",
          borderStrong: "#CED4DA",
          text: "#101820",
          secondary: "#4B5563",
          placeholder: "#8A9099",
          icon: "#7A8088",
        },
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
        info: "#2563EB",
      },
      borderRadius: {
        ride: "14px",
        card: "24px",
        sheet: "24px",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(16, 24, 32, 0.06)",
        card: "0 10px 30px rgba(16, 24, 32, 0.08)",
        sheet: "0 -8px 30px rgba(16, 24, 32, 0.10)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};