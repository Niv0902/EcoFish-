module.exports = {
  content: ["./*.{html,js,ts}"],
  darkmode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio")
  ],
};
