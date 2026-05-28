'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CopyButtonProps {
  value: string;
  size?: number;
}

export function CopyButton({ value, size = 12 }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error('Failed to copy'));
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center shrink-0 p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors"
    >
      {copied ? <Check size={size} /> : <Copy size={size} />}
    </button>
  );
}
