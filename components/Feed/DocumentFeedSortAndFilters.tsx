'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';

interface HomeFeedVariant {
  variant: 'home';
}

interface TopicFeedVariant {
  variant: 'topic';
  topicName: string;
}

type DocumentFeedSortAndFiltersProps = {
  className?: string;
} & (HomeFeedVariant | TopicFeedVariant);

export const DocumentFeedSortAndFilters: FC<DocumentFeedSortAndFiltersProps> = (props) => {
  const { className } = props;

  return (
    <div className={cn('text-sm text-gray-600', className)}>
      {props.variant === 'home' ? (
        <span>Your personalized research briefing.</span>
      ) : (
        <span>Your {props.topicName} Research Briefing.</span>
      )}
    </div>
  );
};
