'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ReturnHomeButton() {
  return (
    <Button variant="default" asChild>
      <Link href="/">Return Home</Link>
    </Button>
  );
}
