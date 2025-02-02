import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import nesting from 'tailwindcss/nesting/index.js';

export default {
  plugins: [
    //Some plugins, like tailwindcss/nesting, need to run before Tailwind,
    nesting(),
    tailwindcss(),
    //But others, like autoprefixer, need to run after,
    autoprefixer,
  ],
};
