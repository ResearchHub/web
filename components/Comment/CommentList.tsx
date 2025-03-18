import React from 'react';
import { Comment } from '@/types/comment';
import { CommentItem } from './CommentItem';
import { ContentType } from '@/types/work';

interface CommentListProps {
  comments: Comment[];
  parentComment?: Comment;
  isRootList?: boolean;
  contentType: ContentType;
}

const CommentList: React.FC<CommentListProps> = ({
  comments = [],
  parentComment,
  isRootList = false,
  contentType,
}) => {
  return (
    <div className="space-y-8">
      {comments.map((comment) => (
        <CommentItem key={`comment-${comment.id}`} comment={comment} contentType={contentType} />
      ))}
    </div>
  );
};

export default CommentList;
