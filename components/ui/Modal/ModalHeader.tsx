'use client';

import { Dialog } from '@headlessui/react';
import { ArrowLeft, X } from 'lucide-react';
import { cn } from '@/utils/styles';

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onBack?: () => void;
  className?: string;
}

export function ModalHeader({
  title,
  subtitle,
  onClose,
  onBack,
  className,
}: ModalHeaderProps) {
  return (
    <div className={cn('border-b border-gray-200 -mx-6 px-6 pb-4 mb-6', className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-gray-500 hover:text-gray-600 p-1 -ml-1 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <Dialog.Title as="h2" className="text-xl font-semibold text-gray-900 leading-tight">
              {title}
            </Dialog.Title>
            {subtitle && (
              <p className="text-sm font-medium text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-500 p-1 -mr-1 transition-colors"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
