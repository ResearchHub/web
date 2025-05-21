'use client';

import { ReactNode, Fragment } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/utils/styles';

export interface AccordionItemProps {
  /**
   * The title of the accordion item - can be string or ReactNode for custom content
   */
  title: ReactNode;

  /**
   * Content to display when the accordion is open
   */
  children: ReactNode;

  /**
   * Whether the accordion item is expanded by default
   */
  defaultOpen?: boolean;

  /**
   * Additional class name for the accordion item container
   */
  className?: string;

  /**
   * Additional class name for the button element
   */
  buttonClassName?: string;

  /**
   * Additional class name for the panel element
   */
  panelClassName?: string;

  /**
   * Whether to use transitions for the panel
   */
  transition?: boolean;
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  className,
  buttonClassName,
  panelClassName,
  transition = false,
}: AccordionItemProps) {
  return (
    <Disclosure
      as="div"
      defaultOpen={defaultOpen}
      className={cn('border-b border-gray-200 rounded-lg border border-gray-200', className)}
    >
      {({ open }) => (
        <>
          <DisclosureButton
            className={cn(
              'flex w-full justify-between items-center p-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-primary-500 focus-visible:ring-opacity-50',
              buttonClassName
            )}
          >
            <div className="flex-1">{title}</div>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={cn(
                'h-4 w-4 text-gray-500 transition-transform duration-200',
                open ? 'transform rotate-180' : ''
              )}
            />
          </DisclosureButton>
          <div className="overflow-hidden">
            <DisclosurePanel
              transition={transition}
              className={cn(
                'p-4 text-sm text-gray-600',
                transition &&
                  'transition duration-200 ease-out data-closed:-translate-y-2 data-closed:opacity-0',
                panelClassName
              )}
            >
              {children}
            </DisclosurePanel>
          </div>
        </>
      )}
    </Disclosure>
  );
}

export interface AccordionProps {
  /**
   * AccordionItem components
   */
  children: ReactNode;

  /**
   * Additional class name for the accordion container
   */
  className?: string;
}

export function Accordion({ children, className }: AccordionProps) {
  return <div className={cn('flex flex-col gap-4 bg-white', className)}>{children}</div>;
}
