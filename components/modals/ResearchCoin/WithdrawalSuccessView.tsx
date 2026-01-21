import { NetworkConfig } from '@/constants/tokens';
import { TransactionSuccessView } from './shared/TransactionSuccessView';

interface WithdrawalSuccessViewProps {
  withdrawAmount: number;
  fee: number;
  amountReceived: number;
  networkConfig: NetworkConfig;
  address: string;
}

export function WithdrawalSuccessView({
  withdrawAmount,
  fee,
  amountReceived,
  networkConfig,
  address,
}: WithdrawalSuccessViewProps) {
  return (
    <TransactionSuccessView
      title="Withdrawal Successful!"
      subtitle="Your RSC has been sent to your wallet"
      amount={withdrawAmount}
      networkConfig={networkConfig}
      address={address}
      addressLabel="To Address"
      amountLabel="Amount Withdrawn"
      amountColor="gray"
      fee={fee}
      amountReceived={amountReceived}
    />
  );
}
