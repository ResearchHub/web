import { FC } from 'react';
import Image from 'next/image';

// This type should include all the available icons
export type IconName =
  // Wallet icons
  | 'wallet1'
  | 'wallet2'
  | 'wallet3'
  | 'wallet5'
  | 'wallet6'
  // Home icons
  | 'home1'
  | 'home2'
  | 'home3'
  // Lab notebook icons
  | 'labNotebook'
  | 'labNotebook2'
  // Fund icons
  | 'fund'
  | 'fund2'
  | 'fundYourRsc'
  | 'fundYourRsc2'
  | 'fundYourRscText'
  // Earn icons
  | 'earn1'
  | 'earn2'
  | 'earn3'
  // RSC icons
  | 'rscVector'
  | 'rscBlueVector'
  | 'rscGoldVector'
  | 'rscIcon'
  | 'rscBlue'
  | 'rscGold'
  | 'rscGold2'
  | 'rscGrey'
  // Peer review icons
  | 'peerReview1'
  | 'peerReview2'
  // Journal icons
  | 'rhJournal1'
  | 'rhJournal2'
  // Review score icons
  | 'reviewScore1'
  | 'reviewScore2'
  // Verify icons
  | 'verify1'
  | 'verify2'
  // Submit icons
  | 'submit1'
  | 'submit2'
  // Other icons
  | 'logo'
  | 'profile'
  | 'notification'
  | 'views'
  | 'topics'
  | 'signOut'
  | 'metrics1'
  | 'metrics2'
  | 'doi'
  | 'license'
  | 'preprint'
  | 'openGrant'
  | 'claimPaper'
  | 'createBounty'
  | 'blueAndWhite'
  | 'whiteAndBlue'
  | 'gold1'
  | 'gold2'
  | 'flaskVector'
  | 'flaskFrame'
  | 'workType'
  | 'researchhubVector';

interface IconProps {
  /**
   * The name of the icon to display
   */
  name: IconName;

  /**
   * The size of the icon in pixels
   * @default 24
   */
  size?: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Icon component that can display any SVG from the public/icons directory.
 */
export const Icon: FC<IconProps> = ({ name, size = 24, className = '' }) => {
  return (
    <Image
      src={`/icons/${name}.svg`}
      alt={`${name} icon`}
      width={size}
      height={size}
      className={className}
    />
  );
};

export default Icon;
