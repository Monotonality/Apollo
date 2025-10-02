import React from 'react';
import { getIconProps } from '../../utils/assets';

/**
 * LinkedIn Icon Component
 */
export const LinkedInIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 16, 
  className 
}) => (
  <img 
    {...getIconProps('linkedin', size)}
    className={className}
  />
);

/**
 * Email Icon Component
 */
export const EmailIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 16, 
  className 
}) => (
  <img 
    {...getIconProps('email', size)}
    className={className}
  />
);

/**
 * User Icon Component
 */
export const UserIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 16, 
  className 
}) => (
  <img 
    {...getIconProps('user', size)}
    className={className}
  />
);
