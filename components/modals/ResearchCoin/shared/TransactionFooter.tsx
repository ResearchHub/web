import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TransactionFooterProps {
  txHash?: string;
  blockExplorerUrl: string;
  children?: React.ReactNode;
}

export function TransactionFooter({ txHash, blockExplorerUrl, children }: TransactionFooterProps) {
  if (txHash) {
    const normalizedTxHash = txHash.startsWith('0x') ? txHash : `0x${txHash}`;
    return (
      <a
        href={`${blockExplorerUrl}/tx/${normalizedTxHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full"
      >
        <Button className="w-full" size="lg">
          View Transaction
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </a>
    );
  }

  return <>{children}</>;
}
