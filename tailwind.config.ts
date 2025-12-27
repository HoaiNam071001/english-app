import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // Các tùy chỉnh của bạn ở đây
    },
  },
  plugins: [],
} satisfies Config;
