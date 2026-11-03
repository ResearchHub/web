/**
 * Builds the page an artifact renders as, for an `<iframe sandbox="allow-scripts">`
 * `srcdoc`. Without `allow-same-origin` the page gets an opaque origin: it
 * cannot read the app's cookies, storage or DOM, navigate the app, or open
 * windows. The CSP below closes the rest — it may load scripts, styles and
 * fonts only from the listed CDNs, show only inline images, and make no
 * network requests of its own — so content the model wrote (and anything a
 * fetched page talked it into writing) cannot send data anywhere.
 *
 * Markdown and code are not pages: they render in the app itself, through
 * its sanitizing renderers, and get no document here.
 */

import type { ArtifactKind } from '@/types/artifact';

/** Kinds this build renders in the sandbox. */
const FRAMED_KINDS: ReadonlySet<string> = new Set<ArtifactKind>([
  'html',
  'react',
  'svg',
  'mermaid',
]);

const SCRIPT_HOSTS = [
  'https://cdnjs.cloudflare.com',
  'https://cdn.jsdelivr.net',
  'https://unpkg.com',
  'https://esm.sh',
  'https://cdn.tailwindcss.com',
].join(' ');

const CSP = [
  "default-src 'none'",
  `script-src 'unsafe-inline' 'unsafe-eval' blob: ${SCRIPT_HOSTS}`,
  `style-src 'unsafe-inline' ${SCRIPT_HOSTS} https://fonts.googleapis.com`,
  `font-src data: ${SCRIPT_HOSTS} https://fonts.gstatic.com`,
  'img-src data: blob:',
  'media-src data: blob:',
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

/** Message the page posts to its parent when it fails; the parent checks the source window. */
export const ARTIFACT_ERROR_MESSAGE = 'researchhub-artifact-error';

// Runs before the content: uncaught errors and rejections are reported to the
// parent, which shows them, since the sandbox has no console the user sees.
const ERROR_REPORTER = `<script>
(function () {
  function report(error) {
    var message = error && error.message ? error.message : String(error);
    parent.postMessage({ type: '${ARTIFACT_ERROR_MESSAGE}', message: message.slice(0, 2000) }, '*');
  }
  window.__reportArtifactError = report;
  addEventListener('error', function (event) { report(event.error || event.message); });
  addEventListener('unhandledrejection', function (event) { report(event.reason); });
})();
</script>`;

const HEAD = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
${ERROR_REPORTER}`;

const BASE_STYLE = `<style>
  html, body { margin: 0; background: #fff; color: #111827;
    font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; }
  .artifact-loading { margin: 24px; font-size: 14px; color: #6b7280; }
</style>`;

/**
 * Module versions a React artifact can import, matching what the tool
 * description promises the model. React dependencies are left external so
 * every module shares the one React the import map names.
 */
const REACT_IMPORTS = {
  react: 'https://esm.sh/react@18.3.1',
  'react/': 'https://esm.sh/react@18.3.1/',
  'react-dom': 'https://esm.sh/react-dom@18.3.1?external=react',
  'react-dom/client': 'https://esm.sh/react-dom@18.3.1/client?external=react',
  recharts: 'https://esm.sh/recharts@2.15.0?external=react,react-dom',
  'lucide-react': 'https://esm.sh/lucide-react@0.468.0?external=react',
  d3: 'https://esm.sh/d3@7.9.0',
  lodash: 'https://esm.sh/lodash@4.17.21',
};

const BABEL = 'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.26.4/babel.min.js';
const TAILWIND = 'https://cdn.tailwindcss.com/3.4.16';
const MERMAID = 'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs';

/** JSON for a `<script type="application/json">`, safe against `</script>` in the source. */
function embeddedJson(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll('<', String.raw`<`)
    .replaceAll(' ', String.raw` `)
    .replaceAll(' ', String.raw` `);
}

function sourceScript(content: string): string {
  return `<script type="application/json" id="artifact-source">${embeddedJson(content)}</script>`;
}

function reactDocument(content: string): string {
  return `${HEAD}
<script type="importmap">${embeddedJson({ imports: REACT_IMPORTS })}</script>
<script src="${BABEL}"></script>
<script src="${TAILWIND}"></script>
${BASE_STYLE}
<div id="root"><p class="artifact-loading">Loading…</p></div>
${sourceScript(content)}
<script type="module">
  const source = JSON.parse(document.getElementById('artifact-source').textContent);
  try {
    // JSX and TypeScript only: imports stay as they are, for the import map.
    const { code } = Babel.transform(source, {
      filename: 'artifact.tsx',
      presets: [['react', { runtime: 'automatic' }], ['typescript', { isTSX: true, allExtensions: true }]],
    });
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    const module = await import(url);
    const Component = module.default;
    if (typeof Component !== 'function') {
      throw new Error('The component must be the default export.');
    }
    const [{ createElement }, { createRoot }] = await Promise.all([
      import('react'),
      import('react-dom/client'),
    ]);
    createRoot(document.getElementById('root')).render(createElement(Component));
  } catch (error) {
    document.getElementById('root').textContent = '';
    window.__reportArtifactError(error);
  }
</script>`;
}

function mermaidDocument(content: string): string {
  return `${HEAD}
${BASE_STYLE}
<style>#diagram { padding: 24px; display: flex; justify-content: center; }
  #diagram svg { max-width: 100%; height: auto; }</style>
<div id="diagram"><p class="artifact-loading">Drawing the diagram…</p></div>
${sourceScript(content)}
<script type="module">
  const source = JSON.parse(document.getElementById('artifact-source').textContent);
  try {
    const { default: mermaid } = await import('${MERMAID}');
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral' });
    const { svg } = await mermaid.render('artifact-diagram', source);
    document.getElementById('diagram').innerHTML = svg;
  } catch (error) {
    document.getElementById('diagram').textContent = '';
    window.__reportArtifactError(error);
  }
</script>`;
}

function svgDocument(content: string): string {
  return `${HEAD}
${BASE_STYLE}
<style>body { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  body > svg { max-width: 100%; max-height: 100vh; height: auto; }</style>
${content}`;
}

/**
 * The model's page goes after the reporter and the CSP, so the policy is in
 * force before any of its markup is parsed. Its own doctype, `<html>` and
 * `<head>` then merge into this document's as stray tags.
 */
function htmlDocument(content: string): string {
  return `${HEAD}
${content}`;
}

/** Whether `kind` renders in the sandbox rather than in the app. */
export function rendersInFrame(kind: string): boolean {
  return FRAMED_KINDS.has(kind);
}

/** The `srcdoc` for an artifact, or null for a kind that is not framed. */
export function buildArtifactDocument(kind: string, content: string): string | null {
  switch (kind) {
    case 'html':
      return htmlDocument(content);
    case 'react':
      return reactDocument(content);
    case 'svg':
      return svgDocument(content);
    case 'mermaid':
      return mermaidDocument(content);
    default:
      return null;
  }
}
