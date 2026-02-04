'use client';

import { FundPageContent } from './components/FundPageContent';

// Show all funding items by default
export default function FundingPage() {
  return <FundPageContent marketplaceTab="all" />;
}
