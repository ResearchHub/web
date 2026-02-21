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

  const getWorkPath = () => {
    if (articleType === 'preregistration') return `/fund/${workId}/${slug}`;
    if (articleType === 'funding_request') return `/grant/${workId}/${slug}`;
    return `/post/${workId}/${slug}`;
  };

  return (
    <div className="flex-1 text-center">
      {isLoading && (
        <div className="h-5 w-14 inline-flex items-center bg-gray-100 animate-pulse rounded-full" />
      )}
      {!isLoading && isPublished && (
        <Badge variant="success" size="sm">
          <span className="mr-1 text-sm">Published</span>
          {slug && (
            <Link
              href={getWorkPath()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              target="_blank"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </Badge>
      )}
      {!isLoading && !isPublished && (
        <Badge variant="default" size="sm">
          <span className="mr-1 text-sm">Draft</span>
        </Badge>
      )}
    </div>
  );
}
