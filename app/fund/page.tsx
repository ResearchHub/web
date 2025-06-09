'use client';

import { FundPageContent } from './components/FundPageContent';

// Show grants by default
export default function FundingPage() {
  return <FundPageContent marketplaceTab="grants" />;
}
