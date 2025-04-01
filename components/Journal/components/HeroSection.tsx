'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/icons/Icon';
import { ArrowRight, FileText, X } from 'lucide-react';

export const HeroSection: FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="mb-12 text-center relative overflow-hidden py-10 px-6 bg-gradient-to-b from-indigo-50/60 to-white rounded-xl border border-indigo-100/50">
      <div className="absolute inset-0 bg-grid-indigo/[0.03] bg-[size:20px_20px]"></div>

      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        aria-label="Close banner"
      >
        <X className="h-5 w-5 text-gray-500" />
      </button>

      <div className="relative">
        <div className="flex justify-center mb-4">
          <div className="bg-white p-3 rounded-full w-[80px] h-[80px] flex items-center justify-center shadow-md inline-flex">
            <Icon name="flaskFrame" size={34} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to ResearchHub</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Discover the latest research, earning, and funding opportunities.
        </p>

        {/* CTA buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setIsVisible(false)}
            className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 transition-all duration-200 inline-flex items-center"
          >
            Let's get started
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
