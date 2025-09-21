import React from 'react';
import { Comment, CommentType } from '@/types/comment';
import { CommentItem } from './CommentItem';
import { ContentType } from '@/types/work';
import { AgentLoadingPlaceholder } from './AgentLoadingPlaceholder';

interface CommentListProps {
  comments: Comment[];
  parentComment?: Comment;
  isRootList?: boolean;
  contentType: ContentType;
  commentType?: CommentType;
  // Optional loading UI under a specific comment id
  loadingParentId?: number | null;
  loadingFields?: string[];
  onLoadingDone?: () => void;
}

const CommentList: React.FC<CommentListProps> = ({
  comments = [],
  parentComment,
  isRootList = false,
  contentType,
  commentType,
  loadingParentId,
  loadingFields = [],
  onLoadingDone,
}) => {
  return (
    <div className="space-y-8">
      {comments.map((comment) => (
        <div key={`comment-${comment.id}`}>
          <CommentItem commentType={commentType} comment={comment} contentType={contentType} />
          {loadingParentId === comment.id && (
            <div className="mt-3">
              <AgentLoadingPlaceholder fields={loadingFields} onDone={onLoadingDone} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;
