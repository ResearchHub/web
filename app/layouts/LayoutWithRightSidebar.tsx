'use client';

import { ReactNode } from 'react';
import { PageLayout } from './PageLayout';

export interface LayoutWithRightSidebarProps {
  /** Content to render in the right sidebar (desktop). */
  rightSidebar: ReactNode;
  /** Optional mobile-only menu shown above main content (e.g. dropdown for section nav). */
  mobileMenu?: ReactNode;
  className?: string;
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
}: LayoutWithRightSidebarProps) {
  return (
    <PageLayout rightSidebar={rightSidebar} className={className}>
      {mobileMenu != null && <div className="lg:!hidden w-full">{mobileMenu}</div>}
      <div className="w-full">{children}</div>
    </PageLayout>
  );
}
