'use client';

import { useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { cn } from '@/utils/styles';

// html:false makes markdown-it escape raw HTML in the source; the sanitize
// pass below is defense in depth over the generated markup.
const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    's',
    'del',
    'code',
    'pre',
    'blockquote',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'a',
    'hr',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    code: ['class'],
    th: ['align'],
    td: ['align'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  // Assistant-authored links always open externally in a new tab.
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' },
    }),
  },
};

/**
 * Local styles for rendered markdown. The Tailwind typography plugin isn't
 * registered in this app, so the element styles are scoped here with
 * descendant arbitrary variants instead of `prose`.
 */
const MARKDOWN_STYLES = cn(
  'text-sm leading-relaxed text-gray-800 break-words',
  '[&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
  '[&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5',
  '[&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_li]:my-0.5',
  '[&_h1]:mb-1.5 [&_h1]:mt-3 [&_h1]:text-base [&_h1]:font-semibold',
  '[&_h2]:mb-1.5 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold',
  '[&_h3]:mb-1 [&_h3]:mt-2.5 [&_h3]:text-sm [&_h3]:font-semibold',
  '[&_h4]:mb-1 [&_h4]:mt-2 [&_h4]:text-sm [&_h4]:font-semibold',
  '[&_h5]:mb-1 [&_h5]:mt-2 [&_h5]:text-sm [&_h5]:font-medium',
  '[&_h6]:mb-1 [&_h6]:mt-2 [&_h6]:text-sm [&_h6]:font-medium',
  '[&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px]',
  '[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-gray-100 [&_pre]:p-3',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
  '[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-600',
  '[&_a]:text-primary-600 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary-700',
  '[&_hr]:my-3 [&_hr]:border-gray-200',
  '[&_table]:my-2 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:text-xs',
  '[&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-50 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-medium',
  '[&_td]:border [&_td]:border-gray-200 [&_td]:px-2 [&_td]:py-1'
);

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

/** Renders assistant Markdown (sanitized) for chat bubbles. */
export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  const html = useMemo(() => sanitizeHtml(md.render(content), SANITIZE_OPTIONS), [content]);

  return (
    <div
      className={cn(MARKDOWN_STYLES, className)}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
