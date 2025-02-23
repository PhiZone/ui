import type { Config } from 'tailwindcss';

import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import daisyui from 'daisyui';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {},
  },

  plugins: [
    daisyui,
    typography,
    forms({
      strategy: 'class',
    }),
  ],

  daisyui: {
    themes: ['garden', 'dracula'],
    darkTheme: 'dracula',
  },
} satisfies Config;
