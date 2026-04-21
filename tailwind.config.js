/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif Display"', 'Georgia', 'serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
    },
  },
};
