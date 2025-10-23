'use client';

import { Suspense } from 'react';
import { FundPageContent } from '../components/FundPageContent';

export default function GrantsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FundPageContent marketplaceTab="grants" />
    </Suspense>
  );
}
