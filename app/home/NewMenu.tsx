'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Popover, Transition } from '@headlessui/react';
import { ChevronRight, Plus } from 'lucide-react';
import Icon from '@/components/ui/icons/Icon';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { cn } from '@/utils/styles';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import {
  OpenFundingOpportunityModal,
  type FundingOpportunityCreationMethod,
} from '@/components/Funding/OpenFundingOpportunityModal';
import {
  OpenProposalModal,
  type ProposalCreationMethod,
} from '@/components/Funding/OpenProposalModal';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  badge?: string;
  onSelect: () => void;
}

function ActionRow({ item, onClose }: { item: ActionItem; onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        onClose();
        item.onSelect();
      }}
      className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
    >
      <div
        className={cn(
          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ring-1 ring-inset ring-black/5',
          item.iconBg
        )}
      >
        {item.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{item.title}</span>
          {item.badge && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-[11px] font-semibold text-green-700">
              {item.badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-500">{item.description}</p>
      </div>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" />
    </button>
  );
}

interface NewMenuProps {
  /** 'fab' renders the fixed bottom-right floating button; 'topbar' renders an
   *  inline CTA whose menu drops down below the bar; 'sidebar' renders the
   *  raised block button the app's left nav uses for Publish. */
  variant?: 'fab' | 'topbar' | 'sidebar';
}

export function NewMenu({ variant = 'fab' }: NewMenuProps) {
  const router = useRouter();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const isTopbar = variant === 'topbar';
  const isSidebar = variant === 'sidebar';
  // Both of these anchor a panel that drops below the trigger; only the fab
  // opens upwards.
  const dropsDown = isTopbar || isSidebar;
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  const items: ActionItem[] = [
    {
      id: 'funding-opportunity',
      title: 'RFP',
      description: 'Fund research',
      icon: <Icon name="fund" size={18} color="#0d4ac4" />,
      iconBg: 'bg-primary-50',
      onSelect: () => executeAuthenticatedAction(() => setIsFundingModalOpen(true)),
    },
    {
      id: 'proposal',
      title: 'Proposal',
      description: 'Raise money for your research',
      icon: <FundingIcon size={18} color="#0d4ac4" />,
      iconBg: 'bg-primary-50',
      onSelect: () => executeAuthenticatedAction(() => setIsProposalModalOpen(true)),
    },
    {
      id: 'peer-review',
      title: 'Peer review',
      badge: '$150',
      description: 'Review research and earn RSC',
      icon: <Icon name="earn1" size={18} color="#0d4ac4" />,
      iconBg: 'bg-primary-50',
      onSelect: () => executeAuthenticatedAction(() => router.push('/earn')),
    },
  ];

  return (
    <>
      <Popover
        className={cn(
          isTopbar && 'relative flex items-center',
          isSidebar && 'relative',
          !dropsDown && 'fixed bottom-6 right-6 z-50'
        )}
      >
        {({ open, close }) => (
          <>
            <Popover.Button
              className={cn(
                'inline-flex items-center gap-2 rounded-full text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2',
                isTopbar &&
                  cn(
                    'border border-gray-900 bg-white pl-3 pr-4 py-2 text-gray-900 hover:bg-gray-50',
                    open && 'bg-gray-100'
                  ),
                // Matches the app sidebar's Publish button: raised block, not a pill.
                isSidebar &&
                  cn(
                    'gap-2.5 rounded-lg bg-gray-100 px-5 py-3.5 text-[15px] font-medium text-gray-800 shadow-[rgba(0,_0,_0,_0.15)_1.95px_1.95px_2.6px] hover:bg-gray-50',
                    'tablet:max-sidebar-compact:!px-3',
                    open && 'bg-gray-50'
                  ),
                !dropsDown &&
                  cn(
                    'bg-primary-500 pl-4 pr-5 py-3 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600',
                    open && 'bg-primary-600'
                  )
              )}
            >
              <Plus
                className={cn(
                  'transition-transform duration-200',
                  isSidebar ? 'h-[22px] w-[22px] stroke-[1.5]' : 'w-5 h-5',
                  open && 'rotate-45'
                )}
              />
              <span className={isSidebar ? 'tablet:max-sidebar-compact:!hidden' : undefined}>
                Post
              </span>
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom={cn('opacity-0 scale-95', dropsDown ? '-translate-y-2' : 'translate-y-2')}
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo={cn('opacity-0 scale-95', dropsDown ? '-translate-y-2' : 'translate-y-2')}
            >
              <Popover.Panel
                className={cn(
                  'absolute z-50 w-[min(19rem,calc(100vw-3rem))] overflow-hidden rounded-xl bg-white text-left shadow-lg ring-1 ring-black/5',
                  isTopbar && 'right-0 top-full mt-2 origin-top-right',
                  // Opens into the content area rather than off the left edge.
                  isSidebar && 'left-0 top-full mt-2 origin-top-left',
                  !dropsDown && 'right-0 bottom-full mb-3 origin-bottom-right'
                )}
              >
                <p className="px-4 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  Create new
                </p>
                <div className="p-1.5 pt-0.5">
                  {items.map((item) => (
                    <ActionRow key={item.id} item={item} onClose={close} />
                  ))}
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>

      <OpenFundingOpportunityModal
        isOpen={isFundingModalOpen}
        onClose={() => setIsFundingModalOpen(false)}
        onConfirm={(method: FundingOpportunityCreationMethod) => {
          setIsFundingModalOpen(false);
          router.push(`/notebook?newGrant=true&grantSource=${method}`);
        }}
      />

      <OpenProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onConfirm={(method: ProposalCreationMethod) => {
          setIsProposalModalOpen(false);
          router.push(`/notebook?newFunding=true&proposalSource=${method}`);
        }}
      />
    </>
  );
}
