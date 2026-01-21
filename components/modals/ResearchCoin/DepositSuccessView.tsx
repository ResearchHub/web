import { NetworkConfig } from '@/constants/tokens';
import { TransactionSuccessView } from './shared/TransactionSuccessView';

interface DepositSuccessViewProps {
  depositAmount: number;
  networkConfig: NetworkConfig;
  address: string;
}

export function DepositSuccessView({
  depositAmount,
  networkConfig,
  address,
}: DepositSuccessViewProps) {
  return (
    <TransactionSuccessView
      title="Deposit Successful!"
      subtitle="Your RSC is being processed"
      amount={depositAmount}
      networkConfig={networkConfig}
      address={address}
      addressLabel="From Address"
      amountLabel="Amount Deposited"
      amountColor="green"
      showProcessingTime={true}
      processingTimeMessage="It can take up to 10-20 minutes for the deposit to appear in your ResearchHub balance."
    />
  );
}
