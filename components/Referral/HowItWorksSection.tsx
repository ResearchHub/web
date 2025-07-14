'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicroscope } from '@fortawesome/pro-light-svg-icons';
import { Share2, Users } from 'lucide-react';

export function HowItWorksSection() {
  return (
    <section className="bg-white p-8 rounded-lg shadow-md mb-12">
      <h2 className="text-2xl sm:!text-3xl font-bold text-center mb-10 text-gray-800">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:!grid-cols-3 gap-8 text-center">
        <div className="flex flex-col items-center">
          <div className="relative bg-blue-100 rounded-full h-24 w-24 flex items-center justify-center mb-4">
            <Share2 className="h-8 w-8 text-blue-600" />
            <span className="absolute top-0 right-0 bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold border-4 border-white">
              1
            </span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Share Your Link</h3>
          <p className="text-gray-600 px-2">
            Share your unique referral link with potential funders, big or small.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative bg-green-100 rounded-full h-24 w-24 flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faMicroscope} className="h-8 w-8 text-green-600" />
            <span className="absolute top-0 right-0 bg-green-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold border-4 border-white">
              2
            </span>
          </div>
          <h3 className="text-xl font-semibold mb-2">User Funds Research</h3>
          <p className="text-gray-600 px-2">Referred user funds a proposal.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative bg-yellow-100 rounded-full h-24 w-24 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-yellow-600" />
            <span className="absolute top-0 right-0 bg-yellow-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold border-4 border-white">
              3
            </span>
          </div>
          <h3 className="text-xl font-semibold mb-2">You Both Get Rewarded</h3>
          <p className="text-gray-600 px-2">
            You both receive 10% of their funded amount in credits to support more research.
          </p>
        </div>
      </div>
    </section>
  );
}
