'use client';

import { useRef, useEffect } from 'react';
import { Users, FlaskConical, List, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useReferralMetrics } from '@/hooks/useReferral';
import { ReferralImpactSkeleton } from './ReferralImpactSkeleton';

export function ReferralImpactSection() {
  const router = useRouter();
  const referredUsersRef = useRef<HTMLParagraphElement>(null);
  const amountFundedRef = useRef<HTMLParagraphElement>(null);
  const creditsEarnedRef = useRef<HTMLParagraphElement>(null);

  // Use the metrics hook
  const { metrics, isLoading, error } = useReferralMetrics();

  // Transform the metrics data
  const displayData = {
    referredUsersCount: metrics?.referralActivity.fundersInvited || 0,
    amountFundedByReferred: metrics?.networkFundingPower.breakdown.networkFunding || 0,
    creditsEarned: metrics?.yourFundingCredits.available || 0,
    creditsUsed: metrics?.yourFundingCredits.used || 0,
    totalEarned: metrics?.yourFundingCredits.totalEarned || 0,
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
            el.textContent = `$${Math.round(proxy.value).toLocaleString()}`;
          } else {
            el.textContent = Math.round(proxy.value).toString();
          }
        },
      });
    };
    console.log('test');
    const tl = gsap.timeline();
    tl.call(() => animateValue(referredUsersEl, displayData.referredUsersCount, false), [], 0.1)
      .call(() => animateValue(amountFundedEl, displayData.amountFundedByReferred, true), [], 0.2)
      .call(() => animateValue(creditsEarnedEl, displayData.creditsEarned, true), [], 0.3);
  }, [isLoading, displayData]);

  // Show skeleton while loading
  if (isLoading) {
    return <ReferralImpactSkeleton />;
  }

  // Show error state if there's an error
  if (error) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Referral Impact</h2>
        <div className="bg-red-50 p-6 rounded-xl text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading metrics</h3>
          <p className="text-gray-500 mb-6 px-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="default">
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Referral Impact</h2>
      <div className="bg-green-50 p-6 rounded-xl text-center mb-6">
        <p ref={creditsEarnedRef} className="text-3xl sm:!text-4xl font-bold text-green-600">
          ${displayData.creditsEarned.toLocaleString()}
        </p>
        <p className="text-gray-600 mt-2 text-lg">Referral Credits Available</p>
        <div className="mt-2">
          <Tooltip
            content={
              <>
                <p className="text-left mb-3 text-sm">
                  Credits earned must be used towards funding your own proposal or another proposal
                  on the platform.
                </p>
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-around">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/fund/needs-funding')}
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
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-sm text-gray-500 hover:text-gray-700 underline inline-block"
            >
              How can I use this?
            </a>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:!grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-xl text-center">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p ref={referredUsersRef} className="text-3xl font-bold text-blue-600">
            {displayData.referredUsersCount}
          </p>
          <p className="text-gray-600 mt-2">Users Referred</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl text-center">
          <FlaskConical className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p ref={amountFundedRef} className="text-3xl font-bold text-blue-600">
            ${displayData.amountFundedByReferred.toLocaleString()}
          </p>
          <p className="text-gray-600 mt-2">Funded by Your Referrals</p>
        </div>
      </div>
    </section>
  );
}
