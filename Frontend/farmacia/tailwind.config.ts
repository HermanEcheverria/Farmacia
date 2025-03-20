import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta primaria
        'farmacia-primary-1': '#024059',
        'farmacia-primary-2': '#024E68',
        // Paleta secundaria
        'farmacia-secondary-1': '#04BFBA',
        'farmacia-secondary-2': '#025940',
        'farmacia-secondary-3': '#03A64A',
      },
    },
  },
  plugins: [],
};

export default config;
