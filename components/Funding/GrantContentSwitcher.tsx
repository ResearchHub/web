'use client';

import { ReactNode } from 'react';
import { useGrantTab } from '@/components/Funding/GrantPageContent';
import { GrantDetailsInline } from '@/components/Funding/GrantDetailsInline';

interface GrantContentSwitcherProps {
  children: ReactNode;
  content?: string;
  imageUrl?: string;
  hasDescription: boolean;
  grantId?: number | string;
}

export function GrantContentSwitcher({
  children,
  content,
  imageUrl,
  hasDescription,
  grantId,
}: GrantContentSwitcherProps) {
  const { activeTab } = useGrantTab();

  return (
    <>
      <div className={activeTab !== 'proposals' ? 'hidden' : undefined}>{children}</div>
      <div className={activeTab !== 'details' ? 'hidden' : undefined}>
        <GrantDetailsInline content={content} imageUrl={imageUrl} />
      </div>
    </>
  );
}
