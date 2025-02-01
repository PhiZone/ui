import nesting from 'tailwindcss/nesting/index.js';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    //Some plugins, like tailwindcss/nesting, need to run before Tailwind,
    nesting(),
    tailwindcss(),
    //But others, like autoprefixer, need to run after,
    autoprefixer,
  ],
};
