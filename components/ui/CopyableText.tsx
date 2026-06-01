'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';
import { cn } from '@/utils/styles';

interface CopyableTextProps {
  value: string;
  size?: number;
  className?: string;
}

export function CopyableText({ value, size = 12, className }: Readonly<CopyableTextProps>) {
  const [copied, setCopied] = useState(false);
  const isTouchDevice = useIsTouchDevice();
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(resetTimeout.current), []);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        toast.success('Copied to clipboard');
        resetTimeout.current = setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error('Failed to copy'));
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${value}`}
      className="group inline-flex items-center gap-1 min-w-0 text-left"
    >
      <span className={cn('truncate min-w-0', className)}>{value}</span>
      <span
        className={cn(
          'shrink-0 text-gray-400 transition group-hover:text-gray-600',
          isTouchDevice ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}
      >
        {copied ? <Check size={size} /> : <Copy size={size} />}
      </span>
    </button>
  );
}

interface DetailValueProps {
  value: string;
  copyable?: boolean;
  size?: number;
  className?: string;
}

export function DetailValue({
  value,
  copyable = false,
  size,
  className,
}: Readonly<DetailValueProps>) {
  if (copyable) return <CopyableText value={value} size={size} className={className} />;
  return <span className={cn('truncate min-w-0', className)}>{value}</span>;
}
