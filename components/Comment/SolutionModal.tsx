import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/form/Modal';
import { CommentReadOnly } from './CommentReadOnly';
import { CommentService } from '@/services/comment.service';
import { Comment } from '@/types/comment';
import { ContentType } from '@/types/work';
import { ID } from '@/types/root';
import { Loader } from '@/components/ui/Loader';
import { formatTimestamp } from '@/utils/date';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Avatar } from '@/components/ui/Avatar';
import { CommentSkeleton } from '@/components/skeletons/CommentSkeleton';

interface SolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  commentId: ID;
  documentId: ID;
  contentType: ContentType;
  solutionAuthorName: string;
  awardedAmount?: string;
}

export const SolutionModal = ({
  isOpen,
  onClose,
  commentId,
  documentId,
  contentType,
  solutionAuthorName,
  awardedAmount,
}: SolutionModalProps) => {
  const [comment, setComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && commentId) {
      fetchSolutionComment();
    }
  }, [isOpen, commentId]);

  const fetchSolutionComment = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedComment = await CommentService.fetchComment({
        commentId,
        documentId,
        contentType,
      });
      setComment(fetchedComment);
    } catch (err) {
      console.error('Error fetching solution comment:', err);
      setError('Failed to load the solution. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Solution by ${solutionAuthorName}`}>
      <div className="space-y-6">
        {loading ? (
          <CommentSkeleton commentType="ANSWER" />
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : comment ? (
          <>
            {/* Solution metadata */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Avatar
                  src={comment.createdBy?.authorProfile?.profileImage || ''}
                  alt={comment.createdBy?.authorProfile?.fullName || ''}
                  size="sm"
                />
                <div>
                  <div className="font-medium">{comment.createdBy?.authorProfile?.fullName}</div>
                  <div className="text-sm text-gray-500">
                    Submitted on {formatTimestamp(comment.createdDate)}
                  </div>
                </div>
              </div>
              {awardedAmount && (
                <div className="flex items-center">
                  <CurrencyBadge
                    amount={parseFloat(awardedAmount)}
                    size="sm"
                    variant="award"
                    showExchangeRate={true}
                  />
                </div>
              )}
            </div>

            {/* Solution content */}
            <div className="pt-2">
              <CommentReadOnly
                content={comment.content}
                contentFormat={comment.contentFormat}
                debug={false}
              />
            </div>
          </>
        ) : (
          <div className="text-gray-500 text-center py-4">No content available</div>
        )}
      </div>
    </Modal>
  );
};
