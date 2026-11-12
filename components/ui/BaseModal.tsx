'use client';

import { FC, Fragment, ReactNode, useRef, useLayoutEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';

const MODAL_SIZE_TO_MAX_WIDTH: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
} as const;

const MODAL_SIZE_TO_MIN_WIDTH: Record<string, string> = {
  sm: 'md:!min-w-[24rem]',
  md: 'md:!min-w-[28rem]',
  lg: 'md:!min-w-[32rem]',
  xl: 'md:!min-w-[36rem]',
  '2xl': 'md:!min-w-[42rem]',
} as const;

export type ModalSize = keyof typeof MODAL_SIZE_TO_MAX_WIDTH;

const MODAL_TONE_CLASSES = {
  light: {
    overlay: 'bg-black/15',
    panel: 'bg-white',
    border: 'border-gray-200',
    title: 'text-gray-900',
    close: 'text-gray-400 hover:text-gray-500',
    footer: 'bg-white',
    footerShadow: '0 -4px 12px -4px rgba(0,0,0,0.10)', // Only top shadow
  },
  dark: {
    overlay: 'bg-black/60',
    panel: 'bg-[#070b18] ring-1 ring-white/10',
    border: 'border-white/10',
    title: 'text-white',
    close: 'text-white/50 hover:bg-white/10 hover:text-white',
    footer: 'bg-[#070b18]',
    footerShadow: 'none',
  },
};

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  initialFocus?: React.MutableRefObject<HTMLElement | null>;
  /** Modal title - can be a string or custom ReactNode for complex headers */
  title?: ReactNode;
  /** Preset size (sm, md, lg, xl, 2xl). When set, overrides maxWidth for the panel width. */
  size?: ModalSize;
  /** (e.g. 'max-w-md', 'max-w-xl'). Omit to use default (max-w-tablet). */
  maxWidth?: string;
  showCloseButton?: boolean;
  padding?: string; // e.g., 'p-4', 'p-6', 'p-8'
  footer?: ReactNode;
  headerAction?: ReactNode;
  className?: string; // Additional classes to override default styling
  contentClassName?: string; // Additional classes for the scrollable content wrapper
  /** Optional banner image displayed above the header */
  headerImage?: string;
  headerImageHeight?: string;
  /** `dark` is for pages on a dark ground, such as the giving pages. */
  tone?: keyof typeof MODAL_TONE_CLASSES;
}

export const BaseModal: FC<BaseModalProps> = ({
  isOpen,
  onClose,
  children,
  initialFocus,
  title,
  size,
  maxWidth,
  showCloseButton = true,
  padding = 'p-6', // Default padding
  footer,
  headerAction,
  className,
  contentClassName,
  headerImage,
  headerImageHeight = 'h-[100px]',
  tone = 'light',
}) => {
  const toneClasses = MODAL_TONE_CLASSES[tone];
  const effectiveMaxWidth = size ? MODAL_SIZE_TO_MAX_WIDTH[size] : (maxWidth ?? 'max-w-tablet');
  const effectiveMinWidth = size ? MODAL_SIZE_TO_MIN_WIDTH[size] : undefined;

  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  // Determine if modal should be full screen (no title and no footer)
  const isFullScreen = !title && !footer;

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
          <div
            className={cn('fixed inset-0', toneClasses.overlay)}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </Transition.Child>

        {/* Modal Container */}
        <div
          className={cn('fixed inset-0', isFullScreen ? 'overflow-hidden' : 'overflow-y-auto')}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {/* Centering Flex Container - Apply padding on md screens and up */}
          <div
            className="flex min-h-full items-center justify-center p-0 md:!p-4 text-center"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
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
                  'transform overflow-hidden text-left align-middle shadow-xl transition-all',
                  toneClasses.panel,
                  // Full width on mobile, constrained width on larger screens
                  isFullScreen ? 'w-full' : 'w-full md:!w-auto',
                  // Full height on mobile, constrained height on md+
                  isFullScreen ? 'h-screen' : 'h-screen md:!h-auto md:!max-h-[85vh]',
                  // No rounded corners on mobile, rounded on md+ (unless full screen)
                  isFullScreen ? '' : 'md:!rounded-2xl',
                  // Apply width constraints on md and up (unless full screen)
                  isFullScreen ? '' : cn(effectiveMinWidth, effectiveMaxWidth),
                  // Custom className overrides
                  className
                )}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {headerImage && (
                  <div
                    className={cn('relative w-full flex-shrink-0 bg-gray-100', headerImageHeight)}
                  >
                    <Image src={headerImage} alt="" fill className="object-cover" sizes="600px" />
                    {showCloseButton && (
                      <Button
                        onClick={onClose}
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 z-10 bg-black/40 hover:bg-black/60 text-white hover:text-white rounded-full"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                )}
                {!headerImage && (showCloseButton || title) && (
                  <div ref={headerRef} className="relative">
                    <div
                      className={cn(
                        'border-b px-6 py-4 flex items-center justify-between gap-4',
                        toneClasses.border
                      )}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        {headerAction}
                        {title && (
                          <Dialog.Title
                            as="h2"
                            className={cn(
                              'text-lg font-medium ml-2 min-w-0 flex-1',
                              toneClasses.title
                            )}
                          >
                            {title}
                          </Dialog.Title>
                        )}
                      </div>
                      {showCloseButton && (
                        <Button
                          onClick={onClose}
                          variant="ghost"
                          size="icon"
                          className={toneClasses.close}
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
                  className={cn(padding, 'flex-1 overflow-y-auto', contentClassName)}
                  style={
                    isFullScreen
                      ? undefined
                      : {
                          maxHeight: `calc(100vh - ${headerHeight + footerHeight}px)`,
                        }
                  }
                >
                  {children}
                </div>
                {/* Sticky Footer */}
                {footer && (
                  <div
                    ref={footerRef}
                    className={cn(
                      'border-t px-6 py-4 sticky bottom-0 z-10',
                      toneClasses.border,
                      toneClasses.footer
                    )}
                    style={{
                      boxShadow: toneClasses.footerShadow,
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
