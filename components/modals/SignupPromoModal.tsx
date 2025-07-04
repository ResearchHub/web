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

export default function SignupPromoModal({ onClose }: SignupModalProps) {
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
        padding: 3px;
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
        max-height: 90vh;
        overflow-y: auto;
      }
      @media (max-width: 768px) {
        .signup-modal-border {
          padding: 2px;
          margin: 8px;
        }
        .signup-modal-content-wrapper {
          max-height: 85vh;
        }
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
      className="fixed inset-0 bg-black !bg-opacity-25 z-[9999] flex items-center justify-center p-2 sm:!p-4"
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
          <div className="p-4 sm:!p-6 md:!p-8 lg:!p-12 relative">
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 sm:top-4 sm:!right-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none transition-colors duration-200 z-10"
            >
              <svg
                className="h-4 w-4 sm:!h-5 sm:!w-5 text-gray-500"
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
              <Logo className="mx-auto mb-4 sm:!mb-8 w-32 sm:!w-40 md:!w-auto" />
              <ShinyText
                text="Unlock Your Impact on Science"
                className="text-xl sm:!text-2xl md:!text-3xl font-bold text-gray-900 leading-tight px-2"
                onAnimationComplete={() => setIsHeadingAnimationComplete(true)}
                {...shinyTextAnimationConfig}
              />
              <p
                className="text-gray-600 mt-2 sm:!mt-3 text-sm sm:!text-base md:!text-lg max-w-md mx-auto px-2"
                style={{ ...benefitItemStyle, animationDelay: '0.2s' }}
              >
                Join thousands of researchers, funders, and citizen scientists collaborating at the
                edge of science.
              </p>
            </div>

            <div
              className="my-4 sm:!my-6 md:!my-8"
              style={{ ...benefitItemStyle, animationDelay: '0.4s' }}
            >
              <hr className="w-1/2 mx-auto" />
            </div>

            <div className="space-y-4 sm:!space-y-6 mt-6 sm:!mt-8 text-left">
              <div
                className="flex items-start"
                style={{ ...benefitItemStyle, animationDelay: '0.6s' }}
              >
                <div className="w-10 h-10 sm:!w-12 sm:!h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                  <Icon name="fund" size={20} className="sm:!w-7 sm:!h-7" color="black" />
                </div>
                <div className="ml-3 sm:!ml-4 flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm sm:!text-base">
                    Fund & Be Funded
                  </h3>
                  <p className="text-gray-600 text-xs sm:!text-sm mt-1">
                    Support novel ideas or secure funding for your own research projects.
                  </p>
                </div>
              </div>
              <div
                className="flex items-start"
                style={{ ...benefitItemStyle, animationDelay: '0.8s' }}
              >
                <div className="w-10 h-10 sm:!w-12 sm:!h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                  <Icon name="earn1" size={20} className="sm:!w-7 sm:!h-7" color="black" />
                </div>
                <div className="ml-3 sm:!ml-4 flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm sm:!text-base">
                    Earn Rewards
                  </h3>
                  <p className="text-gray-600 text-xs sm:!text-sm mt-1">
                    Earn $150 for every paper you review.
                  </p>
                </div>
              </div>
              <div
                className="flex items-start"
                style={{ ...benefitItemStyle, animationDelay: '1.0s' }}
              >
                <div className="w-10 h-10 sm:!w-12 sm:!h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                  <Icon name="rhJournal2" size={20} className="sm:!w-7 sm:!h-7" color="black" />
                </div>
                <div className="ml-3 sm:!ml-4 flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm sm:!text-base">Publish</h3>
                  <p className="text-gray-600 text-xs sm:!text-sm mt-1">
                    Publish your work in the RH Journal to reach a global audience.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="mt-6 sm:!mt-8 md:!mt-10"
              style={{ ...benefitItemStyle, animationDelay: '1.2s' }}
            >
              <Button
                onClick={handleSignupClick}
                size="lg"
                className="w-full text-sm sm:!text-base py-3 sm:!py-4"
              >
                Create Account
              </Button>
              <p className="text-center text-xs sm:!text-sm text-gray-500 mt-3 sm:!mt-4 px-2">
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
