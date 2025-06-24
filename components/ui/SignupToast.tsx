'use client';

import { useEffect, useState, useCallback } from 'react';
import Icon from './icons/Icon';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useRouter } from 'next/navigation';
import ShinyText from './ShinyText/ShinyText';

interface SignupToastProps {
  onClose: () => void;
}

export default function SignupToast({ onClose }: SignupToastProps) {
  const [showButton, setShowButton] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const router = useRouter();

  // Add custom animation styles on mount
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes slideUp {
        0% { opacity: 0; transform: translate(-50%, 20px); }
        100% { opacity: 1; transform: translate(-50%, 0); }
      }
      @keyframes slideDown {
        0% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, 20px); }
      }
      @keyframes buttonFadeIn {
        0% { opacity: 0; transform: translateY(8px); max-height: 0; margin-top: 0; }
        30% { opacity: 0; max-height: 50px; margin-top: 1rem; }
        100% { opacity: 1; transform: translateY(0); max-height: 50px; margin-top: 1rem; }
      }
      @keyframes borderGlow {
        0% { border-image-source: linear-gradient(90deg, #FF4D8D, #6C63FF, #3B82F6, #FFCC00); }
        25% { border-image-source: linear-gradient(180deg, #6C63FF, #3B82F6, #FFCC00, #FF4D8D); }
        50% { border-image-source: linear-gradient(270deg, #3B82F6, #FFCC00, #FF4D8D, #6C63FF); }
        75% { border-image-source: linear-gradient(360deg, #FFCC00, #FF4D8D, #6C63FF, #3B82F6); }
        100% { border-image-source: linear-gradient(90deg, #FF4D8D, #6C63FF, #3B82F6, #FFCC00); }
      }
    `;
    document.head.appendChild(style);

    // Small delay to ensure smooth rendering
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => {
      // Clean up the style element when component unmounts
      document.head.removeChild(style);
      clearTimeout(visibilityTimer);
    };
  }, []);

  // Handle animation completion with useCallback to prevent recreation on re-renders
  const handleAnimationComplete = useCallback(() => {
    setShowButton(true);
  }, []);

  // Handle signup button click
  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Use executeAuthenticatedAction first, then close the toast after modal appears
    executeAuthenticatedAction(() => {
      // This will open the auth modal automatically
      // After authentication, we can redirect if needed
      console.log('User authenticated');
    });

    // Start closing animation
    setIsClosing(true);

    // Close the toast after animation completes
    setTimeout(() => {
      onClose();
    }, 500);
  };

  // Animation configuration
  const animationConfig = {
    speed: 0.7, // Slower animation (lower number = slower)
    animationDelay: 800, // Delay before showing button
    wordAnimationDuration: 0.4, // Longer word animation
    wordStaggerDelay: 0.05, // More delay between words
    shineAnimationDuration: 1.2, // Longer shine effect
  };

  return (
    <div
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[9999] max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex flex-col overflow-hidden opacity-0"
      style={{
        animation: isClosing
          ? 'slideDown 0.5s ease-in forwards'
          : isVisible
            ? 'slideUp 0.5s ease-out forwards'
            : 'none',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        border: '3px solid transparent',
        borderImageSlice: 1,
        borderImageWidth: '3px',
        borderImageSource: 'linear-gradient(90deg, #FF4D8D, #6C63FF, #3B82F6, #FFCC00)',
        borderImageOutset: 0,
        animationName: isVisible ? 'slideUp, borderGlow' : isClosing ? 'slideDown' : 'none',
        animationDuration: '0.5s, 8s',
        animationTimingFunction: 'ease-out, linear',
        animationIterationCount: '1, infinite',
        animationFillMode: 'forwards',
      }}
    >
      {/* Logo centered at top */}
      <div className="flex justify-center pt-4">
        <Icon name="flaskFrame" size={56} color="#3B82F6" />
      </div>

      {/* Text content */}
      <div className="px-6 pt-3 pb-4 text-center">
        {/* Main message using ShinyText */}
        <div className="text-xl font-medium leading-tight">
          {isVisible && (
            <ShinyText
              text="Fund research proposals or get your research funded."
              className="inline-block font-medium text-gray-800"
              onAnimationComplete={handleAnimationComplete}
              {...animationConfig}
            />
          )}
        </div>

        {/* Button container - always present but with dynamic height/opacity */}
        <div
          className="overflow-hidden"
          style={{
            animation: showButton ? 'buttonFadeIn 1.0s ease-out forwards' : 'none',
            opacity: 0,
            maxHeight: 0,
            marginTop: 0,
          }}
        >
          <button
            onClick={handleSignupClick}
            className="inline-block w-full py-2.5 px-4 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-all duration-500 text-center"
          >
            Sign up now
          </button>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={() => {
          setIsClosing(true);
          setTimeout(onClose, 500);
        }}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none transition-colors duration-200"
      >
        <svg
          className="h-4 w-4 text-gray-500"
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
    </div>
  );
}
