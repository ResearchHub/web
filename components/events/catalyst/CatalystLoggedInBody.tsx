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
    signOut({ callbackUrl: route });
  };

  return (
    <div className={`box ${isMobile ? 'box--mobile' : 'box--desktop'}`}>
      <span className="check" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
          <path
            d="M20 6 9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <h1 className="title">
        Your {formatCredit(creditAmount)} {loggedIn.titleSuffix}
      </h1>

      <p className="review">{loggedIn.reviewNote}</p>

      <p className="eyebrow">{loggedIn.eyebrow}</p>
      <p className="email">{email}</p>
      <p className="email-note">{loggedIn.emailNote}</p>

      <div className="actions">
        <button className="btn btn--primary" type="button" onClick={() => router.push('/')}>
          {loggedIn.continueLabel}
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
        .check {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 9999px;
          margin-bottom: 18px;
        }
        .box--mobile .check {
          background: rgba(34, 197, 94, 0.16);
          color: #86efac;
        }
        .box--desktop .check {
          background: rgba(34, 197, 94, 0.12);
          color: #16a34a;
        }
        .title {
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.12;
        }
        .box--mobile .title {
          font-size: 32px;
          color: #fff;
          margin-bottom: 14px;
        }
        .box--desktop .title {
          font-size: 26px;
          color: #0c0720;
          margin: 4px 0 12px;
        }
        .review {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 26px;
        }
        .box--mobile .review {
          color: rgba(255, 255, 255, 0.8);
        }
        .box--desktop .review {
          color: #374151;
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
          font-size: 22px;
          color: #fff;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
        }
        .box--desktop .email {
          font-size: 20px;
          color: #0c0720;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
        }
        .email-note {
          font-size: 13px;
          line-height: 1.5;
          margin-top: 10px;
        }
        .box--mobile .email-note {
          color: rgba(255, 255, 255, 0.6);
        }
        .box--desktop .email-note {
          color: #6b7280;
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
          font-weight: 600;
          cursor: pointer;
          transition:
            background 0.15s,
            border-color 0.15s,
            color 0.15s;
        }
        .box--mobile .btn {
          height: 54px;
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
          font-size: 16px;
        }
        .box--mobile .btn--primary {
          box-shadow: 0 10px 26px -8px rgba(57, 113, 255, 0.7);
        }
        .btn--primary:hover {
          background: #2563eb;
        }
        .btn--secondary {
          background: transparent;
          font-size: 15px;
        }
        .box--mobile .btn--secondary {
          border: 1px solid rgba(255, 255, 255, 0.28);
          color: rgba(255, 255, 255, 0.9);
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
