'use client';

import { Button } from '@/components/ui/Button';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { HeroCardSwap } from './HeroCardSwap';

export function LandingPageHero() {
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const handleSignUp = () => {
    executeAuthenticatedAction(() => {
      // Handle sign up action
      console.log('Sign Up clicked');
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white">
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
          {/* Mobile Layout: Text above Graphics (< lg screens) */}
          <div className="flex flex-col lg:hidden h-full justify-center items-center py-8 space-y-8 px-4">
            {/* Text Content for Mobile */}
            <div className="text-center" style={{ maxWidth: '505px' }}>
              {/* Hero Header - FIXED SIZE, scales with container */}
              <h1 className="text-5xl font-semibold mb-4 leading-[1.1] text-black">
                A new economy
                <br />
                for science
              </h1>

              {/* Hero Description - FIXED SIZE, scales with container */}
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                The world's first scientific economy where researchers earn transactable rewards and
                funding for their work.
              </p>

              {/* Sign Up Button */}
              <div className="flex flex-col items-center">
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleSignUp}
                  className="bg-gradient-to-r from-[#3971FF] to-[#4A7FFF] hover:from-[#2C5EE8] hover:to-[#3971FF] text-white font-semibold px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                >
                  Sign up
                </Button>
                <p className="text-sm text-gray-600 mt-2">Start earning for open science today.</p>
              </div>
            </div>

            {/* Hero Cards for Mobile */}
            <div className="w-full flex justify-center">
              <HeroCardSwap />
            </div>
          </div>

          {/* Desktop Layout: Side by Side (>= lg screens) */}
          <div className="hidden lg:grid lg:grid-cols-2 h-full gap-16">
            {/* Left Half - Hero Card Swap Component */}
            <div className="h-full flex items-center justify-center relative pr-8">
              <HeroCardSwap />
            </div>

            {/* Right Half - Hero Content + Sign Up Button */}
            <div className="h-full flex items-center pl-8">
              <div className="w-full" style={{ maxWidth: '505px' }}>
                {/* Hero Header - FIXED SIZE, scales with container */}
                <h1 className="text-6xl font-semibold mb-4 leading-[1.1] text-black">
                  A new economy
                  <br />
                  for science
                </h1>

                {/* Hero Description - FIXED SIZE, scales with container */}
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  The world's first scientific economy where researchers earn transactable rewards
                  and funding for their work.
                </p>

                {/* Sign Up Button */}
                <div className="flex flex-col items-start">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handleSignUp}
                    className="bg-gradient-to-r from-[#3971FF] to-[#4A7FFF] hover:from-[#2C5EE8] hover:to-[#3971FF] text-white font-semibold px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                  >
                    Sign up
                  </Button>
                  <p className="text-lg text-gray-600 mt-2">
                    Start earning for open science today.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
