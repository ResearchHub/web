'use client';

import { ReactNode } from 'react';
import { PageLayout } from './PageLayout';

export interface LayoutWithRightSidebarProps {
  /** Content to render in the right sidebar (desktop). */
  rightSidebar?: boolean | ReactNode;
  /** Optional mobile-only menu shown above main content (e.g. dropdown for section nav). */
  mobileMenu?: ReactNode;
  className?: string;
  wideContent?: boolean;
  children: ReactNode;
}

/**
 * PageLayout with a right sidebar and optional mobile menu.
 */
export function LayoutWithRightSidebar({
  children,
  rightSidebar,
  mobileMenu,
  className,
  wideContent,
}: LayoutWithRightSidebarProps) {
  return (
    <PageLayout rightSidebar={rightSidebar} className={className} wideContent={wideContent}>
      {mobileMenu != null && <div className="lg:!hidden w-full">{mobileMenu}</div>}
      <div className="w-full">{children}</div>
    </PageLayout>
  );
}
