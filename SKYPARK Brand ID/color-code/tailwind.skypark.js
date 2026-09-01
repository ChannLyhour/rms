/**
 * SKYPARK Brand Palette for Tailwind CSS
 * Usage in tailwind.config.js:
 * 
 * const skyparkTheme = require('./SKYPARK Brand ID/color-code/tailwind.skypark.js');
 * module.exports = {
 *   theme: {
 *     extend: {
 *       colors: skyparkTheme.colors,
 *       fontFamily: skyparkTheme.fontFamily,
 *     }
 *   }
 * }
 */

module.exports = {
  colors: {
    skypark: {
      primary: '#126973',
      gold: '#F1D8C2',
      black: '#020202',
      white: '#F8F7F4',
      teal: {
        50: '#eff9fa',
        100: '#d7f0f3',
        200: '#b3e1e6',
        300: '#7ecbd4',
        400: '#45aab7',
        500: '#258a97',
        600: '#126973', // PRIMARY
        700: '#10545c',
        800: '#11454c',
        900: '#113a40',
        950: '#072328',
      },
      champagne: {
        50: '#faf6f2',
        100: '#f6ebdf',
        200: '#f1d8c2', // GOLD
        300: '#e5bf9c',
        400: '#d69f70',
        500: '#c5824c',
        600: '#b16b3b',
        700: '#935332',
        800: '#77432c',
        900: '#613827',
        950: '#351c13',
      }
    }
  },
  fontFamily: {
    skyparkDisplay: ['KSMetika', 'Playfair Display', 'serif'],
    skyparkSans: ['Montserrat', 'sans-serif'],
  }
};
