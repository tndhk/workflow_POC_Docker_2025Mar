/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        '5xl': '64rem', // max-w-5xl のカスタム定義
      }
    },
  },
  plugins: [],
}