'use client';

import { useMemo, type MouseEvent } from 'react';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { cn } from '@/utils/styles';
import {
  CITE_SCHEME,
  citationsToMarkdown,
  parseCitationHref,
  type Citation,
} from '../lib/citations';

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
  allowedAttributes: { a: ['href', 'title', 'target', 'rel', 'class'] },
  allowedSchemes: ['http', 'https', 'mailto', CITE_SCHEME],
};

const CITE_CLASS = 'ai-cite';

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
  '[&_hr]:my-5 [&_hr]:border-gray-200',
  // Citation chips: a document reference the funder can click straight into.
  '[&_.ai-cite]:mx-0.5 [&_.ai-cite]:inline-flex [&_.ai-cite]:items-baseline [&_.ai-cite]:rounded-md',
  '[&_.ai-cite]:border [&_.ai-cite]:border-primary-200 [&_.ai-cite]:bg-primary-50 [&_.ai-cite]:px-1.5 [&_.ai-cite]:py-[1px]',
  '[&_.ai-cite]:text-[14px] [&_.ai-cite]:font-medium [&_.ai-cite]:leading-[1.45] [&_.ai-cite]:text-primary-700 [&_.ai-cite]:no-underline',
  '[&_.ai-cite]:transition-colors [&_.ai-cite:hover]:border-primary-300 [&_.ai-cite:hover]:bg-primary-100 [&_.ai-cite:hover]:text-primary-800',
  '[&_strong_.ai-cite]:font-semibold'
);

const renderMarkdown = (content: string) => {
  const html = sanitizeHtml(md.render(citationsToMarkdown(content)), SANITIZE_OPTIONS);
  // Class the chips after sanitising so the stylesheet can find them without
  // the markdown pass needing to know about them.
  return html.replace(/<a href="cite:\/\//g, `<a class="${CITE_CLASS}" href="cite://`);
};

interface AssistantMarkdownProps {
  readonly content: string;
  readonly className?: string;
  /** Receives clicks on citation chips; other links behave as links. */
  readonly onCite?: (citation: Citation) => void;
}

export const AssistantMarkdown = ({ content, className, onCite }: AssistantMarkdownProps) => {
  const html = useMemo(() => renderMarkdown(content), [content]);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>(`a.${CITE_CLASS}`);
    if (!anchor) return;

    event.preventDefault();
    event.stopPropagation();

    const citation = parseCitationHref(anchor.getAttribute('href') ?? '');
    if (citation) onCite?.(citation);
  };

  return (
    <div
      className={cn(MARKDOWN_STYLES, className)}
      onClick={handleClick}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
