import { PostBlockEditor } from './PostBlockEditor';
import type { RegisteredReportWork } from '@/types/registeredReport';

interface RegisteredReportDocumentProps {
  work: RegisteredReportWork;
  content?: string;
}

export function RegisteredReportDocument({ work, content }: RegisteredReportDocumentProps) {
  const contentJson = serializeTipTapJson(work.fullJson);
  const formattedContent =
    content || work.formattedHtml || work.fullSrc || work.fullMarkdown || work.previewContent || '';

  return (
    <div className="mt-6">
      {contentJson ? (
        <PostBlockEditor contentJson={contentJson} editable={false} />
      ) : formattedContent ? (
        <PostBlockEditor content={formattedContent} editable={false} />
      ) : work.abstract ? (
        <article className="prose mb-6 max-w-none rounded-lg border bg-white p-6 shadow-sm">
          <p>{work.abstract}</p>
        </article>
      ) : (
        <p className="text-gray-500">No content available</p>
      )}
    </div>
  );
}

function serializeTipTapJson(content: unknown): string | undefined {
  if (!content) return undefined;

  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    if (!parsed || typeof parsed !== 'object') return undefined;

    const maybeDoc = parsed as { content?: unknown[] };
    if (!Array.isArray(maybeDoc.content) || maybeDoc.content.length === 0) return undefined;

    return typeof content === 'string' ? content : JSON.stringify(content);
  } catch {
    return undefined;
  }
}
