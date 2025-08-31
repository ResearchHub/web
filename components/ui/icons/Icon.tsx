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
  | 'notebookBold'
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
  | 'rscBold1'
  | 'rscBold2'
  | 'rscThin'
  | 'rscFlask'
  | 'RSC'
  // Solid icons
  | 'solidHand'
  | 'solidNotebook'
  | 'solidCoin'
  | 'solidBook'
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
  // Analytics icons
  | 'upChart1'
  | 'upChart2'
  | 'gauge'
  // Interactive icons
  | 'settings'
  | 'comment'
  | 'upvote'
  | 'report'
  | 'lightening'
  | 'solid'
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
  | 'solidEarn'
  | 'giveRSC'
  | 'researchhubVector'
  | 'tipRSC'
  | 'education'
  | 'socialMedia'
  | 'memberFor'
  | 'edit'
  | 'editor'
  | 'admin'
  | 'tipRSC'
  | 'userCircle';

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

  /**
   * Color to apply to the SVG
   * If provided, will display the icon with the specified color
   */
  color?: string;
}

/**
 * Icon component that can display any SVG from the public/icons directory.
 * Supports color customization when the color prop is provided.
 */
export const Icon: FC<IconProps> = ({ name, size = 24, className = '', color }) => {
  // Apply a CSS filter if color is provided
  // We'll use a mask-image approach which works well across browsers
  const imgStyles = color
    ? {
        WebkitMaskImage: `url(/icons/${name}.svg)`,
        maskImage: `url(/icons/${name}.svg)`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        backgroundColor: color,
        width: size,
        height: size,
        display: 'inline-block',
      }
    : {};

  if (color) {
    return <div style={imgStyles} className={className} />;
  }

  // Default: use the Image component
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
