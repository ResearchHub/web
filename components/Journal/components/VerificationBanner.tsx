'use client';

import { FC } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCheck,
  faCircleCheck,
  faArrowRight,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

export const VerificationBanner: FC = () => {
  return (
    <div className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg overflow-hidden border border-blue-100 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between">
        {/* Left section with icon and text */}
        <div className="flex items-center gap-4 p-4 md:p-6 md:pl-8">
          <div className="bg-white p-2.5 rounded-full shadow-sm flex items-center justify-center">
            <FontAwesomeIcon icon={faUserCheck} className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Get Personalized Research Recommendations
            </h3>
            <p className="text-sm text-gray-600 max-w-md">
              Verify your profile to get tailored research recommendations based on your interests
              and reading history.
            </p>
          </div>
        </div>

        {/* Right section with benefits and CTA */}
        <div className="flex items-center gap-8 p-4 md:p-6 md:pr-8">
          <div className="hidden md:flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-blue-500" />
              <span className="text-sm text-gray-700">Stay up to date in your field</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-blue-500" />
              <span className="text-sm text-gray-700">Get targeted earning opportunities</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-blue-500" />
              <span className="text-sm text-gray-700">Earn RSC on your papers</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Link href="/profile/verify">
              <button className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 transition-all">
                Verify Profile
                <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
              </button>
            </Link>
            <span className="text-xs text-gray-500 mt-2">About 5 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
