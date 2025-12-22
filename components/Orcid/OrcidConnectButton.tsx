'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { Loader2 } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/Button';
import { useConnectOrcid } from '@/components/Orcid/lib/hooks/useConnectOrcid';

interface OrcidConnectButtonProps {
  readonly variant?: ButtonProps['variant'];
  readonly size?: ButtonProps['size'];
  readonly className?: string;
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
      {isConnecting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FontAwesomeIcon icon={faOrcid} className="mr-2 h-4 w-4" />
      )}
      {isConnecting ? 'Connecting...' : 'Connect ORCID'}
    </Button>
  );
}
