'use client';

import { useRef, useEffect } from 'react';
import { Users, FlaskConical, List, Plus, AlertCircle, Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { PixelBackdrop } from '@/app/endowment/components/PixelBackdrop';
import { useReferralMetrics } from '@/hooks/useReferral';

function ImpactSkeleton() {
  return (
    <div className="referral-impact-grid" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="referral-impact-card referral-impact-skel">
          <div className="referral-impact-skel-icon" />
          <div className="referral-impact-skel-num" />
          <div className="referral-impact-skel-label" />
        </div>
      ))}
    </div>
  );
}

export function ReferralImpact() {
  const router = useRouter();
  const referredUsersRef = useRef<HTMLParagraphElement>(null);
  const amountFundedRef = useRef<HTMLParagraphElement>(null);
  const creditsEarnedRef = useRef<HTMLParagraphElement>(null);

  const { metrics, isLoading, error } = useReferralMetrics();

  const displayData = {
    referredUsersCount: metrics?.referralActivity.fundersInvited || 0,
    amountFundedByReferred: metrics?.networkFundingPower.breakdown.networkFunding || 0,
    creditsEarned: metrics?.yourFundingCredits.available || 0,
  };

  useEffect(() => {
    const referredUsersEl = referredUsersRef.current;
    const amountFundedEl = amountFundedRef.current;
    const creditsEarnedEl = creditsEarnedRef.current;

    if (!referredUsersEl || !amountFundedEl || !creditsEarnedEl || isLoading) return;

    const animateValue = (el: HTMLParagraphElement, endValue: number, isCurrency: boolean) => {
      const proxy = { value: 0 };
      gsap.to(proxy, {
        value: endValue,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          if (isCurrency) {
            el.textContent = `${Math.round(proxy.value).toLocaleString()} RSC`;
          } else {
            el.textContent = Math.round(proxy.value).toString();
          }
        },
      });
    };

    const tl = gsap.timeline();
    tl.call(() => animateValue(creditsEarnedEl, displayData.creditsEarned, true), [], 0.1)
      .call(() => animateValue(referredUsersEl, displayData.referredUsersCount, false), [], 0.2)
      .call(() => animateValue(amountFundedEl, displayData.amountFundedByReferred, true), [], 0.3);

    return () => {
      tl.kill();
    };
  }, [
    isLoading,
    displayData.creditsEarned,
    displayData.referredUsersCount,
    displayData.amountFundedByReferred,
  ]);

  return (
    <section className="referral-impact">
      <PixelBackdrop side="bottom-left" className="referral-impact-pixel" />
      <PixelBackdrop side="bottom-right" className="referral-impact-pixel" />

      <div className="referral-impact-inner">
        <div className="referral-impact-head">
          <h2 className="referral-impact-h2">
            Your referral <span className="referral-impact-accent">impact.</span>
          </h2>
          <p className="referral-impact-lead">
            Track the credits you have earned and the science your network has funded.
          </p>
        </div>

        {isLoading ? (
          <ImpactSkeleton />
        ) : error ? (
          <div className="referral-impact-error">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" aria-hidden />
            <h3>Couldn&apos;t load your metrics</h3>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} variant="default">
              Try again
            </Button>
          </div>
        ) : (
          <div className="referral-impact-grid">
            <div className="referral-impact-card referral-impact-card-feature">
              <div className="referral-impact-icon referral-impact-icon-green">
                <Coins className="h-6 w-6" aria-hidden />
              </div>
              <p ref={creditsEarnedRef} className="referral-impact-num referral-impact-num-green">
                {displayData.creditsEarned.toLocaleString()} RSC
              </p>
              <p className="referral-impact-label">Referral Credits Available</p>
              <Tooltip
                content={
                  <>
                    <p className="text-left mb-3 text-sm">
                      Credits earned must be used towards funding your own proposal or another
                      proposal on the platform.
                    </p>
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-around">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/fund/proposals')}
                      >
                        <List className="h-4 w-4 mr-2" />
                        <span>View proposals</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/notebook?newFunding=true')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        <span>Create proposal</span>
                      </Button>
                    </div>
                  </>
                }
                position="top"
                width="w-[320px]"
              >
                <a href="#" onClick={(e) => e.preventDefault()} className="referral-impact-help">
                  How can I use this?
                </a>
              </Tooltip>
            </div>

            <div className="referral-impact-card">
              <div className="referral-impact-icon">
                <Users className="h-6 w-6" aria-hidden />
              </div>
              <p ref={referredUsersRef} className="referral-impact-num">
                {displayData.referredUsersCount}
              </p>
              <p className="referral-impact-label">Funders Referred</p>
            </div>

            <div className="referral-impact-card">
              <div className="referral-impact-icon">
                <FlaskConical className="h-6 w-6" aria-hidden />
              </div>
              <p ref={amountFundedRef} className="referral-impact-num">
                {displayData.amountFundedByReferred.toLocaleString()} RSC
              </p>
              <p className="referral-impact-label">Funded by Your Referrals</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .referral-impact {
          position: relative;
          padding: 96px 28px;
          background:
            radial-gradient(ellipse 90% 60% at 50% 0%, rgba(57, 113, 255, 0.08), transparent 60%),
            linear-gradient(180deg, #eaf1ff 0%, #dce8ff 100%);
          overflow: hidden;
        }
        .referral-impact :global(.referral-impact-pixel) {
          z-index: 0;
          opacity: 0.4;
        }
        .referral-impact-inner {
          position: relative;
          z-index: 2;
          max-width: 1100px;
          margin: 0 auto;
        }
        .referral-impact-head {
          text-align: center;
          max-width: 720px;
          margin: 0 auto;
        }
        .referral-impact-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 52px;
          line-height: 1.08;
          letter-spacing: -0.024em;
          color: #0b1530;
          text-wrap: balance;
          margin: 0 0 18px;
        }
        .referral-impact-accent {
          color: #3971ff;
        }
        .referral-impact-lead {
          font-size: 19px;
          color: #4b5563;
          line-height: 1.6;
          margin: 0;
        }
        @media (max-width: 1100px) {
          .referral-impact-h2 {
            font-size: 38px;
          }
        }
        @media (max-width: 640px) {
          .referral-impact {
            padding: 64px 16px;
          }
          .referral-impact-h2 {
            font-size: 30px;
          }
          .referral-impact-lead {
            font-size: 16px;
          }
        }
      `}</style>
      <style jsx global>{`
        .referral-impact-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 48px;
        }
        .referral-impact-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: #ffffff;
          border: 1px solid #bfdbfe;
          border-radius: 20px;
          padding: 32px 24px;
          box-shadow: 0 18px 40px -24px rgba(13, 30, 80, 0.18);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }
        .referral-impact-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 26px 50px -22px rgba(57, 113, 255, 0.22);
          border-color: #93c5fd;
        }
        .referral-impact-card-feature {
          border-color: #a7f3d0;
          background: linear-gradient(180deg, #f0fdf8 0%, #ffffff 55%);
        }
        .referral-impact-card-feature:hover {
          border-color: #6ee7b7;
        }
        .referral-impact-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #eff4ff 0%, #dbeafe 100%);
          border: 1px solid #dbeafe;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #3971ff;
          margin-bottom: 16px;
        }
        .referral-impact-icon-green {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border-color: #a7f3d0;
          color: #16a34a;
        }
        .referral-impact-num {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 36px;
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #0b1530;
          margin: 0 0 6px;
        }
        .referral-impact-num-green {
          color: #16a34a;
        }
        .referral-impact-label {
          font-size: 15px;
          font-weight: 600;
          color: #4b5563;
          margin: 0;
        }
        .referral-impact-help {
          margin-top: 10px;
          font-size: 13px;
          color: #6b7280;
          text-decoration: underline;
          display: inline-block;
        }
        .referral-impact-help:hover {
          color: #3971ff;
        }
        .referral-impact-error {
          margin-top: 48px;
          background: #fff;
          border: 1px solid #fecaca;
          border-radius: 20px;
          padding: 40px 24px;
          text-align: center;
          box-shadow: 0 18px 40px -24px rgba(13, 30, 80, 0.18);
        }
        .referral-impact-error h3 {
          font-size: 18px;
          font-weight: 700;
          color: #0b1530;
          margin: 0 0 6px;
        }
        .referral-impact-error p {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 18px;
        }
        .referral-impact-skel {
          min-height: 168px;
          justify-content: center;
          gap: 12px;
        }
        .referral-impact-skel-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: #eef2f7;
          animation: referralImpactPulse 1.4s ease-in-out infinite;
        }
        .referral-impact-skel-num {
          width: 120px;
          height: 30px;
          border-radius: 8px;
          background: #eef2f7;
          animation: referralImpactPulse 1.4s ease-in-out infinite;
        }
        .referral-impact-skel-label {
          width: 150px;
          height: 16px;
          border-radius: 6px;
          background: #eef2f7;
          animation: referralImpactPulse 1.4s ease-in-out infinite;
        }
        @keyframes referralImpactPulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.55;
          }
        }
        @media (max-width: 900px) {
          .referral-impact-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            max-width: 460px;
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}</style>
    </section>
  );
}
