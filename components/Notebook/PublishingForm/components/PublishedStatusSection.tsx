import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { buildWorkUrl } from '@/utils/url';

export function PublishedStatusSection() {
  const { currentNote: note, isLoading } = useNotebookContext();
  const articleType = note?.post?.contentType;
  const slug = note?.post?.slug;
  const workId = note?.post?.id;

  const isPublished = Boolean(workId);
  const grantStatus = note?.post?.grant?.status;
  const isPending = grantStatus === 'PENDING';
  const isDeclined = grantStatus === 'DECLINED';

  if (!note && !isLoading) {
    return null;
  }

  const getWorkPath = () => {
    const contentType =
      articleType === 'preregistration'
        ? 'preregistration'
        : articleType === 'funding_request'
          ? 'funding_request'
          : 'post';
    return buildWorkUrl({ id: workId, slug, contentType });
  };

  return (
    <div className="flex-1 text-center">
      {isLoading && (
        <div className="h-5 w-14 inline-flex items-center bg-gray-100 animate-pulse rounded-full" />
      )}
      {!isLoading && isDeclined && (
        <Badge variant="error" size="sm">
          <span className="text-sm">Declined</span>
        </Badge>
      )}
      {!isLoading && isPending && (
        <Badge variant="warning" size="sm">
          <span className="text-sm">Pending</span>
        </Badge>
      )}
      {!isLoading && isPublished && !isDeclined && !isPending && (
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
          <span className="text-sm">Draft</span>
        </Badge>
      )}
    </div>
  );
}
