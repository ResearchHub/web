import Image from 'next/image';
import { NetworkSelector } from '@/components/ui/NetworkSelector';
import { NETWORK_CONFIG, NetworkType } from '@/constants/tokens';

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
      <div className="flex items-center gap-2">
        <span className="text-[15px] text-gray-700">Network</span>
        <div className="flex items-center gap-2">
          {(Object.keys(NETWORK_CONFIG) as NetworkType[]).map((network) => {
            const config = NETWORK_CONFIG[network];
            return (
              <Image
                key={network}
                src={config.icon}
                alt={`${config.name} logo`}
                width={20}
                height={20}
                className="flex-shrink-0"
              />
            );
          })}
        </div>
      </div>
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
