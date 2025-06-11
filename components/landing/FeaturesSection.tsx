'use client';

import React, { useState, useEffect } from 'react';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Icon } from '@/components/ui/icons';
import { Button } from '@/components/ui/Button';
import { colors } from '@/app/styles/colors';

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  primaryAction: {
    text: string;
    description: string;
  };
  secondaryAction?: {
    text: string;
    description: string;
  };
  iconName: string;
  gradient: string;
}

const features: Feature[] = [
  {
    id: 'fund',
    title: 'Fund',
    subtitle: 'Accelerate scientific discovery',
    description:
      'Connect researchers with funding opportunities and enable philanthropists to directly support groundbreaking experiments.',
    benefits: [
      'Transparent funding allocation',
      'Direct impact tracking',
      'Tax-deductible donations',
      'Real-time progress updates',
    ],
    primaryAction: {
      text: 'Give research funding',
      description: 'Support research as a donor or philanthropist',
    },
    secondaryAction: {
      text: 'Request funding',
      description: 'Get crowdfunding for your experiments',
    },
    iconName: 'fund',
    gradient: 'from-primary-600 to-primary-400',
  },
  {
    id: 'earn',
    title: 'Earn',
    subtitle: 'Get paid for peer review',
    description:
      'Earn $150 for high-quality peer reviews and contribute to the advancement of scientific knowledge.',
    benefits: [
      'Earn $150 per peer review',
      'Build your reputation',
      'Shape scientific discourse',
      'Flexible review schedule',
    ],
    primaryAction: {
      text: 'Start reviewing',
      description: 'Begin earning through peer review',
    },
    iconName: 'earn1',
    gradient: 'from-primary-600 to-primary-400',
  },
  {
    id: 'publish',
    title: 'Publish',
    subtitle: 'Champion open science',
    description:
      'Publish in the ResearchHub Journal with transparent peer review, low fees, and a commitment to open access.',
    benefits: [
      'Only $300 APC fee',
      'Open peer review process',
      'Immediate preprint option',
      'Reviewers paid $150 each',
    ],
    primaryAction: {
      text: 'Submit paper',
      description: 'Publish your research with open access',
    },
    iconName: 'rhJournal2',
    gradient: 'from-primary-600 to-primary-400',
  },
];

export function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50/50 via-slate-50/20 to-slate-100/40 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-primary-600/5 to-transparent transform -skew-y-1"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNGY0NmU1IiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-16 h-16 bg-primary-200/40 rounded-full animate-pulse-slow blur-sm"></div>
        <div
          className="absolute bottom-20 left-20 w-12 h-12 bg-blue-300/35 rounded-full animate-pulse-slow blur-sm"
          style={{ animationDelay: '1.5s' }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-8 h-8 bg-purple-200/50 rounded-full animate-pulse-slow blur-sm"
          style={{ animationDelay: '2.5s' }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: 'Cal Sans, sans-serif' }}
          >
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 bg-clip-text text-transparent">
              advance science
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Fund groundbreaking research, earn through peer review, and publish with transparency.
            ResearchHub provides the complete ecosystem for modern scientific collaboration.
          </p>
        </div>

        {/* Feature Navigation */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="inline-flex p-1 bg-gray-100 rounded-full flex-wrap sm:flex-nowrap">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(index)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${
                  activeFeature === index
                    ? 'bg-gradient-to-r from-primary-600 to-primary-400 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {feature.title}
              </button>
            ))}
          </div>
        </div>

        {/* Unified Feature Display */}
        <div className="flex justify-center">
          <SpotlightCard
            className="w-full max-w-2xl bg-white/80 backdrop-blur-sm border-2 border-white/20 shadow-xl"
            spotlightColor="rgba(79, 70, 229, 0.15)"
          >
            <div className="text-center space-y-8">
              {/* Header with Icon */}
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${features[activeFeature].gradient} flex items-center justify-center text-white shadow-lg`}
                >
                  <Icon name={features[activeFeature].iconName as any} size={32} color="white" />
                </div>

                <div>
                  <h3
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2"
                    style={{ fontFamily: 'Cal Sans, sans-serif' }}
                  >
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-lg sm:text-xl text-gray-600">
                    {features[activeFeature].subtitle}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-xl mx-auto px-4 sm:px-0">
                {features[activeFeature].description}
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto px-4 sm:px-0">
                {features[activeFeature].benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 text-left">
                    <div
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${features[activeFeature].gradient} flex-shrink-0`}
                    />
                    <span className="text-gray-700 text-sm sm:text-base">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className={features[activeFeature].secondaryAction ? 'space-y-4' : 'space-y-4'}>
                {features[activeFeature].secondaryAction ? (
                  // Side by side layout for Fund feature (has both buttons)
                  <div className="flex flex-wrap gap-4 justify-center items-start max-w-2xl mx-auto">
                    <div className="flex-1 min-w-64 max-w-80 text-center">
                      <Button
                        size="lg"
                        className={`w-full bg-gradient-to-r ${features[activeFeature].gradient} text-white hover:shadow-lg`}
                      >
                        {features[activeFeature].primaryAction.text}
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">
                        {features[activeFeature].primaryAction.description}
                      </p>
                    </div>
                    <div className="flex-1 min-w-64 max-w-80 text-center">
                      <Button variant="outlined" size="lg" className="w-full">
                        {features[activeFeature].secondaryAction.text}
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">
                        {features[activeFeature].secondaryAction.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Single button layout for other features
                  <div className="text-center">
                    <Button
                      size="lg"
                      className={`bg-gradient-to-r ${features[activeFeature].gradient} text-white hover:shadow-lg`}
                    >
                      {features[activeFeature].primaryAction.text}
                    </Button>
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      {features[activeFeature].primaryAction.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
