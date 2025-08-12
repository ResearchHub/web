'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SignupPromoModal from '@/components/modals/SignupPromoModal';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { usePathname } from 'next/navigation';

const EXCLUDED_PATHS = [
  '/', // landing page
  '/referral/join', // referral join page
  '/referral/join/apply-referral-code', // referral apply referral code page
  // add any other paths where we don't want the modal to show
];

export default function SignupModalContainer() {
  const [showModal, setShowModal] = useState(false);
  const { status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const modalDismissed = sessionStorage.getItem('signupModalDismissed') === 'true';
    const isExcludedPath = EXCLUDED_PATHS.some((path) => pathname.startsWith(path));

    if (status === 'unauthenticated' && !modalDismissed && pathname !== '/' && !isExcludedPath) {
      const timer = setTimeout(() => {
        setShowModal(true);
        AnalyticsService.logEvent(LogEvent.SIGNUP_PROMO_MODAL_OPENED);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowModal(false);
    }
  }, [status, pathname]);

  const handleCloseModal = () => {
    setShowModal(false);
    sessionStorage.setItem('signupModalDismissed', 'true');
    AnalyticsService.logEvent(LogEvent.SIGNUP_PROMO_MODAL_CLOSED);
  };

  if (!showModal) {
    return null;
  }

  return <SignupPromoModal onClose={handleCloseModal} />;
}
