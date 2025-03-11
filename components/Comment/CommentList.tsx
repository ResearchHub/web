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
  debug?: boolean;
}

const CommentList: React.FC<CommentListProps> = ({
  comments = [],
  parentComment,
  isRootList = false,
  contentType,
  debug = false,
}) => {
  const { loading } = useComments();

  useEffect(() => {
    if (debug) {
      console.log('CommentList rendered with:', {
        commentsCount: comments.length,
        isRootList,
        parentComment: parentComment ? `ID: ${parentComment.id}` : 'none',
      });
    }
  }, [comments, debug, isRootList, parentComment]);

  return (
    <div className={isRootList ? 'root-list' : 'reply-list'}>
      {comments.map((comment) => (
        <div key={`comment-${comment.id}`} className="comment-item-wrapper">
          <CommentItem comment={comment} contentType={contentType} debug={debug} />

          {debug && (
            <div className="bg-yellow-100 p-2 text-xs border border-yellow-300 rounded mt-1 mb-2">
              <p>
                <strong>Debug:</strong> Comment ID: {comment.id}
              </p>
              <p>Children Count: {comment.childrenCount}</p>
              <p>Replies Loaded: {comment.replies.length}</p>
              <p>
                Should Show Load More:{' '}
                {comment.childrenCount > comment.replies.length ? 'Yes' : 'No'}
              </p>
            </div>
          )}
        </div>
      ))}

      {debug && parentComment && (
        <div className="bg-blue-100 p-2 text-xs border border-blue-300 rounded mt-1 mb-2">
          <p>
            <strong>Parent Debug:</strong> Comment ID: {parentComment.id}
          </p>
          <p>Children Count: {parentComment.childrenCount}</p>
          <p>Replies Loaded: {parentComment.replies.length}</p>
          <p>
            Should Show Load More:{' '}
            {parentComment.childrenCount > parentComment.replies.length ? 'Yes' : 'No'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentList;
