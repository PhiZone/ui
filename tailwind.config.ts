import type { Config } from 'tailwindcss';

import typography from '@tailwindcss/typography';
import daisyui from 'daisyui';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {},
  },

  plugins: [typography, daisyui],

  daisyui: {
    themes: ['garden', 'dracula'],
    darkTheme: 'dracula',
  },
} satisfies Config;
