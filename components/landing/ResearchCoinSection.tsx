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
    subtitle: 'Get paid for science',
    description:
      'Earn ResearchCoin for peer reviews, quality contributions, and collaborative research that traditionally went unrewarded.',
    benefits: [
      'Peer review compensation',
      'Quality content rewards',
      'Community recognition',
      'Transparent reputation system',
    ],
    iconName: 'fund2',
    gradient: 'from-[#3971FF] to-[#4A7FFF]',
  },
  {
    id: 'upside',
    title: 'Upside',
    subtitle: 'Benefit from growth',
    description:
      'As ResearchHub creates value for the scientific community, RSC holders benefit from increased utility and ecosystem growth.',
    benefits: [
      'Ecosystem value capture',
      'Network effect benefits',
      'Long-term appreciation',
      'Utility-driven demand',
    ],
    iconName: 'upChart1',
    gradient: 'from-orange-500 to-amber-400',
  },
  {
    id: 'tools',
    title: 'Tools',
    subtitle: 'Unlock research power',
    description:
      'Use RSC to access premium features, post bounties, fund research, publish papers, and accelerate your scientific work.',
    benefits: [
      'Expert bounty services',
      'Low-cost publishing',
      'Research funding',
      'Premium platform features',
    ],
    iconName: 'solidEarn',
    gradient: 'from-gray-600 to-gray-400',
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
              <Icon name="blueAndWhite" size={32} />
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
            The digital currency that gives researchers a{' '}
            <span className="font-semibold text-blue-600">share in scientific progress</span>. Think
            of it as equity for academia—rewarding your contributions to knowledge while unlocking
            powerful tools for collaboration.
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
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#3971FF] to-[#4A7FFF] flex items-center justify-center text-white shadow-lg">
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
              <p className="text-lg text-gray-700 leading-relaxed max-w-xl mx-auto px-4">
                {whyRSCFeatures[activeFeature].description}
              </p>

              {/* Benefits Grid */}
              <div className="flex flex-wrap gap-4 max-w-xl mx-auto px-4 justify-center">
                {whyRSCFeatures[activeFeature].benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 text-left min-w-60">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#3971FF] to-[#4A7FFF] flex-shrink-0" />
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
