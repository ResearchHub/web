import { useState } from 'react';
import Image from 'next/image';
import { Plus, X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { SelectFundingOpportunityModal } from '@/components/modals/SelectFundingOpportunityModal';
import { GRANT_IMAGE_FALLBACK_GRADIENT } from '@/types/grant';
import { formatCompactAmount } from '@/utils/currency';
import type { PublishingFormData } from '../schema';
import { useSelectedGrant } from '../useSelectedGrant';

interface FundingOpportunityFieldProps {
  readonly noteId: number;
}

/**
 * The Request for Proposal this proposal answers: the chosen one as a card,
 * or a prompt to pick one. Renders nothing once the proposal is published,
 * because the answer cannot change after that.
 */
export function FundingOpportunityField({ noteId }: FundingOpportunityFieldProps) {
  const { watch } = useFormContext<PublishingFormData>();
  const workId = watch('workId');
  const { selectedGrant, isSaving, save } = useSelectedGrant(noteId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (workId) return null;

  return (
    <>
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight text-gray-900 mb-2">
          Request for Proposal <span className="font-normal text-gray-500 text-xs">(Optional)</span>
        </h3>
        {selectedGrant ? (
          <div className="flex gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 relative">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 relative">
              {selectedGrant.imageUrl ? (
                <Image
                  src={selectedGrant.imageUrl}
                  alt={selectedGrant.shortTitle}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: GRANT_IMAGE_FALLBACK_GRADIENT }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {selectedGrant.organization || 'RFP'}
              </div>
              <div className="text-sm font-semibold text-gray-900 truncate">
                {selectedGrant.shortTitle}
              </div>
              <div className="text-xs font-medium text-emerald-600">
                {formatCompactAmount(selectedGrant.fundingAmount)} Funding
              </div>
            </div>
            <button
              type="button"
              onClick={() => void save(null)}
              disabled={isSaving}
              aria-label="Remove RFP"
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600 disabled:pointer-events-none disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-colors disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Select RFP
          </button>
        )}
      </div>

      <SelectFundingOpportunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(grant) => void save(grant)}
      />
    </>
  );
}
