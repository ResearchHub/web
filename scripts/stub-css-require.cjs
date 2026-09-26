/**
 * Stubs out CSS imports (e.g. `tippy.js/dist/tippy.css` inside editor
 * extensions) so application modules can be loaded by plain Node scripts,
 * outside a bundler. tsx compiles this package's TypeScript to CommonJS, so
 * CSS arrives via require(); without a handler Node falls back to compiling
 * it as JavaScript and throws a SyntaxError.
 *
 * Usage: node --require ./scripts/stub-css-require.cjs --import tsx <script>
 */
require.extensions['.css'] = (module) => {
  module.exports = {};
};
