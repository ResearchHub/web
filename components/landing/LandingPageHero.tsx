'use client';

import Aurora from '@/components/ui/Aurora';
import { colors } from '@/app/styles/colors';
import { AuthForm } from './AuthForm';
import { HeroCardSwap } from './HeroCardSwap';

export function LandingPageHero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 w-full h-full">
        <Aurora
          colorStops={[colors.primary[600], colors.rhBlue, colors.primary[400]]}
          blend={0.6}
          amplitude={0.6}
          speed={0.3}
        />
      </div>

      {/* Vignette effect using multiple gradients */}
      <div className="absolute inset-0">
        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/30 to-transparent"></div>
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/30 to-transparent"></div>
        {/* Left gradient for sidebar transition */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white/30 to-transparent"></div>
        {/* Right gradient */}
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white/30 to-transparent"></div>
      </div>

      {/* Overlay to soften the aurora effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/70 via-blue-50/60 to-indigo-100/65"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Hero Content + Auth Form */}
          <div className="text-center lg:text-left">
            {/* Hero Header */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1]"
              style={{ fontFamily: 'Cal Sans, sans-serif' }}
            >
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Scientific research
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 bg-clip-text text-transparent">
                funding, but better.
              </span>
            </h1>

            {/* Hero Description */}
            <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8 font-medium">
              The world's first scientific economy where researchers earn transactable rewards for
              their work and donations turn into research in real-time.
            </p>

            {/* Auth Form */}
            <AuthForm />
          </div>

          {/* Right Side - Card Swap Component */}
          <HeroCardSwap />
        </div>
      </div>
    </div>
  );
}
