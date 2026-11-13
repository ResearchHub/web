'use client';

import { useId, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ZoomableImages } from '@/components/ui/ZoomableImages';
import { PostBlockEditor } from '@/components/work/PostBlockEditor';
import { getTitleFromHTML, removeTitleFromHTML } from '@/components/Editor/lib/utils/documentTitle';
import { decodeHtmlEntities, stripHtml } from '@/utils/stringUtils';
import { cn } from '@/utils/styles';

interface Section {
  title: string;
  html: string;
}

/** A block's words, its line breaks read as spaces. */
const blockText = (html: string) => decodeHtmlEntities(stripHtml(html.replace(/<br[^>]*>/gi, ' ')));

/** Text as compared with other text: without accents, case or punctuation. */
const comparable = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

/** Words around a name that the byline leaves out: "by", titles and degrees. */
const NAME_EXTRAS = new Set(['by', 'dr', 'prof', 'professor', 'mr', 'mrs', 'ms', 'phd', 'md']);

/** A name as compared with the byline's: initials, titles and degrees aside. */
const nameKey = (name: string) =>
  comparable(name.replace(/\./g, ''))
    .split(' ')
    .filter((word) => word.length > 1 && !NAME_EXTRAS.has(word))
    .join(' ');

/** Whether a line only lists people the byline names, as "By Ana Ruiz and Li Wei, PhD" does. */
function onlyNamesBylineAuthors(text: string, bylineNames: Set<string>): boolean {
  const names = text
    .split(/,|;|&|·|\||\band\b/i)
    .map(nameKey)
    .filter(Boolean);
  return names.length > 0 && names.every((name) => bylineNames.has(name));
}

