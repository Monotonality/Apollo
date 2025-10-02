import React from 'react';
import { ASSET_PATHS } from '../../utils/assets';

interface LogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

/**
 * Apollo Logo Component - The main Black Comet logo
 */
export const Logo: React.FC<LogoProps> = ({ 
  size = 40, 
  className, 
  style,
  alt = "Apollo Organizational Management System"
}) => (
  <img 
    src={ASSET_PATHS.logos.comet}
    alt={alt}
    style={{ 
      width: size, 
      height: size, 
      objectFit: 'contain',
      ...style 
    }}
    className={className}
  />
);

export default Logo;
