'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PageLayout } from '@/app/layouts/PageLayout';

const NotFoundPage = () => {
  return (
    <PageLayout rightSidebar={false}>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">Sorry, we couldn't find the page you're looking for.</p>
          <Button variant="default" asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFoundPage;
