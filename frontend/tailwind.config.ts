import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B3D91',
          50: '#E6EDF7',
          100: '#CCD9EE',
          200: '#99B3DD',
          300: '#668DCC',
          400: '#3367BB',
          500: '#0B3D91',
          600: '#093174',
          700: '#072557',
          800: '#04193A',
          900: '#020C1D',
        },
        accent: {
          DEFAULT: '#FF6B35',
          50: '#FFF3EF',
          100: '#FFE7DF',
          200: '#FFCFBF',
          300: '#FFB79F',
          400: '#FF9F7F',
          500: '#FF6B35',
          600: '#FF4500',
          700: '#CC3700',
          800: '#992900',
          900: '#661B00',
        },
        neutral: {
          DEFAULT: '#F7F7F8',
          50: '#FFFFFF',
          100: '#F7F7F8',
          200: '#E5E5E7',
          300: '#D3D3D6',
          400: '#C1C1C5',
          500: '#AFAFB4',
          600: '#8C8C93',
          700: '#696972',
          800: '#464651',
          900: '#232330',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

