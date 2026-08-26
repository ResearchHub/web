'use client';

import { useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { cn } from '@/utils/styles';

const md = new MarkdownIt({ html: false, linkify: true, breaks: true });

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'code',
    'ul',
    'ol',
    'li',
    'h3',
    'h4',
    'a',
    'hr',
    'blockquote',
  ],
  allowedAttributes: { a: ['href', 'title', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
};

/**
 * Element styles follow the notebook's `MarkdownMessage`, at the larger type
 * scale AI Mode reads at, so the two assistants sound the same on the page. The
 * typography plugin isn't registered in this app, hence descendant variants.
 */
const MARKDOWN_STYLES = cn(
  'text-[17px] leading-[1.75] text-gray-900 break-words',
  '[&_p]:my-4 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
  '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_li]:my-2 [&_li]:pl-0.5',
  '[&_strong]:font-semibold [&_strong]:text-gray-900',
  '[&_em]:text-gray-700',
  '[&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:text-gray-900',
  '[&_h4]:mb-1.5 [&_h4]:mt-4 [&_h4]:text-[15px] [&_h4]:font-semibold [&_h4]:text-gray-900',
  '[&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[14px]',
  '[&_a]:text-primary-600 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary-700',
  '[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-700',
  '[&_hr]:my-5 [&_hr]:border-gray-200'
);

interface AssistantMarkdownProps {
  readonly content: string;
  readonly className?: string;
}

export const AssistantMarkdown = ({ content, className }: AssistantMarkdownProps) => {
  const html = useMemo(() => sanitizeHtml(md.render(content), SANITIZE_OPTIONS), [content]);

  return (
    <div
      className={cn(MARKDOWN_STYLES, className)}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
