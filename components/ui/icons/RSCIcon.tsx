import { FC } from 'react';
import Icon from './Icon';

interface RSCIconProps {
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
   * Color to apply to the RSC icon
   * @default undefined (uses original colors)
   */
  color?: string;
}

/**
 * RSC Icon component with color customization support
 */
export const RSCIcon: FC<RSCIconProps> = ({ size = 24, className = '', color }) => {
  return <Icon name="rscIcon" size={size} className={className} color={color} />;
};

export default RSCIcon;
