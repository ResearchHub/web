'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SignupPromoModal from '@/components/modals/SignupPromoModal';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { usePathname } from 'next/navigation';

export default function SignupModalContainer() {
  const [showModal, setShowModal] = useState(false);
  const { status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const modalDismissed = sessionStorage.getItem('signupModalDismissed') === 'true';

    if (status === 'unauthenticated' && !modalDismissed && pathname !== '/') {
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
