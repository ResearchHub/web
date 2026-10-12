'use client';

import { FC, Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Pinned under the scrolling body. */
  footer?: ReactNode;
  /** Width from the tablet breakpoint up; below it the panel takes the whole screen. */
  widthClassName?: string;
}

/**
 * A panel that slides in from the right over a dimmed page, for reading something
 * in full without leaving the list it came from.
 */
export const SidePanel: FC<SidePanelProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  widthClassName = 'tablet:max-w-[560px]',
}) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/20" aria-hidden />
      </Transition.Child>

      <div className="fixed inset-0 overflow-hidden">
        <div className="pointer-events-none fixed inset-y-0 right-0 flex w-full justify-end">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel
              className={cn(
                'pointer-events-auto flex h-full w-full flex-col bg-white shadow-2xl',
                widthClassName
              )}
            >
              <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-gray-200 px-4 py-3 tablet:px-6 tablet:py-4">
                <Dialog.Title
                  as="h2"
                  className="min-w-0 flex-1 text-base font-semibold text-gray-900"
                >
                  {title}
                </Dialog.Title>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0 rounded-full"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

              {footer && (
                <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 tablet:px-6">
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
