import { Metadata } from 'next';
import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { Button } from '@/components/ui/Button';
import { buildOpenGraphMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Access Denied',
  description: 'You do not have permission to view this page.',
  url: '/403',
});

const ForbiddenPage = () => {
  return (
    <PageLayout rightSidebar={false}>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center px-4 max-w-lg">
          <LockKeyhole className="h-12 w-12 text-gray-400 mx-auto mb-5" />
          <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-8">You do not have permission to view this page.</p>
          <Button variant="outlined" asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default ForbiddenPage;
