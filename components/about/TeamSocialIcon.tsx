import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin, faSquareXTwitter } from '@fortawesome/free-brands-svg-icons';
import { cn } from '@/utils/styles';
import { SocialKey } from './data/team';

interface TeamSocialIconProps {
  kind: SocialKey;
  className?: string;
}

/**
 * Each social icon renders in its own well-known brand color (X = black,
 * LinkedIn = LinkedIn blue, GitHub = GitHub near-black). Brand marks are a
 * deliberate exception to the project's palette-purity rule because their
 * recognizability depends on the canonical brand color.
 */
const BRAND_ICON_CLASSES: Record<SocialKey, string> = {
  x: 'text-black',
  linkedin: 'text-[#0A66C2]',
  github: 'text-[#181717]',
  rh: '',
};

export const TeamSocialIcon = ({ kind, className }: TeamSocialIconProps) => {
  const brand = BRAND_ICON_CLASSES[kind];
  switch (kind) {
    case 'x':
      return (
        <FontAwesomeIcon icon={faSquareXTwitter} className={cn(brand, className)} aria-hidden />
      );
    case 'linkedin':
      return <FontAwesomeIcon icon={faLinkedin} className={cn(brand, className)} aria-hidden />;
    case 'github':
      return <FontAwesomeIcon icon={faGithub} className={cn(brand, className)} aria-hidden />;
    case 'rh':
      return <Image src="/flask.webp" alt="" width={18} height={18} className={className} />;
    default:
      return null;
  }
};

export const SOCIAL_LABELS: Record<SocialKey, string> = {
  x: 'X / Twitter',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  rh: 'ResearchHub',
};

export const SOCIAL_ORDER: SocialKey[] = ['x', 'github', 'linkedin', 'rh'];
