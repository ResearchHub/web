'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import AnalyticsService from '@/services/analytics.service';
import { AuthSharingService } from '@/services/auth-sharing.service';
import { CATALYST_NYC_EVENT, formatCredit } from './constants';

const { footer, loggedIn, creditAmount, route } = CATALYST_NYC_EVENT;

interface CatalystLoggedInBodyProps {
  email: string;
  variant: 'mobile' | 'desktop';
  showFooter?: boolean;
}

export function CatalystLoggedInBody({
  email,
  variant,
  showFooter = false,
}: Readonly<CatalystLoggedInBodyProps>) {
  const router = useRouter();
  const isMobile = variant === 'mobile';

  // Sign out across both RH apps, then return here so the attendee can re-auth with the correct email.
  const handleSignOut = () => {
    AuthSharingService.removeSharedAuthToken();
    AnalyticsService.clearUserSession();
    void signOut({ callbackUrl: route });
  };

  return (
    <div className={`box ${isMobile ? 'box--mobile' : 'box--desktop'}`}>
      <h1 className="title">{loggedIn.title}</h1>

      <p className="eyebrow">{loggedIn.eyebrow}</p>
      <p className="email">{email}</p>
      <p className="sub">
        {loggedIn.subtext} <strong>{formatCredit(creditAmount)}</strong>.
      </p>

      <div className="actions">
        <button className="btn btn--primary" type="button" onClick={() => router.push('/')}>
          {loggedIn.confirmLabel}
        </button>
        <button className="btn btn--secondary" type="button" onClick={handleSignOut}>
          {loggedIn.signOutLabel}
        </button>
      </div>

      {showFooter && <p className="foot">{footer}</p>}

      <style jsx>{`
        .box {
          width: 100%;
          text-align: left;
        }
        .title {
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.12;
        }
        .box--mobile .title {
          font-size: 30px;
          color: #fff;
          margin-bottom: 24px;
        }
        .box--desktop .title {
          font-size: 24px;
          color: #0c0720;
          margin: 20px 0 18px;
        }
        .eyebrow {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .box--mobile .eyebrow {
          color: rgba(255, 255, 255, 0.55);
        }
        .box--desktop .eyebrow {
          color: #6b7280;
        }
        .email {
          font-weight: 600;
          letter-spacing: -0.01em;
          overflow-wrap: anywhere;
          border-radius: 14px;
          padding: 16px 18px;
        }
        .box--mobile .email {
          font-size: 24px;
          color: #fff;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
        }
        .box--desktop .email {
          font-size: 22px;
          color: #0c0720;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
        }
        .sub {
          font-size: 15px;
          line-height: 1.5;
          margin-top: 14px;
        }
        .box--mobile .sub {
          color: rgba(255, 255, 255, 0.72);
        }
        .box--mobile .sub strong {
          color: #fff;
          font-weight: 600;
        }
        .box--desktop .sub {
          color: #4b5563;
        }
        .box--desktop .sub strong {
          color: #111827;
          font-weight: 600;
        }
        .actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 28px;
        }
        .btn {
          width: 100%;
          font-family: inherit;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition:
            background 0.15s,
            border-color 0.15s,
            color 0.15s;
        }
        .box--mobile .btn {
          height: 56px;
          border-radius: 14px;
        }
        .box--desktop .btn {
          height: 48px;
          border-radius: 12px;
        }
        .btn--primary {
          border: none;
          background: #3971ff;
          color: #fff;
        }
        .box--mobile .btn--primary {
          box-shadow: 0 10px 26px -8px rgba(57, 113, 255, 0.7);
        }
        .btn--primary:hover {
          background: #2563eb;
        }
        .btn--secondary {
          background: transparent;
        }
        .box--mobile .btn--secondary {
          border: 1px solid rgba(255, 255, 255, 0.28);
          color: #fff;
        }
        .box--mobile .btn--secondary:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .box--desktop .btn--secondary {
          border: 1px solid #d1d5db;
          color: #374151;
        }
        .box--desktop .btn--secondary:hover {
          background: #f9fafb;
        }
        .btn:focus-visible {
          outline: 2px solid;
          outline-offset: 2px;
        }
        .box--mobile .btn:focus-visible {
          outline-color: #fff;
        }
        .box--desktop .btn:focus-visible {
          outline-color: #3971ff;
        }
        .foot {
          text-align: center;
          font-size: 12px;
          margin-top: 20px;
        }
        .box--mobile .foot {
          color: rgba(255, 255, 255, 0.5);
        }
        .box--desktop .foot {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
