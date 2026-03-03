'use client';

import { ReactNode } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';

interface FeedLayoutProps {
  children: ReactNode;
}

export default function FeedLayout({ children }: FeedLayoutProps) {
  return <PageLayout>{children}</PageLayout>;
}
