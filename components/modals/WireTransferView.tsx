'use client';

import { useState } from 'react';
import { Copy, Check, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WireDetail {
  label: string;
  value: string;
}

// Placeholder wire details - will be replaced with real values
const wireDetails: WireDetail[] = [
  { label: 'Recipient name', value: 'ResearchHub Foundation' },
  { label: 'Recipient address', value: '548 Market St, Suite 100, San Francisco, CA 94104' },
  { label: 'Account number', value: '1234567890' },
  { label: 'Routing number', value: '987654321' },
  { label: 'Bank name', value: 'Silicon Valley Bank' },
  { label: 'Bank address', value: '2625 Augustine Drive, Suite 301, Santa Clara, CA 95054' },
  { label: 'Bank country', value: 'United States' },
];

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
      aria-label={`Copy ${label}`}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4 text-gray-400" />
      )}
    </button>
  );
}

function StepNumber({ number }: { number: number }) {
  return (
    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center">
      <span className="text-sm font-semibold text-white">{number}</span>
    </div>
  );
}

/**
 * Inline wire transfer view for use within the contribution modal.
 * Shows wire transfer details without the modal wrapper.
 */
export function WireTransferView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-600">
          To add funds, send a wire from your bank to ResearchHub using the details below. We'll
          email you when the transfer is complete.
        </p>
      </div>

      {/* Step 1: Begin wire transfer */}
      <div className="flex items-start gap-4">
        <StepNumber number={1} />
        <div className="flex-1 pt-0.5">
          <p className="text-sm font-semibold text-gray-900">Begin your wire transfer</p>
          <p className="text-xs text-gray-600 mt-1">
            Initiate your bank-to-bank wire transfer through your online bank account. Ensure that
            you are sending a wire and not an ACH transfer.
          </p>
        </div>
      </div>

      {/* Step 2: Gather transfer details */}
      <div className="flex items-start gap-4">
        <StepNumber number={2} />
        <div className="flex-1 pt-0.5">
          <p className="text-sm font-semibold text-gray-900">Gather transfer details</p>
          <p className="text-xs text-gray-600 mt-1">
            Copy and paste the following transfer details where requested. Double-check all the
            information you've entered.
          </p>
        </div>
      </div>

      {/* Wire details table */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
        {wireDetails.map((detail, index) => (
          <div key={index} className="flex items-center justify-between px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{detail.label}</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{detail.value}</p>
            </div>
            <CopyButton text={detail.value} label={detail.label} />
          </div>
        ))}
      </div>

      {/* Processing Time */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <Clock className="h-5 w-5 text-gray-500" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Processing time</p>
          <p className="text-sm text-gray-600 mt-0.5">
            Funds will usually be credited to your ResearchHub account on the same day if submitted
            before 1pm PT. Otherwise, funds will be credited on the next business day.
          </p>
        </div>
      </div>
    </div>
  );
}
