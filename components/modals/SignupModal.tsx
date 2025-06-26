'use client';

import { useEffect, useState } from 'react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import ShinyText from '@/components/ui/ShinyText/ShinyText';
import { Button } from '@/components/ui/Button';
import Icon from '@/components/ui/icons/Icon';
import { Logo } from '@/components/ui/Logo';

interface SignupModalProps {
  onClose: () => void;
}

export default function SignupModal({ onClose }: SignupModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isHeadingAnimationComplete, setIsHeadingAnimationComplete] = useState(false);
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes modalFadeIn {
        0% { opacity: 0; transform: scale(0.95); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes modalFadeOut {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.95); }
      }
      @keyframes borderGlow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .signup-modal-border {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        padding: 5px;
        background: linear-gradient(90deg, #FF4D8D, #6C63FF, #3B82F6, #FFCC00, #FF4D8D, #6C63FF, #3B82F6);
        background-size: 200% auto;
        animation: borderGlow 4s linear infinite;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      .signup-modal-content-wrapper {
        background-color: #fff;
        border-radius: 10px;
        overflow: hidden;
        width: 100%;
      }
    `;
    document.head.appendChild(style);

    const visibilityTimer = setTimeout(() => setIsVisible(true), 100);

    return () => {
      document.head.removeChild(style);
      clearTimeout(visibilityTimer);
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleSignupClick = () => {
    executeAuthenticatedAction(() => {
      console.log('User authenticated');
    });
    handleClose();
  };

  const shinyTextAnimationConfig = {
    speed: 0.8,
    wordAnimationDuration: 0.8,
    wordStaggerDelay: 0.1,
  };

  const benefitItemStyle = {
    opacity: isHeadingAnimationComplete ? 1 : 0,
    animation: isHeadingAnimationComplete ? `fadeInUp 0.5s ease-out forwards` : 'none',
  };

  const contributors = [
    { src: '/people/maulik.jpeg', alt: 'Maulik Dhandha' },
    { src: '/people/emilio.jpeg', alt: 'Emilio Merheb' },
    { src: '/people/dominikus_brian.jpeg', alt: 'Dominikus Brian' },
    { src: '/people/jeffrey_koury.jpeg', alt: 'Jeffrey Koury' },
    { src: '/people/blob_48esqmw.jpeg', alt: 'User avatar' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-[9999] flex items-center justify-center p-4"
      style={{
        animation: isClosing
          ? 'modalFadeOut 0.3s ease-out forwards'
          : isVisible
            ? 'modalFadeIn 0.3s ease-out forwards'
            : 'none',
        opacity: isVisible ? 1 : 0,
      }}
      onClick={handleClose}
    >
      <div className="signup-modal-border w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="signup-modal-content-wrapper">
          <div className="p-8 md:p-12 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none transition-colors duration-200"
            >
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="text-center">
              <Logo className="mx-auto mb-8" />
              <ShinyText
                text="Unlock Your Impact on Science"
                className="text-3xl font-bold text-gray-900 leading-tight"
                onAnimationComplete={() => setIsHeadingAnimationComplete(true)}
                {...shinyTextAnimationConfig}
              />
              <p
                className="text-gray-600 mt-3 text-lg max-w-md mx-auto"
                style={{ ...benefitItemStyle, animationDelay: '0.2s' }}
              >
                Join thousands of researchers, funders, and citizen scientists collaborating at the
                edge of science.
              </p>
            </div>

            <div className="my-8" style={{ ...benefitItemStyle, animationDelay: '0.4s' }}>
              <hr className="w-1/2 mx-auto" />
            </div>

            <div className="space-y-6 mt-8 text-left">
              <div
                className="flex items-start"
                style={{ ...benefitItemStyle, animationDelay: '0.6s' }}
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                  <Icon name="fund" size={28} color="black" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-800">Fund & Be Funded</h3>
                  <p className="text-gray-600 text-sm">
                    Support novel ideas or secure funding for your own research projects.
                  </p>
                </div>
              </div>
              <div
                className="flex items-start"
                style={{ ...benefitItemStyle, animationDelay: '0.8s' }}
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                  <Icon name="earn1" size={28} color="black" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-800 text-md">Earn Rewards</h3>
                  <p className="text-gray-600 text-sm">Earn $150 for every paper you review.</p>
                </div>
              </div>
              <div
                className="flex items-start"
                style={{ ...benefitItemStyle, animationDelay: '1.0s' }}
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                  <Icon name="rhJournal2" size={28} color="black" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-800 text-md">Publish</h3>
                  <p className="text-gray-600 text-sm">
                    Publish your work in the RH Journal to reach a global audience.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10" style={{ ...benefitItemStyle, animationDelay: '1.2s' }}>
              <Button onClick={handleSignupClick} size="lg" className="w-full">
                Create Account
              </Button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Already have an account?{' '}
                <a
                  href="#"
                  onClick={handleSignupClick}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Log in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
