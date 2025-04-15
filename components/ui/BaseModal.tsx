'use client';

import { FC, Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/utils/styles';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  initialFocus?: React.MutableRefObject<HTMLElement | null>;
  maxWidth?: string; // e.g., 'max-w-md', 'max-w-xl', 'max-w-4xl'
  showCloseButton?: boolean;
  padding?: string; // e.g., 'p-4', 'p-6', 'p-8'
}

export const BaseModal: FC<BaseModalProps> = ({
  isOpen,
  onClose,
  children,
  initialFocus,
  maxWidth = 'max-w-tablet', // Default max width for larger screens
  showCloseButton = true,
  padding = 'p-6', // Default padding
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" initialFocus={initialFocus} onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/15" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          {/* Centering Flex Container - Only apply padding on md screens and up */}
          <div className="flex min-h-full items-center justify-center text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* Dialog Panel with Responsive Styles */}
              <Dialog.Panel
                className={cn(
                  'transform overflow-hidden text-left align-middle shadow-xl transition-all bg-white',
                  // Full width on mobile, constrained width on larger screens
                  'w-full md:w-auto',
                  // Full height on mobile, auto height on md+
                  'h-screen md:h-auto',
                  // No rounded corners on mobile, rounded on md+
                  'md:rounded-2xl',
                  // Apply padding from props
                  padding,
                  // Only apply max width on md and up
                  `md:${maxWidth}`
                )}
              >
                {/* Optional Close Button */}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none z-10"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                )}
                {/* Modal Content */}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
