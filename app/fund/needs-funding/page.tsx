'use client';

import { Suspense } from 'react';
import { FundPageContent } from '../components/FundPageContent';

export default function NeedsFundingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FundPageContent marketplaceTab="needs-funding" />
    </Suspense>
  );
}
