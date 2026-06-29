'use client';

import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { CATALYST_NYC_EVENT, formatCredit } from './constants';
import { CatalystLockup } from './CatalystLockup';

const { footer, loggedIn, contact, creditAmount } = CATALYST_NYC_EVENT;

interface CatalystDesktopLoggedInProps {
  email: string;
}

export function CatalystDesktopLoggedIn({ email }: CatalystDesktopLoggedInProps) {
  const router = useRouter();

  return (
    <PageLayout rightSidebar={false}>
      <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
        <div className="card">
          <CatalystLockup theme="onLight" />

          <h1 className="title">{loggedIn.title}</h1>

          <p className="body">
            You&apos;re signed in as <strong>{email}</strong>. {loggedIn.bodyPrefix} —{' '}
            {loggedIn.bodySuffix} {formatCredit(creditAmount)}.
          </p>

          <p className="help">
            {loggedIn.mismatchPrefix}{' '}
            <strong>
              {contact.name} ({contact.role})
            </strong>{' '}
            at{' '}
            <a href={`mailto:${contact.email}`} className="contact-link">
              {contact.email}
            </a>
            .
          </p>

          <button className="cta" type="button" onClick={() => router.push('/')}>
            {loggedIn.continueLabel}
          </button>

          <p className="foot">{footer}</p>
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
        .title {
          font-size: 32px;
          font-weight: 600;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin: 24px 0 16px;
          color: #0c0720;
        }
        .body {
          font-size: 16px;
          line-height: 1.5;
          color: #374151;
          margin-bottom: 16px;
        }
        .body strong {
          color: #111827;
          font-weight: 600;
        }
        .help {
          font-size: 14px;
          line-height: 1.5;
          color: #6b7280;
          margin-bottom: 24px;
        }
        .help strong {
          color: #374151;
          font-weight: 600;
        }
        .contact-link {
          color: #3971ff;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .contact-link:hover {
          color: #2563eb;
        }
        .cta {
          width: 100%;
          height: 48px;
          border: none;
          border-radius: 12px;
          background: #3971ff;
          color: #fff;
          font-family: inherit;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }
        .cta:hover {
          background: #2563eb;
        }
        .foot {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #9ca3af;
        }
      `}</style>
    </PageLayout>
  );
}
