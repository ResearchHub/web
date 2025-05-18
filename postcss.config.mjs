/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    'postcss-import': {
      // This ensures onchainkit styles are processed first
      filter: (id) => id.includes('@coinbase/onchainkit'),
    },
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    'postcss-import': {
      // This processes your app's styles after onchainkit
      filter: (id) => !id.includes('@coinbase/onchainkit'),
    },
  },
};

export default config;
