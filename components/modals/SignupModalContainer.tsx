'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SignupModal from '@/components/modals/SignupModal';

export default function SignupModalContainer() {
  const [showModal, setShowModal] = useState(false);
  const { status } = useSession();

  useEffect(() => {
    const modalDismissed = sessionStorage.getItem('signupModalDismissed') === 'true';

    if (status === 'unauthenticated' && !modalDismissed) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowModal(false);
    }
  }, [status]);

  const handleCloseModal = () => {
    setShowModal(false);
    sessionStorage.setItem('signupModalDismissed', 'true');
  };

  if (!showModal) {
    return null;
  }

  return <SignupModal onClose={handleCloseModal} />;
}
