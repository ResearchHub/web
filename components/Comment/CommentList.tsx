import React from 'react';
import { Comment, CommentType } from '@/types/comment';
import { CommentItem } from './CommentItem';
import { ContentType } from '@/types/work';

interface CommentListProps {
  comments: Comment[];
  parentComment?: Comment;
  isRootList?: boolean;
  contentType: ContentType;
  commentType?: CommentType;
}

const CommentList: React.FC<CommentListProps> = ({
  comments = [],
  parentComment,
  isRootList = false,
  contentType,
  commentType,
}) => {
  return (
    <div className="space-y-8">
      {comments.map((comment) => (
        <CommentItem
          commentType={commentType}
          key={`comment-${comment.id}`}
          comment={comment}
          contentType={contentType}
        />
      ))}
    </div>
  );
};

export default CommentList;
