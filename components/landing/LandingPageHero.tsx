'use client';

import { Button } from '@/components/ui/Button';
import { useAuthModalContext } from '@/contexts/AuthModalContext';
import { HeroCardSwap } from './HeroCardSwap';
import Aurora from '@/components/ui/Aurora';
import { colors } from '@/app/styles/colors';

export function LandingPageHero() {
  const { showAuthModal } = useAuthModalContext();

  const handleSignUp = () => {
    showAuthModal();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 w-full h-full opacity-5 brightness-200">
        <Aurora
          colorStops={[colors.rhBlue, colors.rhBlue, colors.rhBlue]}
          amplitude={0.3}
          blend={0.3}
          speed={0.4}
        />
      </div>

      {/* Content - Unified Responsive Container */}
      <div className="relative z-10 w-full h-full">
        <div
          className="w-full h-full max-w-none px-0"
          style={{
            // SINGLE unified scaling for the entire hero section
            transform: `scale(clamp(0.75, 0.75 + 0.25 * ((100vw - 320px) / (1600 - 320)), 1))`,
            transformOrigin: 'center center',
          }}
        >
          {/* Unified Responsive Grid Layout */}
          <div className="grid grid-cols-1 lg:!grid-cols-2 h-full gap-8 lg:!gap-16 py-8 px-4">
            {/* Text Content - Now first on mobile, second on desktop */}
            <div className="flex items-center pl-0 lg:!pl-8">
              <div
                className="w-full text-center lg:!text-left mx-auto"
                style={{ maxWidth: '505px' }}
              >
                {/* Hero Header */}
                <h1 className="text-5xl lg:!text-6xl font-semibold mb-4 leading-[1.1] text-black">
                  A new economy
                  <br />
                  for science
                </h1>

                {/* Hero Description */}
                <p className="text-lg lg:!text-xl text-gray-600 leading-relaxed mb-8">
                  The world's first scientific economy where researchers earn transactable rewards
                  and funding for their work.
                </p>

                {/* Sign Up Button */}
                <div className="flex flex-col items-center lg:!items-start">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handleSignUp}
                    className="bg-gradient-to-r from-[#3971FF] to-[#4A7FFF] hover:from-[#2C5EE8] hover:to-[#3971FF] text-white font-semibold px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                  >
                    Sign up
                  </Button>
                  <p className="text-sm lg:!text-lg text-gray-600 mt-2">
                    Start earning for open science today.
                  </p>
                </div>
              </div>
            </div>

            {/* Card Swap - Now second on mobile, first on desktop */}
            <div className="flex items-center justify-center relative mb-8 lg:!mb-0 pr-0 lg:!pr-16 lg:!pt-16">
              <HeroCardSwap />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
