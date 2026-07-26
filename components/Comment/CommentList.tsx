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
  readOnly?: boolean;
}

const CommentList: React.FC<CommentListProps> = ({
  comments = [],
  parentComment,
  isRootList = false,
  contentType,
  commentType,
  readOnly = false,
}) => {
  return (
    <div className="space-y-8">
      {comments.map((comment) => (
        <CommentItem
          commentType={commentType}
          key={`comment-${comment.id}`}
          comment={comment}
          contentType={contentType}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
};

export default CommentList;
