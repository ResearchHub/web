'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PageLayout } from '@/app/layouts/PageLayout';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    // Log the error to your error reporting service
    console.error(error);
  }, [error]);

  return (
    <PageLayout rightSidebar={false}>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-8">
            We apologize for the inconvenience. Our team has been notified and is working to fix the
            issue.
          </p>
          <div className="space-x-4">
            <Button onClick={reset}>Try Again</Button>
            <Button variant="outlined" asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ErrorPage;
