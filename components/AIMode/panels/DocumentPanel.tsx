'use client';

import { useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { Check, Loader2, X } from 'lucide-react';
import { cn } from '@/utils/styles';
import { GRANT, RFP_SECTIONS } from '../lib/grantData';

const md = new MarkdownIt({ html: false, linkify: true, breaks: false });

/**
 * Document typography, matching the editor's ProseMirror styles
 * (`components/Editor/styles/partials/typography.css`) so the drafted RFP reads
 * like a ResearchHub document rather than a chat message.
 */
const DOCUMENT_PROSE = cn(
  'text-[15px] leading-relaxed text-gray-800',
  '[&_p]:my-4 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
  '[&_strong]:font-semibold [&_strong]:text-gray-900',
  '[&_em]:italic'
);

const DocumentMarkdown = ({ content }: { readonly content: string }) => {
  const html = useMemo(
    () =>
      sanitizeHtml(md.render(content), {
        allowedTags: ['p', 'strong', 'em', 'br', 'ul', 'ol', 'li', 'a'],
        allowedAttributes: { a: ['href'] },
      }),
    [content]
  );

  return (
    <div
      className={DOCUMENT_PROSE}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface DocumentPanelProps {
  readonly revealedSections: string[];
  readonly onClose: () => void;
}

export const DocumentPanel = ({ revealedSections, onClose }: DocumentPanelProps) => {
  const revealed = new Set(revealedSections);
  const nextPendingIndex = RFP_SECTIONS.findIndex((section) => !revealed.has(section.id));

  return (
    <div className="flex h-full w-full flex-col border-l border-gray-200">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-gray-900">Request for proposals</div>
          <div className="text-xs text-gray-500">
            {revealed.size} of {RFP_SECTIONS.length} sections drafted
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close document"
          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="mx-auto max-w-[640px] rounded-xl border border-gray-200 bg-white px-9 py-10 shadow-sm">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
            {GRANT.organization} · ${GRANT.amountUsd.toLocaleString('en-US')}
          </div>

          {RFP_SECTIONS.map((section, index) => {
            if (revealed.has(section.id)) {
              return (
                <section key={section.id} className="animate-fadeIn">
                  {section.id === 'title' ? (
                    <h1 className="mb-6 mt-2 text-3xl font-bold leading-tight tracking-tight text-gray-900">
                      {GRANT.title}
                    </h1>
                  ) : (
                    <h2 className="mb-3 mt-10 text-2xl font-bold tracking-tight text-gray-900">
                      {section.heading}
                    </h2>
                  )}
                  <DocumentMarkdown content={section.body} />
                </section>
              );
            }

            // Placeholders make the document visibly incomplete, so the funder
            // can see it assembling rather than just growing.
            return (
              <div
                key={section.id}
                className={cn(
                  'mt-8 flex items-center gap-2 text-sm',
                  index === nextPendingIndex ? 'text-primary-600' : 'text-gray-300'
                )}
              >
                {index === nextPendingIndex ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                )}
                {section.heading}
              </div>
            );
          })}

          {revealed.size === RFP_SECTIONS.length && (
            <div className="mt-10 flex items-center gap-1.5 border-t border-gray-100 pt-4 text-xs font-medium text-emerald-600">
              <Check className="h-3.5 w-3.5" />
              Draft complete
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
