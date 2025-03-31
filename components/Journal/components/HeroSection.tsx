'use client';

import { FC } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/icons/Icon';
import { FileText } from 'lucide-react';

export const HeroSection: FC = () => {
  return (
    <div className="mb-12 text-center relative overflow-hidden py-10 px-6 bg-gradient-to-b from-indigo-50/60 to-white rounded-xl border border-indigo-100/50">
      <div className="absolute inset-0 bg-grid-indigo/[0.03] bg-[size:20px_20px]"></div>
      <div className="relative">
        <div className="flex justify-center mb-4">
          <div className="bg-white p-3 rounded-full shadow-md inline-flex">
            <Icon name="rhJournal2" size={40} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">ResearchHub Journal Showcase</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Discover the latest research published in our open access journal. From preprints to
          peer-reviewed articles, explore cutting-edge findings from researchers around the world.
        </p>

        {/* CTA buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link href="/paper/create/pdf">
            <button className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 transition-all duration-200 inline-flex items-center">
              Submit Research
              <FileText className="ml-2 h-4 w-4" />
            </button>
          </Link>
          <Link href="/journal">
            <button className="px-5 py-2.5 bg-white text-indigo-600 border border-indigo-200 font-medium rounded-md shadow-sm hover:bg-indigo-50 transition-all duration-200">
              View All Papers
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
