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
  footer?: ReactNode;
  headerAction?: ReactNode;
  fixedWidth?: boolean;
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
  footer,
  headerAction,
  fixedWidth = false,
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  useLayoutEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
    if (footerRef.current) {
      setFooterHeight(footerRef.current.offsetHeight);
    }

    const handleResize = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
      if (footerRef.current) {
        setFooterHeight(footerRef.current.offsetHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" initialFocus={initialFocus} onClose={onClose}>
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
          {/* Centering Flex Container - Apply padding on md screens and up */}
          <div className="flex min-h-full items-center justify-center p-0 md:!p-4 text-center">
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
                  fixedWidth ? `w-full ${maxWidth} mx-auto` : 'w-full md:!w-auto',
                  // Full height on mobile, constrained height on md+
                  'h-screen md:!h-auto md:!max-h-[85vh]',
                  // No rounded corners on mobile, rounded on md+
                  'md:!rounded-2xl',
                  // Only apply max width on md and up when not using fixedWidth
                  !fixedWidth && `md:${maxWidth}`
                )}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {(showCloseButton || title) && (
                  <div ref={headerRef} className="relative">
                    {/* Header with close button - only show for non-INTRO steps */}
                    <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                      {/* Left: headerAction */}
                      <div className="flex items-center">
                        {headerAction}
                        {title && (
                          <Dialog.Title as="h2" className="text-lg font-medium text-gray-900 ml-2">
                            {title}
                          </Dialog.Title>
                        )}
                      </div>
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
                  className={cn(
                    padding,
                    'flex-1 overflow-y-auto',
                    'max-h-[calc(100vh-var(--header-footer-height))] md:!max-h-[calc(85vh-var(--header-footer-height))]'
                  )}
                  style={
                    {
                      '--header-footer-height': `${headerHeight + footerHeight}px`,
                    } as React.CSSProperties
                  }
                >
                  {children}
                </div>
                {/* Sticky Footer */}
                {footer && (
                  <div
                    ref={footerRef}
                    className="border-t border-gray-200 px-6 py-4 bg-white sticky bottom-0 z-10"
                    style={{
                      boxShadow: '0 -4px 12px -4px rgba(0,0,0,0.10)', // Only top shadow
                    }}
                  >
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
