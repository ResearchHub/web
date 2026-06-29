'use client';

import { useRouter } from 'next/navigation';
import { CATALYST_NYC_EVENT, formatCredit } from './constants';
import { CatalystLockup } from './CatalystLockup';
import { CatalystScreenShell } from './CatalystScreenShell';

const { footer, loggedIn, contact, creditAmount } = CATALYST_NYC_EVENT;

interface CatalystLoggedInScreenProps {
  email: string;
}

export function CatalystLoggedInScreen({ email }: CatalystLoggedInScreenProps) {
  const router = useRouter();

  return (
    <CatalystScreenShell>
      <CatalystLockup />

      <div className="main">
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
      </div>

      <div className="foot">{footer}</div>

      <style jsx>{`
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .title {
          font-size: 38px;
          font-weight: 600;
          letter-spacing: -0.03em;
          text-align: left;
          line-height: 1.05;
          margin-bottom: 24px;
        }
        .body {
          font-size: 16px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.88);
          margin-bottom: 20px;
        }
        .body strong {
          color: #fff;
          font-weight: 600;
        }
        .help {
          font-size: 14px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.72);
          margin-bottom: 28px;
        }
        .help strong {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
        }
        .contact-link {
          color: #c8b6f2;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .contact-link:hover {
          color: #fff;
        }
        .contact-link:focus-visible {
          outline: 2px solid #c8b6f2;
          outline-offset: 2px;
          border-radius: 2px;
        }
        .cta {
          width: 100%;
          height: 56px;
          border: none;
          border-radius: 14px;
          background: #3971ff;
          color: #fff;
          font-family: inherit;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 10px 26px -8px rgba(57, 113, 255, 0.7);
          transition: background 0.15s;
        }
        .cta:hover {
          background: #2563eb;
        }
        .cta:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 2px;
        }
        .foot {
          text-align: center;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </CatalystScreenShell>
  );
}
