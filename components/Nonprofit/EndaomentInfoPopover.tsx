'use client';

import { ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EndaomentInfoPopoverProps {
  position: {
    top: number;
    left: number;
    arrowPosition?: number;
  };
  onClose: () => void;
  useAlternateText?: boolean;
}

export function EndaomentInfoPopover({
  position,
  onClose,
  useAlternateText = false,
}: EndaomentInfoPopoverProps) {
  const primaryContent = (
    <>
      <p>
        <span className="font-medium text-gray-800">Endaoment</span> is a nonprofit community
        foundation that processes donations from users directly to university nonprofits on behalf
        of researchers.
      </p>

      <div>
        <h4 className="text-xs font-medium text-gray-700 mb-1">Benefits:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Researchers don't have to handle crypto or payments</li>
          <li>Donors receive tax-deductible status for qualifying contributions</li>
          <li>Seamless transfer of funds to university foundations</li>
          <li>Support for multiple asset types (crypto, cash, etc.)</li>
        </ul>
      </div>

      <p>
        By selecting a nonprofit organization, you're enabling Endaoment to process donations
        through their nonprofit support program, ensuring your research receives funding while
        maintaining compliance with tax regulations.
      </p>
    </>
  );

  // Alternate content focusing on tax deductions for contributions over $1000
  const alternateContent = (
    <>
      <p>
        <strong>Donations to this project are tax-deductible</strong> and will be processed as a
        grant to the nonprofit organization listed. Donors who contribute $500 or more will
        automatically receive a tax receipt from our grant-making partner, Endaoment, upon the
        successful completion of this fundraiser.
      </p>

      <div>
        <h4 className="text-xs font-medium text-gray-700 mb-1">Benefits:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Grants are sent directly to the researcher's account or lab</li>
          <li>Endaoment handles all processing and conversion of RSC</li>
          <li>Donors receive tax relief for their contribution to science</li>
        </ul>
      </div>
    </>
  );

  return (
    <div
      className="endaoment-info-popover fixed z-50 w-96 bg-white rounded-lg shadow-xl border border-gray-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateY(-100%)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-base font-semibold text-gray-900">
            {useAlternateText ? 'Supporting Research Institutions' : 'About nonprofit support'}
          </h3>
          <Button
            className="nonprofit-popover-close text-gray-400 hover:text-gray-600"
            onClick={onClose}
            variant="ghost"
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 text-xs text-gray-600 max-h-80 overflow-y-auto pr-1">
          {useAlternateText ? alternateContent : primaryContent}

          <div className="pt-2">
            <a
              href="https://app.endaoment.org/researchhub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline flex items-center gap-1"
            >
              Learn more about Endaoment
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
      <div
        className="absolute bottom-0 transform translate-y-[8px] rotate-45 w-4 h-4 bg-white border-r border-b border-gray-200"
        style={{
          right: position.arrowPosition ? 'auto' : '12rem',
          left: position.arrowPosition ? `${position.arrowPosition - 8}px` : 'auto',
        }}
      ></div>
    </div>
  );
}
