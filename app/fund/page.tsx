'use client';

import { FundPageContent } from './components/FundPageContent';

// Default to needs-funding tab
export default function FundingPage() {
  return <FundPageContent marketplaceTab="needs-funding" />;
}
