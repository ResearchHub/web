'use client';

import { useId, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PostBlockEditor } from '@/components/work/PostBlockEditor';
import { removeTitleFromHTML } from '@/components/Editor/lib/utils/documentTitle';
import { cn } from '@/utils/styles';

interface Section {
  title: string;
  html: string;
}

/**
 * Split a document's body at its top-level headings: its h2s, or its h3s when
 * it has none, so a section keeps its own subsections. Text before the first
 * heading comes back as `intro`; a body with no headings has no sections.
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
      title: (match?.[1] ?? '').replace(/<[^>]+>/g, '').trim(),
      html: match ? chunk.slice(match[0].length) : chunk,
    };
  });
  return { intro: intro.trim(), sections };
}

/** Who can apply is what most readers of an RFP come for, so it opens with the first section. */
function isOpenByDefault(title: string, index: number) {
  return index === 0 || /eligib|who can apply/i.test(title);
}

const BODY_CLASS = '!border-0 !shadow-none !rounded-none !p-0 !mb-0 !bg-transparent';

interface DocumentSectionsProps {
  /** The body as HTML. */
  content?: string;
  /** Shown instead when there is no body. */
  emptyText: string;
}

/** A work's body as sections that open and close, one per heading. */
export function DocumentSections({ content, emptyText }: DocumentSectionsProps) {
  const idPrefix = useId();
  const { intro, sections } = useMemo(() => splitSections(content ?? ''), [content]);
  const [open, setOpen] = useState<Set<number>>(
    () => new Set(sections.flatMap((s, i) => (isOpenByDefault(s.title, i) ? [i] : [])))
  );

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

  const toggle = (index: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

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
            {/* Kept mounted while closed, so the text stays on the page for search. */}
            <div id={bodyId} className={cn('pb-4', !isOpen && 'hidden')}>
              <PostBlockEditor content={section.html} className={BODY_CLASS} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
