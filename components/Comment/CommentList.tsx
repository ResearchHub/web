import React, { useEffect } from 'react';
import { Comment } from '@/types/comment';
import { CommentItem } from './CommentItem';
import { useComments } from '@/contexts/CommentContext';
import { ContentType } from '@/types/work';

interface CommentListProps {
  comments: Comment[];
  parentComment?: Comment;
  isRootList?: boolean;
  contentType: ContentType;
  renderCommentActions?: boolean;
  debug?: boolean;
}

const CommentList: React.FC<CommentListProps> = ({
  comments = [],
  parentComment,
  isRootList = false,
  contentType,
  renderCommentActions = true,
  debug = false,
}) => {
  const { loading } = useComments();

  useEffect(() => {
    if (debug) {
      console.log('CommentList rendered with:', {
        commentsCount: comments.length,
        isRootList,
        parentCommentId: parentComment?.id,
      });
    }
  }, [comments.length, isRootList, parentComment?.id, debug]);

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={`comment-${comment.id}`}
          comment={comment}
          contentType={contentType}
          renderCommentActions={renderCommentActions}
          debug={debug}
        />
      ))}
    </div>
  );
};

export default CommentList;
