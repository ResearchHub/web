export function CommentSkeleton({
  commentType = 'GENERIC_COMMENT',
}: {
  commentType?: 'GENERIC_COMMENT' | 'REVIEW' | 'BOUNTY' | 'ANSWER' | 'AUTHOR_UPDATE';
}) {
  // For bounty type, render a different skeleton
  if (commentType === 'BOUNTY') {
    return (
      <div className="py-4">
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <div className="space-y-4">
            {/* Bounty header */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Bounty metadata grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Bounty details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For regular comments and reviews
  return (
    <div className="py-4">
      {/* Author info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div>
            {/* Name */}
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            {/* Date */}
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-1"></div>
          </div>
        </div>

        {/* Review score if review type */}
        {commentType === 'REVIEW' && (
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
        )}
      </div>

      {/* Comment content */}
      <div className="border border-gray-200 rounded-lg p-4 mb-4">
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Comment actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
