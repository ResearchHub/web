import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { buildWorkUrl } from '@/utils/url';
import { cn } from '@/utils/styles';

function StatusDot({ className }: Readonly<{ className?: string }>) {
  return <span className={cn('h-2 w-2 rounded-full', className)} aria-hidden />;
}

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
    <div className="inline-flex items-center gap-1.5 text-sm">
      {isLoading && <span className="h-2 w-2 rounded-full bg-gray-200 animate-pulse" />}
      {!isLoading && isDeclined && (
        <>
          <StatusDot className="bg-red-500" />
          <span className="font-medium text-red-600">Declined</span>
        </>
      )}
      {!isLoading && isPending && (
        <>
          <StatusDot className="bg-amber-500" />
          <span className="font-medium text-amber-600">Pending review</span>
        </>
      )}
      {!isLoading && isPublished && !isDeclined && !isPending && (
        <>
          <StatusDot className="bg-green-500" />
          <span className="font-medium text-green-600">Published</span>
          {slug && (
            <Link
              href={getWorkPath()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              target="_blank"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </>
      )}
      {!isLoading && !isPublished && (
        <>
          <span className="h-2 w-2 rounded-full border border-gray-400" aria-hidden />
          <span className="font-medium text-gray-500">Draft</span>
        </>
      )}
    </div>
  );
}
