import type { ComponentType } from 'react';
import { AppWindow, Atom, Code, FileText, Image, Workflow } from 'lucide-react';

interface KindInfo {
  label: string;
  icon: ComponentType<{ className?: string }>;
  extension: string;
  mimeType: string;
}

const KINDS: Record<string, KindInfo> = {
  html: { label: 'Web page', icon: AppWindow, extension: 'html', mimeType: 'text/html' },
  react: { label: 'React component', icon: Atom, extension: 'jsx', mimeType: 'text/javascript' },
  svg: { label: 'SVG image', icon: Image, extension: 'svg', mimeType: 'image/svg+xml' },
  mermaid: { label: 'Diagram', icon: Workflow, extension: 'mmd', mimeType: 'text/plain' },
  markdown: { label: 'Document', icon: FileText, extension: 'md', mimeType: 'text/markdown' },
  code: { label: 'Code', icon: Code, extension: 'txt', mimeType: 'text/plain' },
};

/** File extensions for the languages a code artifact is most likely in. */
const LANGUAGE_EXTENSIONS: Record<string, string> = {
  python: 'py',
  r: 'R',
  javascript: 'js',
  typescript: 'ts',
  julia: 'jl',
  matlab: 'm',
  bash: 'sh',
  shell: 'sh',
  sql: 'sql',
  json: 'json',
  yaml: 'yaml',
  latex: 'tex',
  tex: 'tex',
  css: 'css',
  html: 'html',
  java: 'java',
  c: 'c',
  'c++': 'cpp',
  cpp: 'cpp',
  rust: 'rs',
  go: 'go',
};

/** Display copy and file type for `kind`; a kind this build doesn't know reads as code. */
export function artifactKindInfo(kind: string | undefined): KindInfo {
  return KINDS[kind ?? ''] ?? KINDS.code;
}

/** A download filename for the artifact, from its title. */
export function artifactFilename(title: string, kind: string, language: string): string {
  const base =
    title
      .trim()
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, '-')
      .replaceAll(/^-+|-+$/g, '')
      .slice(0, 80) || 'artifact';
  const extension =
    kind === 'code'
      ? (LANGUAGE_EXTENSIONS[language.trim().toLowerCase()] ?? 'txt')
      : artifactKindInfo(kind).extension;
  return `${base}.${extension}`;
}
