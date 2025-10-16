'use client';

import { Suspense } from 'react';
import { FundPageContent } from '../components/FundPageContent';

export default function PreviouslyFundedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FundPageContent marketplaceTab="previously-funded" />
    </Suspense>
  );
}
