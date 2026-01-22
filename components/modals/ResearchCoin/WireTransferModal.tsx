'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

interface WireTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WireDetail {
  label: string;
  value: string;
  copyable?: boolean;
}

const wireDetails: WireDetail[] = [
  { label: 'Bank Name', value: 'Mercury Bank', copyable: true },
  { label: 'Account Name', value: 'ResearchHub Foundation', copyable: true },
  { label: 'Account Number', value: '••••••••1234', copyable: false },
  { label: 'Routing Number (ACH)', value: '••••••••5678', copyable: false },
  { label: 'Routing Number (Wire)', value: '••••••••9012', copyable: false },
  { label: 'Bank Address', value: '548 Market St, San Francisco, CA 94104', copyable: true },
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

export function WireTransferModal({ isOpen, onClose }: WireTransferModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Wire Transfer"
      padding="p-6"
      className="md:!w-[520px]"
    >
      <div className="space-y-6">
        <Alert variant="info">
          <div className="space-y-1">
            <p className="font-medium">For large deposits with no limits</p>
            <p className="text-sm opacity-90">
              Wire transfers typically take 1-3 business days to process. Your account will be
              credited once the transfer is confirmed.
            </p>
          </div>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Wire Transfer Details
          </h3>

          <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
            {wireDetails.map((detail, index) => (
              <div key={index} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{detail.label}</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">
                    {detail.value}
                  </p>
                </div>
                {detail.copyable && <CopyButton text={detail.value} label={detail.label} />}
              </div>
            ))}
          </div>
        </div>

        <Alert variant="warning">
          <div className="space-y-1">
            <p className="font-medium">Important</p>
            <p className="text-sm opacity-90">
              Please include your ResearchHub username or email in the wire transfer memo/reference
              field so we can match the deposit to your account.
            </p>
          </div>
        </Alert>

        <div className="pt-2">
          <p className="text-sm text-gray-600 mb-4">
            Need help with your wire transfer? Contact our support team.
          </p>
          <Button
            variant="outlined"
            className="w-full"
            onClick={() => window.open('mailto:support@researchhub.com', '_blank')}
          >
            <span>Contact Support</span>
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
