import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { useNotebookContext } from '@/contexts/NotebookContext';

export function PublishedStatusSection() {
  const { currentNote: note, isLoading } = useNotebookContext();
  const articleType = note?.post?.contentType;
  const slug = note?.post?.slug;
  const workId = note?.post?.id;

  const isPublished = Boolean(workId);

  if (!note && !isLoading) {
    return null;
  }

  return (
    <div className="flex-1 text-center">
      {isLoading ? (
        <div className="h-5 w-14 inline-flex items-center bg-gray-100 animate-pulse rounded-full" />
      ) : isPublished ? (
        <Badge variant="success" size="sm">
          <span className="mr-1 text-sm">Published</span>
          {slug && (
            <Link
              href={
                articleType === 'preregistration'
                  ? `/fund/${workId}/${slug}`
                  : articleType === 'funding_request'
                    ? `/grant/${workId}/${slug}`
                    : `/post/${workId}/${slug}`
              }
              className="text-gray-400 hover:text-gray-600 transition-colors"
              target="_blank"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </Badge>
      ) : (
        <Badge variant="default" size="sm">
          <span className="mr-1 text-sm">Draft</span>
        </Badge>
      )}
    </div>
  );
}
