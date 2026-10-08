'use client';

import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useUser } from '@/contexts/UserContext';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';

const SHARE_ANCHOR_ID = 'referral-share';

/**
 * Centralizes referral link construction, clipboard copy, and social-share
 * intents along with their analytics events, so the hero, top bar, and share
 * card all stay in sync and emit identical tracking.
 */
export function useReferralShare() {
  const { user: currentUser, isLoading, error } = useUser();
  const [isCopied, setIsCopied] = useState(false);

  const referralCode = currentUser?.referralCode;
  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://researchhub.com'}/referral/join?refr=${referralCode}`;

  const scrollToShare = useCallback(() => {
    const target = document.getElementById(SHARE_ANCHOR_ID);
    if (!target) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, []);

  const copyLink = useCallback(() => {
    // Until the user (and therefore the referral code) has loaded, guide the
    // user to the share section instead of copying a link with no code.
    if (!referralCode) {
      scrollToShare();
      return;
    }

    navigator.clipboard.writeText(referralLink).then(
      () => {
        setIsCopied(true);
        toast.success('Referral link copied to clipboard!');
        setTimeout(() => setIsCopied(false), 2000);
      },
      (err) => {
        console.error('Failed to copy text: ', err);
        toast.error('Failed to copy referral link.');
      }
    );

    AnalyticsService.logEvent(LogEvent.CLICKED_SHARE_VIA_URL, {
      action: 'USER_SHARED_REFERRAL',
      referralCode,
    });
  }, [referralCode, referralLink, scrollToShare]);

  const logQrCodeClick = useCallback(() => {
    AnalyticsService.logEvent(LogEvent.CLICKED_SHARE_VIA_QR_CODE, {
      action: 'USER_SHARED_REFERRAL',
      referralCode,
    });
  }, [referralCode]);

  const shareOnX = useCallback(() => {
    AnalyticsService.logEvent(LogEvent.CLICKED_SHARE_VIA_X, {
      action: 'USER_SHARED_REFERRAL',
      referralCode,
    });

    const text = `Fund breakthrough science with me on @ResearchHub!

Join with my link and we'll both receive a 10% bonus on every $RSC you donate over the next 6 months 💰🧪

`;
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      referralLink
    )}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }, [referralCode, referralLink]);

  const shareOnLinkedIn = useCallback(() => {
    AnalyticsService.logEvent(LogEvent.CLICKED_SHARE_VIA_LINKEDIN, {
      action: 'USER_SHARED_REFERRAL',
      referralCode,
    });

    const text = `Fund breakthrough science with me on ResearchHub!\n\nJoin with my link and we'll both receive a 10% bonus on every $RSC you donate over the next 6 months. Let's accelerate science together! 💰🧪\n\n${referralLink}`;
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }, [referralCode, referralLink]);

  const shareOnBlueSky = useCallback(() => {
    AnalyticsService.logEvent(LogEvent.CLICKED_SHARE_VIA_BLUESKY, {
      action: 'USER_SHARED_REFERRAL',
      referralCode,
    });

    const text = `Fund breakthrough science with me on ResearchHub! 

Join with my link and we'll both receive a 10% bonus on every $RSC you donate over the next 6 months 💰🧪

${referralLink}`;
    const url = `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }, [referralCode, referralLink]);

  return {
    currentUser,
    isLoading,
    error,
    referralCode,
    referralLink,
    isCopied,
    copyLink,
    scrollToShare,
    logQrCodeClick,
    shareOnX,
    shareOnLinkedIn,
    shareOnBlueSky,
  };
}
