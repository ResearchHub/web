'use client';

import React from 'react';
import { AssistantInlineUserSearch } from './AssistantInlineUserSearch';

interface Props {
  onSubmit: (field: string, value: any, displayText: string) => void;
}

export const AssistantInlineContactLookup: React.FC<Props> = ({ onSubmit }) => (
  <AssistantInlineUserSearch
    label="Search for a contact person"
    fieldKey="grant_contacts"
    noun="contact"
    emptyMessage="No users found"
    onSubmit={onSubmit}
  />
);
