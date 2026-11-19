import React from 'react';
import { Comment, CommentType } from '@/types/comment';
import { CommentItem } from './CommentItem';
import { ContentType } from '@/types/work';
import type { CommentRowStyle } from './lib/commentRowStyle';

interface CommentListProps {
  comments: Comment[];
  parentComment?: Comment;
  isRootList?: boolean;
  contentType: ContentType;
  commentType?: CommentType;
  readOnly?: boolean;
  rowStyle?: CommentRowStyle;
}

const CommentList: React.FC<CommentListProps> = ({
  comments = [],
  parentComment,
  isRootList = false,
  contentType,
  commentType,
  readOnly = false,
  rowStyle = 'feed',
}) => {
  return (
    // Feed rows space themselves, with a hairline between threads.
    <div
      className={rowStyle === 'feed' ? undefined : 'space-y-8'}
      data-testid={isRootList ? 'comment-list' : undefined}
    >
      {comments.map((comment) => (
        <CommentItem
          commentType={commentType}
          key={`comment-${comment.id}`}
          comment={comment}
          contentType={contentType}
          readOnly={readOnly}
          rowStyle={rowStyle}
        />
      ))}
    </div>
  );
};

export default CommentList;
