const typography = require('@tailwindcss/typography');
const daisyui = require('daisyui');

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {},
  },

  plugins: [typography, daisyui],

  daisyui: {
    themes: ['emerald', 'dracula'],
    darkTheme: 'dracula',
  },
};

module.exports = config;
