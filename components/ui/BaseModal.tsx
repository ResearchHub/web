'use client';

import { FC, Fragment, ReactNode, useRef, useLayoutEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  initialFocus?: React.MutableRefObject<HTMLElement | null>;
  title?: string;
  maxWidth?: string; // e.g., 'max-w-md', 'max-w-xl', 'max-w-4xl'
  showCloseButton?: boolean;
  padding?: string; // e.g., 'p-4', 'p-6', 'p-8'
}

export const BaseModal: FC<BaseModalProps> = ({
  isOpen,
  onClose,
  children,
  initialFocus,
  title,
  maxWidth = 'max-w-tablet', // Default max width for larger screens
  showCloseButton = true,
  padding = 'p-6', // Default padding
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useLayoutEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }

    const handleResize = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
                  'w-full md:!w-auto',
                  // Full height on mobile, auto height on md+
                  'h-screen md:!h-auto',
                  // No rounded corners on mobile, rounded on md+
                  'md:!rounded-2xl',
                  // Only apply max width on md and up
                  `md:${maxWidth}`
                )}
              >
                {(showCloseButton || title) && (
                  <div ref={headerRef} className="relative">
                    {/* Header with close button - only show for non-INTRO steps */}
                    <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                      {title ? (
                        <div className="flex items-center">
                          <Dialog.Title as="h2" className="text-lg font-medium text-gray-900">
                            {title}
                          </Dialog.Title>
                        </div>
                      ) : (
                        <div />
                      )}
                      {showCloseButton && (
                        <Button
                          onClick={onClose}
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-gray-500"
                          aria-label="Close"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                {/* Modal Content */}
                <div
                  className={cn(padding)}
                  style={{
                    maxHeight: headerHeight
                      ? `calc(100vh - ${headerHeight}px)`
                      : 'calc(100vh - 72px)', // fallback (40+16+16)
                    overflowY: 'auto',
                  }}
                >
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
