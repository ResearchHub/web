'use client';

import { useId, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PostBlockEditor } from '@/components/work/PostBlockEditor';
import { removeTitleFromHTML } from '@/components/Editor/lib/utils/documentTitle';
import { decodeHtmlEntities, stripHtml } from '@/utils/stringUtils';
import { cn } from '@/utils/styles';

interface Section {
  title: string;
  html: string;
}

/**
 * Split a document's body at its top-level headings: its h2s, or its h3s when
 * it has none, so a section keeps its own subsections. Text before the first
 * heading comes back as `intro`; a body with no headings has no sections.
 *
 * The editor writes headings at the top level of the body, never inside
 * another element, so cutting the HTML string at them never splits one.
 */
function splitSections(html: string): { intro: string; sections: Section[] } {
  const body = removeTitleFromHTML(html).trim();
  const level = /<h2[\s>]/i.test(body) ? 2 : 3;
  const heading = new RegExp(`^<h${level}[^>]*>([\\s\\S]*?)<\\/h${level}>`, 'i');
  const chunks = body.split(new RegExp(`(?=<h${level}[\\s>])`, 'i'));
  // A body that opens on a heading has no intro: split() never yields an
  // empty first piece for a match at the very start.
  const intro = heading.test(chunks[0] ?? '') ? '' : (chunks.shift() ?? '');
  const sections = chunks.map((chunk) => {
    const match = chunk.match(heading);
    return {
      title: decodeHtmlEntities(stripHtml(match?.[1] ?? '')),
      html: match ? chunk.slice(match[0].length) : chunk,
    };
  });
  return { intro: intro.trim(), sections };
}

const openFirstSection = (_title: string, index: number) => index === 0;

const BODY_CLASS = '!border-0 !shadow-none !rounded-none !p-0 !mb-0 !bg-transparent';

interface DocumentSectionsProps {
  /** The body as HTML. */
  content?: string;
  /** Shown instead when there is no body. */
  emptyText: string;
  /** Which sections start open; the first, unless the page says otherwise. */
  isOpenByDefault?: (title: string, index: number) => boolean;
}

/**
 * A work's body as sections that open and close, one per heading. Each
 * section's text is rendered the first time it opens and kept after that.
 */
export function DocumentSections({
  content,
  emptyText,
  isOpenByDefault = openFirstSection,
}: DocumentSectionsProps) {
  const idPrefix = useId();
  const { intro, sections } = useMemo(() => splitSections(content ?? ''), [content]);
  const [open, setOpen] = useState<Set<number>>(
    () => new Set(sections.flatMap((s, i) => (isOpenByDefault(s.title, i) ? [i] : [])))
  );
  const [rendered, setRendered] = useState<Set<number>>(() => new Set(open));

  if (!content) {
    return <p className="text-gray-500 py-12 text-center">{emptyText}</p>;
  }

  if (sections.length === 0) {
    return (
      <div className="py-6">
        <PostBlockEditor content={content} className={BODY_CLASS} />
      </div>
    );
  }

  const toggle = (index: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
    setRendered((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));
  };

  return (
    <div className="pb-6">
      {intro && (
        <div className="border-b border-gray-200 py-4">
          <PostBlockEditor content={intro} className={BODY_CLASS} />
        </div>
      )}
      {sections.map((section, index) => {
        const isOpen = open.has(index);
        const bodyId = `${idPrefix}-section-${index}`;
        return (
          <section key={index} className="border-b border-gray-200">
            <h2>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={bodyId}
                onClick={() => toggle(index)}
                className="flex h-14 w-full items-center justify-between gap-3 text-left text-[17px] font-semibold text-gray-900"
              >
                {section.title}
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    'h-5 w-5 shrink-0 text-gray-500 transition-transform',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>
            </h2>
            <div id={bodyId} className={cn('pb-4', !isOpen && 'hidden')}>
              {rendered.has(index) && (
                <PostBlockEditor content={section.html} className={BODY_CLASS} />
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
