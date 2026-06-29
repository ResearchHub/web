'use client';

import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { CatalystLockup } from './CatalystLockup';
import { CatalystLoggedInBody } from './CatalystLoggedInBody';

interface CatalystDesktopLoggedInProps {
  email: string;
}

export function CatalystDesktopLoggedIn({ email }: Readonly<CatalystDesktopLoggedInProps>) {
  const router = useRouter();

  return (
    <PageLayout rightSidebar={false}>
      <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
        <div className="card">
          <CatalystLockup theme="onLight" />
          <CatalystLoggedInBody
            email={email}
            variant="desktop"
            onContinue={() => router.push('/')}
            showFooter
          />
        </div>
      </div>

      <style jsx>{`
        .card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </PageLayout>
  );
}
