'use client';

import { useState } from 'react';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Icon } from '@/components/ui/icons';

interface WhyRSCFeature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  iconName: string;
  gradient: string;
}

const whyRSCFeatures: WhyRSCFeature[] = [
  {
    id: 'incentives',
    title: 'Incentives',
    subtitle: 'Addressing the root of the reproducibility crisis',
    description:
      'We believe the problems in science are downstream of the incentives. We want to reward open science and collaboration.',
    benefits: [
      'Open-access proposals',
      'Incentivized progress updates',
      'Peer review compensation',
      'Crowdraised research funding',
    ],
    iconName: 'fund2',
    gradient: 'from-[#3971FF] to-[#4A7FFF]',
  },
  {
    id: 'transparency',
    title: 'Transparency',
    subtitle: 'Clear rules and visible economics',
    description:
      'RSC powers transparent incentives and reporting. Review rewards, funding disbursements, and author responses are visible to participants.',
    benefits: [
      'Traceable funding',
      'Visible reviewer rewards',
      'Open access (CC0)',
      'Community accountability',
    ],
    iconName: 'upChart1',
    gradient: 'from-[#3971FF] to-[#4A7FFF]',
  },
  {
    id: 'tools',
    title: 'Features',
    subtitle: 'Power up your research',
    description:
      'Spend RSC on bounties for expert help, affordable publishing, research funding, and premium tools that supercharge your work.',
    benefits: [
      'Expert researchers available',
      'Affordable paper publishing',
      'Project funding access',
      'Advanced research tools',
    ],
    iconName: 'solidEarn',
    gradient: 'from-[#3971FF] to-[#4A7FFF]',
  },
];

export function ResearchCoinSection() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50/50 via-slate-50/20 to-slate-100/40 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#3971FF]/5 to-transparent transform -skew-y-1"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjM0E3MVBGIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-16 h-16 bg-[#3971FF]/40 rounded-full animate-pulse-slow blur-sm"></div>
        <div
          className="absolute bottom-20 left-20 w-12 h-12 bg-blue-300/35 rounded-full animate-pulse-slow blur-sm"
          style={{ animationDelay: '1.5s' }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-8 h-8 bg-purple-200/50 rounded-full animate-pulse-slow blur-sm"
          style={{ animationDelay: '2.5s' }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-[#3971FF] to-[#4A7FFF] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
              <Icon name="flaskFrame" size={32} color="white" />
            </div>
            <h2
              className="text-4xl font-bold text-gray-900"
              style={{ fontFamily: 'Cal Sans, sans-serif' }}
            >
              Powered by{' '}
              <span className="bg-gradient-to-r from-[#3971FF] via-[#4A7FFF] to-[#5B8DFF] bg-clip-text text-transparent">
                ResearchCoin
              </span>
            </h2>
          </div>

          <p className="text-xl text-gray-600 leading-relaxed">
            The digital token that makes researchers co-owners of the scientific ecosystem. Earn RSC
            for your contributions and use it to access powerful tools that accelerate your
            research.
          </p>
        </div>

        {/* Why ResearchCoin Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 bg-gray-100 rounded-full overflow-x-auto">
            {whyRSCFeatures.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(index)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 text-base whitespace-nowrap flex-shrink-0 ${
                  activeFeature === index
                    ? 'bg-gradient-to-r from-[#3971FF] to-[#4A7FFF] text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {feature.title}
              </button>
            ))}
          </div>
        </div>

        {/* Unified Why RSC Display */}
        <div className="flex justify-center mb-16">
          <SpotlightCard
            className="w-full max-w-2xl bg-white/80 backdrop-blur-sm border-2 border-white/20 shadow-xl"
            spotlightColor="rgba(79, 70, 229, 0.15)"
          >
            <div className="text-center space-y-8">
              {/* Header with Icon */}
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${whyRSCFeatures[activeFeature].gradient} flex items-center justify-center text-white shadow-lg`}
                >
                  <Icon
                    name={whyRSCFeatures[activeFeature].iconName as any}
                    size={32}
                    color="white"
                  />
                </div>

                <div>
                  <h3
                    className="text-3xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: 'Cal Sans, sans-serif' }}
                  >
                    {whyRSCFeatures[activeFeature].title}
                  </h3>
                  <p className="text-xl text-gray-600">{whyRSCFeatures[activeFeature].subtitle}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-xl mx-auto px-2 md:px-4">
                {whyRSCFeatures[activeFeature].description}
              </p>

              {/* Benefits Grid */}
              <div className="flex flex-wrap gap-4 max-w-xl mx-auto px-2 md:px-4 justify-center">
                {whyRSCFeatures[activeFeature].benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 text-left w-64 flex-shrink-0"
                  >
                    <div
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${whyRSCFeatures[activeFeature].gradient} flex-shrink-0`}
                    />
                    <span className="text-gray-700 text-base">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
