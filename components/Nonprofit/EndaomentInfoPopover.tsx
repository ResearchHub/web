'use client';

import { ExternalLink, X } from 'lucide-react';

interface EndaomentInfoPopoverProps {
  position: { top: number; left: number };
  onClose: () => void;
}

export function EndaomentInfoPopover({ position, onClose }: EndaomentInfoPopoverProps) {
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
          <h3 className="text-base font-semibold text-gray-900">About Fiscal Sponsorship</h3>
          <button
            className="nonprofit-popover-close text-gray-400 hover:text-gray-600 p-1"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-gray-600 max-h-80 overflow-y-auto pr-1">
          <p>
            <span className="font-medium text-gray-800">Endaoment</span> is a nonprofit community
            foundation that processes donations from users directly to university nonprofits on
            behalf of researchers.
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
            through their fiscal sponsorship program, ensuring your research receives funding while
            maintaining compliance with tax regulations.
          </p>

          <div className="pt-2">
            <a
              href="https://endaoment.org"
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
      <div className="absolute bottom-0 right-12 transform translate-y-[8px] rotate-45 w-4 h-4 bg-white border-r border-b border-gray-200"></div>
    </div>
  );
}
