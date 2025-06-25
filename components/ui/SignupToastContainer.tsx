'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SignupToast from '@/components/ui/SignupToast';

export default function SignupToastContainer() {
  const [showToast, setShowToast] = useState(false);
  const { status } = useSession();

  useEffect(() => {
    const toastDismissed = sessionStorage.getItem('signupToastDismissed') === 'true';

    if (status === 'unauthenticated' && !toastDismissed) {
      const timer = setTimeout(() => {
        setShowToast(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowToast(false);
    }
  }, [status]);

  const handleCloseToast = () => {
    setShowToast(false);
    sessionStorage.setItem('signupToastDismissed', 'true');
  };

  if (!showToast) {
    return null;
  }

  return <SignupToast onClose={handleCloseToast} />;
}
