import { useState } from 'react';
import { Comment, CommentFilter } from '@/types/comment';
import { convertDeltaToHTML } from '@/lib/convertDeltaToHTML';
import { Coins, CheckCircle } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { CommentEditor } from './CommentEditor';
import { ContentType } from '@/types/work';
import { CommentService } from '@/services/comment.service';

interface CommentFeedProps {
  documentId: number;
  contentType: ContentType;
  className?: string;
}

const CommentItem = ({ comment }: { comment: Comment }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {/* Author Info */}
      <div className="flex items-center gap-2 mb-2">
        <img
          src={comment.author.profileImage || '/default-avatar.png'}
          alt={comment.author.fullName}
          className="w-8 h-8 rounded-full"
        />
        <div>
          <a href={comment.author.profileUrl} className="font-medium hover:text-indigo-600">
            {comment.author.fullName}
          </a>
          <div className="text-sm text-gray-500">
            {new Date(comment.createdDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Bounties */}
      {comment.bounties.length > 0 && (
        <div className="mb-4">
          {comment.bounties.map((bounty) => (
            <div
              key={bounty.id}
              className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2"
            >
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-900">
                  {parseFloat(bounty.amount).toFixed(0)} RSC Bounty
                </span>
                <span className="text-orange-700 text-sm">
                  · Expires {new Date(bounty.expirationDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Content */}
      {comment.contentFormat === 'QUILL' ? (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html: convertDeltaToHTML(
              typeof comment.content === 'string' ? { ops: [] } : comment.content
            ),
          }}
        />
      ) : (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: comment.content as string }}
        />
      )}

      {/* Comment Metadata */}
      <div className="mt-2 text-sm text-gray-500 flex items-center gap-4">
        <span>Score: {comment.score}</span>
        {comment.replyCount > 0 && (
          <span>
            · {comment.replyCount} repl{comment.replyCount === 1 ? 'y' : 'ies'}
          </span>
        )}
        {comment.isAcceptedAnswer && (
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Accepted Answer
          </span>
        )}
      </div>

      {/* Recursive Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 ml-8 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentFeed = ({ documentId, contentType, className }: CommentFeedProps) => {
  const [commentFilter, setCommentFilter] = useState<CommentFilter>('DISCUSSION');

  const {
    comments,
    count: commentCount,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  } = useComments({
    documentId,
    contentType,
    filter: commentFilter,
  });

  const handleSubmit = async (content: string) => {
    await CommentService.createComment({
      workId: documentId,
      contentType,
      content,
      contentFormat: 'HTML',
    });
    refresh();
  };
  console.log(comments);
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <select
            className="rounded-md border border-gray-300 py-1 px-2"
            value={commentFilter}
            onChange={(e) => setCommentFilter(e.target.value as CommentFilter)}
          >
            <option value="DISCUSSION">Discussion</option>
            <option value="QUESTION">Questions</option>
            <option value="PEER_REVIEW">Peer Reviews</option>
            <option value="BOUNTY">Bounties</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          {commentCount} comment{commentCount !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-4">
        <CommentEditor onSubmit={handleSubmit} />

        {error && (
          <div className="text-red-600 p-4 rounded-md bg-red-50">
            Failed to load comments. Please try again.
          </div>
        )}

        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}

        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-pulse">Loading comments...</div>
          </div>
        )}

        {hasMore && !isLoading && (
          <button
            onClick={loadMore}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Load more comments
          </button>
        )}
      </div>
    </div>
  );
};
