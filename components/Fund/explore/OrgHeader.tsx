'use client';

import { FC } from 'react';
import { FundingOrganization } from '@/types/fundingOrganization';
import { Building2, ArrowLeft } from 'lucide-react';

interface OrgHeaderProps {
  organization: FundingOrganization;
  onBack: () => void;
}

export const OrgHeader: FC<OrgHeaderProps> = ({ organization, onBack }) => {
  return (
    <div className="mb-6">
      {/* Back navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <span>Back to browse</span>
      </button>

      {/* Org banner */}
      <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-50 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-40 pointer-events-none" />

        <div className="relative flex items-start gap-5">
          {/* Org logo / image */}
          {organization.imageUrl ? (
            <img
              src={organization.imageUrl}
              alt={organization.name}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-primary-600" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{organization.name}</h2>
            <p className="text-gray-600 leading-relaxed mb-3 max-w-2xl">
              {organization.description}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600 font-semibold">
                {organization.totalFunding.formatted} total funding
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <span className="text-gray-500">
                {organization.grantCount} {organization.grantCount === 1 ? 'grant' : 'grants'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
