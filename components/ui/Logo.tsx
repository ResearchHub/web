import { cn } from '@/utils/styles';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  noText?: boolean;
  size?: number | { height: number; width: number };
  color?: string;
  variant?: 'default' | 'white';
}

export const Logo = ({ className, noText = false, size, variant = 'default' }: LogoProps) => {
  const dimensions = (() => {
    if (!size) return { height: 32, width: noText ? 23 : 150 };
    if (typeof size === 'number') {
      return noText
        ? { height: size, width: (size * 23) / 32 } // maintain beaker aspect ratio
        : { height: size, width: (size * 150) / 33 }; // maintain full logo aspect ratio
    }
    return size;
  })();

  const logoSrc = (() => {
    if (noText) {
      return variant === 'white' ? '/beaker_white.png' : '/RSC.webp';
    }
    return variant === 'white' ? '/icons/white_logo.png' : '/logo_blue.png';
  })();

  return (
    <Image
      src={logoSrc}
      alt="ResearchHub Logo"
      width={dimensions.width}
      height={dimensions.height}
      className={cn(className)}
    />
  );
};
