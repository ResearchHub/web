'use client';

import { FC } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/icons/Icon';
import { FileText } from 'lucide-react';

export const SubmitCTA: FC = () => {
  return (
    <div className="mt-20 mb-10 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 rounded-xl shadow-xl overflow-hidden">
      <div className="relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-lg"></div>

        <div className="px-8 py-12 text-center relative">
          <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="rhJournal2" size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Share Your Research with the World?
          </h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join researchers who are accelerating scientific progress. Submit your work to
            ResearchHub Journal today and reach a global audience of peers.
          </p>
          <Link href="/paper/create/pdf">
            <button className="px-8 py-3 bg-white text-indigo-700 font-bold rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center mx-auto">
              <FileText className="mr-2 h-5 w-5" />
              Submit Your Paper
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
