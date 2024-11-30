/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    colors: {
      current: 'currentColor',
      transparent: 'transparent',
      white: '#FFFFFF',
      black: '#090E34',
      dark: '#1D2144',
      primary: '#4A6CF7',
      yellow: '#FBB040',
      grey: '#C5C4C4',
      'body-color': '#959CB1',
    },

    extend: {
      boxShadow: {
        signUp: '0px 5px 10px rgba(4, 10, 34, 0.2)',
        one: '0px 2px 3px rgba(7, 7, 77, 0.05)',
        sticky: 'inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)',
      },
      scrollbar: {
        thin: '8px',
        thumb: '#4B5563', // Cor do indicador de rolagem
        track: '#F3F4F6', // Cor do fundo da barra de rolagem
      },
      scale: {
        115: '1.15',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}
