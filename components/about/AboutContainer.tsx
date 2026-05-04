import { ReactNode } from 'react';
import { cn } from '@/utils/styles';

type ContainerWidth = 'narrow' | 'default' | 'wide';

interface AboutContainerProps {
  children: ReactNode;
  className?: string;
  width?: ContainerWidth;
}

const widthMap: Record<ContainerWidth, string> = {
  narrow: 'max-w-[780px]',
  default: 'max-w-[1120px]',
  wide: 'max-w-[1280px]',
};

export const AboutContainer = ({ children, className, width = 'default' }: AboutContainerProps) => {
  return (
    <div className={cn(widthMap[width], 'mx-auto px-4 sm:px-6 md:px-10', className)}>
      {children}
    </div>
  );
};
