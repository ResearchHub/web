'use client';

import React from 'react';
import type { InputType } from '@/types/assistant';
import { AssistantInlineAuthorLookup } from './AssistantInlineAuthorLookup';
import { AssistantInlineTopicSelector } from './AssistantInlineTopicSelector';
import { AssistantInlineNonprofitLookup } from './AssistantInlineNonprofitLookup';
import { AssistantInlineContactLookup } from './AssistantInlineContactLookup';
import { AssistantInlineFinalReview } from './AssistantInlineFinalReview';

interface AssistantInlineComponentProps {
  inputType: InputType;
  onSubmit: (field: string, value: any, displayText: string) => void;
}

export const AssistantInlineComponent: React.FC<AssistantInlineComponentProps> = ({
  inputType,
  onSubmit,
}) => {
  if (!inputType) return null;

  switch (inputType) {
    case 'author_lookup':
      return <AssistantInlineAuthorLookup onSubmit={onSubmit} />;
    case 'topic_select':
      return <AssistantInlineTopicSelector onSubmit={onSubmit} />;
    case 'nonprofit_lookup':
      return <AssistantInlineNonprofitLookup onSubmit={onSubmit} />;
    case 'contact_lookup':
      return <AssistantInlineContactLookup onSubmit={onSubmit} />;
    case 'final_review':
      return <AssistantInlineFinalReview onSubmit={onSubmit} />;
    default:
      return null;
  }
};
