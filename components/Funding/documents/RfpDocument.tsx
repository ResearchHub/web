'use client';

import { useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/utils/styles';
import { DocumentSection } from './DocumentSection';
import type { RfpSection, RfpStatus } from './types';

const md = new MarkdownIt({ html: false, linkify: true, breaks: false });

/**
 * Document typography, matching the editor's ProseMirror styles
 * (`components/Editor/styles/partials/typography.css`) so the drafted RFP reads
 * like a ResearchHub document rather than a chat message.
 */
const DOCUMENT_PROSE = cn(
  'text-[15px] leading-relaxed text-gray-800',
  '[&_p]:my-4 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
  '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1.5',
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

const STATUS_LABEL: Record<RfpStatus, { label: string; className: string }> = {
  drafting: { label: 'Drafting', className: 'border-gray-200 bg-gray-50 text-gray-500' },
  drafted: { label: 'Draft complete', className: 'border-gray-200 bg-gray-50 text-gray-600' },
  published: { label: 'Live', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
};

interface RfpDocumentProps {
  readonly title: string;
  readonly organization: string;
  readonly amountUsd: number;
  readonly sections: RfpSection[];
  /**
   * Sections drafted so far, in order. Undefined renders the whole document;
   * a list renders placeholders for whatever is still to come.
   */
  readonly revealedSectionIds?: string[];
  readonly status?: RfpStatus;
  readonly highlightSectionId?: string | null;
  readonly highlightKey?: string | number | null;
  readonly className?: string;
}

/**
 * The request for proposals as a document. While it is being drafted the
 * undrafted sections show as placeholders, so a reader can see it assembling
 * rather than just growing.
 */
export const RfpDocument = ({
  title,
  organization,
  amountUsd,
  sections,
  revealedSectionIds,
  status,
  highlightSectionId = null,
  highlightKey = null,
  className,
}: RfpDocumentProps) => {
  const revealed = revealedSectionIds ? new Set(revealedSectionIds) : null;
  const isRevealed = (sectionId: string) => !revealed || revealed.has(sectionId);
  const nextPendingIndex = sections.findIndex((section) => !isRevealed(section.id));
  const isComplete = nextPendingIndex === -1;
  const resolvedStatus: RfpStatus = status ?? (isComplete ? 'drafted' : 'drafting');
  const statusLabel = STATUS_LABEL[resolvedStatus];

  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {organization} · ${amountUsd.toLocaleString('en-US')}
        </div>
        <span
          className={cn(
            'shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider',
            statusLabel.className
          )}
        >
          {statusLabel.label}
        </span>
      </div>

      {sections.map((section, index) => {
        if (isRevealed(section.id)) {
          const isTitle = section.id === 'title';
          return (
            <DocumentSection
              key={section.id}
              id={section.id}
              highlighted={highlightSectionId === section.id}
              highlightKey={highlightKey}
              className="animate-fadeIn"
            >
              {isTitle ? (
                <h1 className="mb-6 mt-2 text-3xl font-bold leading-tight tracking-tight text-gray-900">
                  {title}
                </h1>
              ) : (
                <h2 className="mb-3 mt-10 text-2xl font-bold tracking-tight text-gray-900">
                  {section.heading}
                </h2>
              )}
              <DocumentMarkdown content={section.body} />
            </DocumentSection>
          );
        }

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

      {isComplete && resolvedStatus !== 'published' && (
        <div className="mt-10 flex items-center gap-1.5 border-t border-gray-100 pt-4 text-xs font-medium text-emerald-600">
          <Check className="h-3.5 w-3.5" />
          Draft complete
        </div>
      )}
    </div>
  );
};
