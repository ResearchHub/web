'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useConnectOrcid } from '@/components/Orcid/lib/hooks/useConnectOrcid';
import { ButtonProps } from '@/components/ui/Button';

interface OrcidConnectButtonProps {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
}

export function OrcidConnectButton({
  variant = 'outlined',
  size = 'default',
  className,
}: OrcidConnectButtonProps) {
  const { connect, isConnecting } = useConnectOrcid();

  return (
    <Button
      onClick={connect}
      disabled={isConnecting}
      variant={variant}
      size={size}
      className={className}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isConnecting ? 'animate-spin' : ''}`} />
      {isConnecting ? 'Connecting…' : 'Connect ORCID'}
    </Button>
  );
}
