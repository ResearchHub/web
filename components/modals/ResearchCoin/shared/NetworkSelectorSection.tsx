import { NetworkSelector } from '@/components/ui/NetworkSelector';
import { NetworkType } from '@/constants/tokens';

interface NetworkSelectorSectionProps {
  selectedNetwork: NetworkType;
  onNetworkChange: (network: NetworkType) => void;
  disabled?: boolean;
  showDescription?: boolean;
  customBadges?: Partial<Record<NetworkType, string>>;
}

export function NetworkSelectorSection({
  selectedNetwork,
  onNetworkChange,
  disabled = false,
  showDescription = true,
  customBadges,
}: NetworkSelectorSectionProps) {
  return (
    <div className="space-y-2">
      <span className="text-[15px] text-gray-700">Network</span>
      <NetworkSelector
        value={selectedNetwork}
        onChange={onNetworkChange}
        disabled={disabled}
        showBadges={true}
        showDescription={showDescription}
        customBadges={customBadges}
      />
    </div>
  );
}
