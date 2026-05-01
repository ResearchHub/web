'use client';

import { Suspense } from 'react';
import { TopBar } from '@/app/layouts/TopBar';

export function EndowmentTopBar() {
  return (
    <div className="sticky top-0 z-50 bg-white">
      <Suspense
        fallback={<div className="h-[70px] border-b border-gray-200 bg-gray-50 animate-pulse" />}
      >
        <TopBar onMenuClick={() => {}} />
      </Suspense>
    </div>
  );
}
