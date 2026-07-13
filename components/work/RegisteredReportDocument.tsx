import { PostBlockEditor } from './PostBlockEditor';
import { stripHtml } from '@/utils/stringUtils';
import type { RegisteredReportWork } from '@/types/registeredReport';

const REGISTERED_REPORT_FALLBACK_HEADINGS = [
  { label: '1. Abstract', level: 2 },
  { label: '2. Introduction', level: 2 },
  { label: 'Hypotheses', level: 3 },
  { label: '3. Methods', level: 2 },
  { label: 'Participants/Sample', level: 3 },
  { label: 'Materials and Procedures', level: 3 },
  { label: 'Planned Analyses', level: 3 },
  { label: 'Ethics and Data Management', level: 3 },
  { label: '4. Pilot Data (Optional)', level: 2 },
  { label: '5. Budget', level: 2 },
  { label: '6. References', level: 2 },
] as const;

interface RegisteredReportDocumentProps {
  work: RegisteredReportWork;
  content?: string;
}

/**
 * Renders the current registered-report work body without stage switching.
 */
export function RegisteredReportDocument({ work, content }: RegisteredReportDocumentProps) {
  const contentJson = stringifyTipTapJson(work.fullJson);
  const formattedContent =
    content || work.formattedHtml || work.fullSrc || work.fullMarkdown || work.previewContent || '';
  const reportText = formattedContent ? stripHtml(formattedContent) : work.abstract || '';

  return (
    <div className="mt-6">
      {contentJson ? (
        <PostBlockEditor contentJson={contentJson} editable={false} />
      ) : formattedContent && hasHtmlTags(formattedContent) ? (
        <PostBlockEditor content={formattedContent} editable={false} />
      ) : reportText ? (
        <StructuredRegisteredReportText text={reportText} title={work.title} />
      ) : (
        <p className="text-gray-500">No content available</p>
      )}
    </div>
  );
}

/**
 * Renders plain registered-report text using known report headings.
 */
function StructuredRegisteredReportText({ text, title }: { text: string; title: string }) {
  const normalized = normalizeFlattenedText(text, title);
  const headingPositions = REGISTERED_REPORT_FALLBACK_HEADINGS.map((heading) => ({
    ...heading,
    index: normalized.indexOf(heading.label),
  }))
    .filter((heading) => heading.index >= 0)
    .sort((a, b) => a.index - b.index);

  if (headingPositions.length === 0) {
    return (
      <div className="prose max-w-none bg-white rounded-lg shadow-sm border p-6 mb-6">
        <p>{normalized}</p>
      </div>
    );
  }

  return (
    <article className="prose max-w-none bg-white rounded-lg shadow-sm border p-6 mb-6">
      {headingPositions.map((heading, index) => {
        const nextHeading = headingPositions[index + 1];
        const body = normalized
          .slice(heading.index + heading.label.length, nextHeading?.index ?? normalized.length)
          .trim();

        return (
          <section key={heading.label} className={index === 0 ? undefined : 'mt-6'}>
            {heading.level === 2 ? (
              <h2 className="!mt-0">{heading.label}</h2>
            ) : (
              <h3 className="!mt-0">{heading.label}</h3>
            )}
            {body && <p>{body}</p>}
          </section>
        );
      })}
    </article>
  );
}

/**
 * Normalizes plain text and strips a duplicated leading title.
 */
function normalizeFlattenedText(text: string, title: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (title && normalized.startsWith(title)) {
    return normalized.slice(title.length).trim();
  }

  return normalized;
}

/**
 * Detects whether a content string contains HTML markup.
 */
function hasHtmlTags(content: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(content);
}

/**
 * Serializes TipTap JSON into the editor wrapper's expected string shape.
 */
function stringifyTipTapJson(content: unknown): string | undefined {
  if (!content) return undefined;

  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    if (!parsed || typeof parsed !== 'object') return undefined;

    const maybeDoc = parsed as { content?: unknown[] };
    if (!Array.isArray(maybeDoc.content) || maybeDoc.content.length === 0) return undefined;

    return typeof content === 'string' ? content : JSON.stringify(content);
  } catch {
    return typeof content === 'string' && content.trim() ? content : undefined;
  }
}