/** A paragraph or heading at the very top of some HTML, with what it holds. */
const LEADING_BLOCK = /^\s*<(p|h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/i;
/** A tag that only styles the text it holds; a link, an image or any other tag is more than text. */
const FORMATTING_TAG = String.raw`<\/?(?:span|strong|em|b|i|u|s|mark|sup|sub|code|br)\b[^>]*>`;
const FORMATTING_TAGS = new RegExp(FORMATTING_TAG, 'gi');
/** A paragraph or heading with no text: only spaces, line breaks and formatting. */
const BLANK_LINE = String.raw`<(p|h[1-6])\b[^>]*>(?:\s|&nbsp;|${FORMATTING_TAG})*<\/\1>`;
const LEADING_BLANK_LINES = new RegExp(String.raw`^(?:\s*${BLANK_LINE})+`, 'i');
const TRAILING_BLANK_LINES = new RegExp(String.raw`(?:${BLANK_LINE}\s*)+$`, 'i');
/** The headings inside a section, its subsections' titles. */
const SUBHEADINGS = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi;

const isPlainText = (html: string) => !/<[a-z/]/i.test(html.replace(FORMATTING_TAGS, ''));

/** Some HTML less the blank lines at either end. */
const trimBlankLines = (html: string) =>
  html.trim().replace(LEADING_BLANK_LINES, '').replace(TRAILING_BLANK_LINES, '').trim();

/**
 * The intro less the lines at its top that repeat what the page shows above
 * it: the title, or only names the byline shows. Such a line is plain text,
 * so one holding a link or an image stays. The first line that is neither
 * ends the scan, and everything from there on stays as written.
 */
function dropRepeatedLines(html: string, title: string, bylineNames: Set<string>): string {
  const titleKey = comparable(title);
  let rest = trimBlankLines(html);
  for (let block = rest.match(LEADING_BLOCK); block; block = rest.match(LEADING_BLOCK)) {
    const text = blockText(block[2]);
    const isRepeat =
      isPlainText(block[2]) &&
      ((!!titleKey && comparable(text) === titleKey) || onlyNamesBylineAuthors(text, bylineNames));
    if (!isRepeat) break;
    rest = trimBlankLines(rest.slice(block[0].length));
  }
  return rest;
}

/** Some HTML cut before each of a heading's tags. */
const cutBefore = (html: string, tag: string) => html.split(new RegExp(`(?=<${tag}[\\s>])`, 'i'));

/**
 * Split a document's body at its top-level headings, so a section keeps its
 * own subsections: its h2s, or its h3s when it has none. Some writers use h1
 * for sections and h2 for their subsections; then the sections are the h1s
 * past the title, and any h2 before the first of them. The text before the
 * first section comes back as `intro`, which is the whole body when it has
 * no headings.
 *
 * The editor writes headings at the top level of the body, never inside
 * another element, so cutting the HTML string at them never splits one.
 */
function splitSections(
  html: string,
  bylineNames: string[]
): { intro: string; sections: Section[] } {
  // The title shows on the cover, so the body drops its own.
  const body = removeTitleFromHTML(html).trim();
  const firstH1 = body.search(/<h1[\s>]/i);
  const hasH2 = /<h2[\s>]/i.test(body);
  const chunks =
    firstH1 >= 0
      ? [...cutBefore(body.slice(0, firstH1), 'h2'), ...cutBefore(body.slice(firstH1), 'h1')]
      : cutBefore(body, hasH2 ? 'h2' : 'h3');
  const level = firstH1 >= 0 || hasH2 ? 'h[12]' : 'h3';
  const heading = new RegExp(`^<(${level})[^>]*>([\\s\\S]*?)<\\/\\1>`, 'i');
  // A body that opens on a heading has no intro: its first piece is either
  // that heading's section or, when the heading is an h1, empty.
  const intro = heading.test(chunks[0] ?? '') ? '' : (chunks.shift() ?? '');
  const sections = chunks.map((chunk) => {
    const match = chunk.match(heading);
    return {
      title: blockText(match?.[2] ?? ''),
      html: trimBlankLines(match ? chunk.slice(match[0].length) : chunk),
    };
  });
  const title = blockText(getTitleFromHTML(html));
  return { intro: dropRepeatedLines(intro, title, new Set(bylineNames.map(nameKey))), sections };
}

/**
 * The sections that start open, counted among those with something to open.
 * One opens when the page's rule holds for its title or a subsection's, so
 * an RFP's eligibility under a part title still opens.
 */
function getOpenSections(
  sections: Section[],
  isOpenByDefault: (title: string, index: number) => boolean
): Set<number> {
  const openable = sections.flatMap((section, index) => (section.html ? [index] : []));
  return new Set(
    openable.filter((index, n) => {
      const { title, html } = sections[index];
      const subtitles = Array.from(html.matchAll(SUBHEADINGS), (match) => blockText(match[1]));
      return [title, ...subtitles].some((t) => isOpenByDefault(t, n));
    })
  );
}

const openFirstSection = (_title: string, index: number) => index === 0;

const BODY_CLASS = '!border-0 !shadow-none !rounded-none !p-0 !mb-0 !bg-transparent';

const SECTION_TITLE_CLASS =
  'flex min-h-14 w-full items-center justify-between gap-3 py-3 text-left text-[17px] font-semibold text-gray-900';

const NO_NAMES: string[] = [];

interface DocumentSectionsProps {
  /** The body as HTML. */
  content?: string;
  /** Shown instead when there is no body. */
  emptyText: string;
  /**
   * Which sections start open, from a title in the section and its place
   * among those that open; the first, unless the page says otherwise.
   */
  isOpenByDefault?: (title: string, index: number) => boolean;
  /** The authors the byline above names, so the body needn't name them again. */
  bylineNames?: string[];
}

/**
 * A work's body as sections that open and close, one per heading. Each
 * section's text is rendered the first time it opens and kept after that. A
 * click on an image opens it full screen.
 *
 * The text before the first heading leads the body as its opening
 * paragraphs. Its blank lines go, and so does a line that only repeats the
 * title or the byline's authors; anything else in it stays.
 */
export function DocumentSections({
  content,
  emptyText,
  isOpenByDefault = openFirstSection,
  bylineNames = NO_NAMES,
}: DocumentSectionsProps) {
  const idPrefix = useId();
  const { intro, sections } = useMemo(
    () => splitSections(content ?? '', bylineNames),
    [content, bylineNames]
  );
  const [open, setOpen] = useState<Set<number>>(() => getOpenSections(sections, isOpenByDefault));
  const [rendered, setRendered] = useState<Set<number>>(() => new Set(open));

  if (!intro && sections.length === 0) {
    return <p className="text-gray-500 py-12 text-center">{emptyText}</p>;
  }

  if (sections.length === 0) {
    return (
      <ZoomableImages className="py-6">
        <PostBlockEditor content={intro} className={BODY_CLASS} />
      </ZoomableImages>
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
    <ZoomableImages className="pb-6">
      {intro && (
        <div className="pb-2 pt-4">
          <PostBlockEditor content={intro} className={BODY_CLASS} />
        </div>
      )}
      {sections.map((section, index) => {
        // A heading with nothing under it but the next heading, as a part
        // title over its sections, has nothing to open.
        if (!section.html) {
          return (
            <section key={index} className="border-b border-gray-200">
              <h2 className={SECTION_TITLE_CLASS}>{section.title}</h2>
            </section>
          );
        }
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
                className={SECTION_TITLE_CLASS}
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
    </ZoomableImages>
  );
}
