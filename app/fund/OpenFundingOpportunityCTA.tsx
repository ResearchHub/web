'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import {
  OpenFundingOpportunityModal,
  type FundingOpportunityCreationMethod,
} from '@/components/Funding/OpenFundingOpportunityModal';

const FUNDING_METHODS = ['Funding Credits', 'Donor-advised funds (DAF)', 'USD'];

export function OpenFundingOpportunityCTA() {
  const router = useRouter();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleOpen = () => {
    executeAuthenticatedAction(() => setIsModalOpen(true));
  };

  const handleConfirm = (method: FundingOpportunityCreationMethod) => {
    setIsModalOpen(false);
    router.push(`/notebook?newGrant=true&grantSource=${method}`);
  };

  return (
    <>
      <div
        className="relative w-full"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Button
          variant="default"
          size="lg"
          onClick={handleOpen}
          className="w-full gap-2 max-sm:!text-xs max-sm:!h-8 max-sm:!px-2"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Funding Opportunity
        </Button>

        <p className="mt-2 text-center text-xs text-gray-500">
          Use your <span className="font-semibold text-rhBlue-600">$2,500</span> in funding credits
          to open an opportunity.
        </p>

        {showTooltip && (
          <div className="absolute left-0 top-full z-[10000] mt-2 w-full rounded-md border border-gray-900 bg-gray-900 px-4 py-3 text-left text-sm text-white shadow-md">
            <div className="font-medium">Fund research with:</div>
            <ul className="mt-1.5 space-y-1">
              {FUNDING_METHODS.map((method) => (
                <li key={method} className="flex items-center gap-2">
                  <Check className="h-4 w-4 flex-shrink-0 text-green-400" />
                  <span>{method}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <OpenFundingOpportunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
