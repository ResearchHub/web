import React from 'react';
import { CommentItem } from './CommentItem';
import { useComments } from '@/contexts/CommentContext';
import { ContentType } from '@/types/work';
import { FeedEntry } from '@/types/feed';
import { getCommentFromFeedEntry } from '@/utils/feedUtils';

interface CommentListProps {
  feedEntries: FeedEntry[];
  parentFeedEntry?: FeedEntry;
  isRootList?: boolean;
  contentType: ContentType;
}

const CommentList: React.FC<CommentListProps> = ({ feedEntries = [], contentType }) => {
  return (
    <div className="space-y-4">
      {feedEntries.map((entry) => {
        const comment = getCommentFromFeedEntry(entry);
        if (!comment) return null;

        return (
          <CommentItem key={`comment-${comment.id}`} feedEntry={entry} contentType={contentType} />
        );
      })}
    </div>
  );
};

export default CommentList;
