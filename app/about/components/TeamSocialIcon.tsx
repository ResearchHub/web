import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin, faSquareXTwitter } from '@fortawesome/free-brands-svg-icons';
import { cn } from '@/utils/styles';
import { type SocialKey } from './data/team';

interface TeamSocialIconProps {
  kind: SocialKey;
  className?: string;
}

const BRAND_COLORS: Record<SocialKey, string> = {
  x: 'text-black',
  linkedin: 'text-[#0A66C2]',
  github: 'text-[#181717]',
  rh: '',
};

export const TeamSocialIcon = ({ kind, className }: TeamSocialIconProps) => {
  const color = BRAND_COLORS[kind];
  switch (kind) {
    case 'x':
      return (
        <FontAwesomeIcon icon={faSquareXTwitter} className={cn(color, className)} aria-hidden />
      );
    case 'linkedin':
      return <FontAwesomeIcon icon={faLinkedin} className={cn(color, className)} aria-hidden />;
    case 'github':
      return <FontAwesomeIcon icon={faGithub} className={cn(color, className)} aria-hidden />;
    case 'rh':
      return <Image src="/flask.webp" alt="" width={18} height={18} className={className} />;
    default:
      return null;
  }
};
