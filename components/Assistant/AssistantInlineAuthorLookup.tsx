'use client';

import React from 'react';
import { AssistantInlineUserSearch } from './AssistantInlineUserSearch';

interface Props {
  onSubmit: (field: string, value: any, displayText: string) => void;
}

export const AssistantInlineAuthorLookup: React.FC<Props> = ({ onSubmit }) => (
  <AssistantInlineUserSearch
    label="Search for authors"
    fieldKey="author_ids"
    noun="co-author"
    emptyMessage="No authors found"
    onSubmit={onSubmit}
  />
);
