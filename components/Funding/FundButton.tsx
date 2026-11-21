'use client';

import type { ReactNode } from 'react';
import { Coins, type LucideIcon } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/Button';
import { useFundPanel } from '@/components/Funding/FundPanelContext';
import { useGrantAllocateContext } from '@/components/Funding/GrantPageContext';
import { cn } from '@/utils/styles';

interface FundButtonProps {
  /** "Fund", or "Add to pool" on an RFP's pool card. */
  children: ReactNode;
  size?: ButtonProps['size'];
  className?: string;
  /** Coins for a fundraise. An award passes a trophy. */
  icon?: LucideIcon;
  'data-testid'?: string;
}

/** Opens the page's Fund panel: the coins and a label, in the brand blue. */
export function FundButton({
  children,
  size,
  className,
  icon: Icon = Coins,
  ...props
}: FundButtonProps) {
  const { openFundPanel } = useFundPanel();
  // On an RFP page, the click is a step of the RFP funnel, logged before the
  // panel's own amount step.
  const grantPage = useGrantAllocateContext();
  const open = () => {
    grantPage?.logFundClicked();
    openFundPanel();
  };
  return (
    <Button
      {...props}
      variant="default"
      size={size}
      onClick={open}
      className={cn('gap-2', className)}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Button>
  );
}
