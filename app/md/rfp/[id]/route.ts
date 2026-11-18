import { renderRfpMarkdown } from '@/lib/agent-markdown';
import { PostService } from '@/services/post.service';

interface Params {
  params: Promise<{ id: string }>;
}

/** Markdown for an RFP. Reached by the Accept: text/markdown rewrite in next.config.js. */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return new Response('Not found', { status: 404 });

  try {
    const work = await PostService.getPublic(id);
    if (work.contentType !== 'funding_request' || work.isPublic === false) {
      return new Response('Not found', { status: 404 });
    }
    return new Response(renderRfpMarkdown(work, `/rfp/${id}/${work.slug}`), {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'X-Robots-Tag': 'noindex',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
