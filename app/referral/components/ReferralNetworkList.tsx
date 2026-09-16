'use client';

import { Users, ChevronLeft, ChevronRight, Share2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Tooltip } from '@/components/ui/Tooltip';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { useReferralNetworkDetails } from '@/hooks/useReferral';

const USERS_PER_PAGE = 5;

// Days remaining before a referred user's bonus window closes; drives the
// "expiring soon" warning and the expired styling.
const getDaysUntilExpiration = (expirationDate: string): number => {
  const now = new Date();
  const diffTime = new Date(expirationDate).getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const scrollToShare = () => {
  const target = document.getElementById('referral-share');
  if (!target) return;
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  });
};

function NetworkSkeleton() {
  return (
    <div className="referral-net-card" aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="referral-net-row">
          <div className="referral-net-skel-avatar" />
          <div className="referral-net-skel-info">
            <div className="referral-net-skel-name" />
            <div className="referral-net-skel-sub" />
          </div>
          <div className="referral-net-skel-stats">
            <div className="referral-net-skel-stat" />
            <div className="referral-net-skel-stat" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReferralNetworkList() {
  const {
    networkDetails,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToNextPage,
    goToPrevPage,
  } = useReferralNetworkDetails(USERS_PER_PAGE);

  const displayUsers = networkDetails.map((user) => {
    const daysUntilExpiration = getDaysUntilExpiration(user.referralBonusExpirationDate);

    return {
      name: user.fullName,
      avatarUrl: user.profileImage,
      totalFunded: user.totalFunded,
      creditsEarned: user.referralBonusEarned,
      dateJoined: new Date(user.signupDate).toLocaleDateString(),
      authorId: user.authorId,
      isExpired: user.isReferralBonusExpired,
      daysUntilExpiration,
      expirationDate: new Date(user.referralBonusExpirationDate).toLocaleDateString(),
    };
  });

  return (
    <section className="referral-net">
      <div className="referral-net-inner">
        <div className="referral-net-head">
          <h2 className="referral-net-h2">
            Your referred <span className="referral-net-accent">network.</span>
          </h2>
          <p className="referral-net-lead">
            The funders who joined through your link and the science they have backed.
          </p>
        </div>

        {isLoading ? (
          <NetworkSkeleton />
        ) : error ? (
          <div className="referral-net-state">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden />
            <h3>Couldn&apos;t load your network</h3>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} variant="default">
              Try again
            </Button>
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="referral-net-state">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden />
            <h3>No referred funders yet</h3>
            <p>Share your referral link to start building your network and earning credits.</p>
            <Button onClick={scrollToShare} variant="default">
              <Share2 className="h-4 w-4 mr-2" />
              Share your link
            </Button>
          </div>
        ) : (
          <>
            <div className="referral-net-card">
              {displayUsers.map((user, index) => (
                <div
                  key={index}
                  className={`referral-net-row${user.isExpired ? ' referral-net-row-expired' : ''}`}
                >
                  <AuthorTooltip authorId={user.authorId}>
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.name}
                      size="md"
                      authorId={user.authorId}
                      className={user.isExpired ? 'grayscale' : ''}
                    />
                  </AuthorTooltip>

                  <div className="referral-net-info">
                    <div className="referral-net-name-row">
                      <span className="referral-net-name">{user.name}</span>
                      {user.isExpired ? (
                        <Tooltip
                          content={
                            <div className="text-center">
                              <p className="font-medium mb-1">Referral Expired</p>
                              <p className="text-xs">Benefits expired on {user.expirationDate}</p>
                              <p className="text-xs mt-1">No new credits will be earned</p>
                            </div>
                          }
                          position="top"
                          width="w-48"
                        >
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </Tooltip>
                      ) : user.daysUntilExpiration <= 30 ? (
                        <Tooltip
                          content={
                            <div className="text-center">
                              <p className="font-medium mb-1">Expiring Soon</p>
                              <p className="text-xs">
                                {user.daysUntilExpiration} days until expiration
                              </p>
                              <p className="text-xs">Expires: {user.expirationDate}</p>
                              <p className="text-xs mt-1">Credits will stop after expiration</p>
                            </div>
                          }
                          position="top"
                          width="w-48"
                        >
                          <Clock className="h-4 w-4 text-yellow-500" />
                        </Tooltip>
                      ) : null}
                    </div>
                    <span className="referral-net-joined">Joined {user.dateJoined}</span>
                    {!user.isExpired && user.daysUntilExpiration <= 30 && (
                      <span className="referral-net-expiring">
                        Expires in {user.daysUntilExpiration} days
                      </span>
                    )}
                  </div>

                  <div className="referral-net-stats">
                    <div className="referral-net-stat">
                      <span className="referral-net-stat-label">Total Funded</span>
                      <span
                        className={`referral-net-stat-val${
                          user.isExpired ? ' referral-net-stat-muted' : ' referral-net-stat-green'
                        }`}
                      >
                        {user.totalFunded.toLocaleString()} RSC
                      </span>
                    </div>
                    <div className="referral-net-stat">
                      <span className="referral-net-stat-label">Credits Earned</span>
                      <span
                        className={`referral-net-stat-val${
                          user.isExpired ? ' referral-net-stat-muted' : ' referral-net-stat-blue'
                        }`}
                      >
                        {user.creditsEarned.toLocaleString()} RSC
                      </span>
                      {user.isExpired && <span className="referral-net-final">(Final amount)</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="referral-net-pagination">
                <Button onClick={goToPrevPage} disabled={!hasPrevPage} variant="outlined" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <span className="referral-net-pageinfo">
                  Page {currentPage} of {totalPages}
                </span>
                <Button onClick={goToNextPage} disabled={!hasNextPage} variant="outlined" size="sm">
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .referral-net {
          padding: 96px 28px;
          background: #fff;
        }
        .referral-net-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .referral-net-head {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 48px;
        }
        .referral-net-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 52px;
          line-height: 1.08;
          letter-spacing: -0.024em;
          color: #0b1530;
          text-wrap: balance;
          margin: 0 0 18px;
        }
        .referral-net-accent {
          background: linear-gradient(90deg, #3971ff, #4a7fff, #5b8dff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .referral-net-lead {
          font-size: 19px;
          color: #4b5563;
          line-height: 1.6;
          margin: 0;
        }
        @media (max-width: 1100px) {
          .referral-net-h2 {
            font-size: 38px;
          }
        }
        @media (max-width: 640px) {
          .referral-net {
            padding: 64px 16px;
          }
          .referral-net-h2 {
            font-size: 30px;
          }
          .referral-net-lead {
            font-size: 16px;
          }
        }
      `}</style>
      <style jsx global>{`
        .referral-net-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 8px 24px;
          box-shadow: 0 18px 40px -24px rgba(13, 30, 80, 0.15);
        }
        .referral-net-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 0;
        }
        .referral-net-row + .referral-net-row {
          border-top: 1px solid #f1f5f9;
        }
        .referral-net-row-expired {
          opacity: 0.55;
        }
        .referral-net-info {
          flex: 1 1 auto;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .referral-net-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .referral-net-name {
          font-size: 16px;
          font-weight: 700;
          color: #0b1530;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .referral-net-joined {
          font-size: 13px;
          color: #6b7280;
        }
        .referral-net-expiring {
          font-size: 12px;
          font-weight: 600;
          color: #ca8a04;
        }
        .referral-net-stats {
          display: flex;
          gap: 32px;
          flex-shrink: 0;
        }
        .referral-net-stat {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
        }
        .referral-net-stat-label {
          font-size: 12px;
          color: #6b7280;
        }
        .referral-net-stat-val {
          font-size: 15px;
          font-weight: 700;
        }
        .referral-net-stat-green {
          color: #16a34a;
        }
        .referral-net-stat-blue {
          color: #3971ff;
        }
        .referral-net-stat-muted {
          color: #9ca3af;
        }
        .referral-net-final {
          font-size: 11px;
          color: #9ca3af;
        }
        .referral-net-pagination {
          margin-top: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .referral-net-pageinfo {
          font-size: 14px;
          color: #4b5563;
        }
        .referral-net-state {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 56px 24px;
          text-align: center;
          box-shadow: 0 18px 40px -24px rgba(13, 30, 80, 0.15);
        }
        .referral-net-state h3 {
          font-size: 18px;
          font-weight: 700;
          color: #0b1530;
          margin: 0 0 6px;
        }
        .referral-net-state p {
          font-size: 14px;
          color: #6b7280;
          margin: 0 auto 18px;
          max-width: 380px;
        }
        .referral-net-skel-avatar {
          width: 48px;
          height: 48px;
          border-radius: 9999px;
          background: #eef2f7;
          animation: referralNetPulse 1.4s ease-in-out infinite;
          flex-shrink: 0;
        }
        .referral-net-skel-info {
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .referral-net-skel-name {
          width: 160px;
          height: 16px;
          border-radius: 6px;
          background: #eef2f7;
          animation: referralNetPulse 1.4s ease-in-out infinite;
        }
        .referral-net-skel-sub {
          width: 110px;
          height: 12px;
          border-radius: 6px;
          background: #eef2f7;
          animation: referralNetPulse 1.4s ease-in-out infinite;
        }
        .referral-net-skel-stats {
          display: flex;
          gap: 32px;
        }
        .referral-net-skel-stat {
          width: 80px;
          height: 32px;
          border-radius: 8px;
          background: #eef2f7;
          animation: referralNetPulse 1.4s ease-in-out infinite;
        }
        @keyframes referralNetPulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.55;
          }
        }
        @media (max-width: 640px) {
          .referral-net-row {
            flex-wrap: wrap;
          }
          .referral-net-stats {
            width: 100%;
            justify-content: space-between;
            gap: 16px;
            padding-left: 64px;
          }
          .referral-net-skel-stats {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
