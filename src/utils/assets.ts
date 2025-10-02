/**
 * Asset utility functions for consistent asset path management
 */

/**
 * Get the path to a public asset
 * @param path - The path relative to the public directory (without leading slash)
 * @returns The full path to the asset
 */
export const getAssetPath = (path: string): string => {
  return `/${path}`;
};

/**
 * Get the path to an image asset
 * @param category - The image category (logos, icons, backgrounds)
 * @param filename - The filename with extension
 * @returns The full path to the image asset
 */
export const getImagePath = (category: 'logos' | 'icons' | 'backgrounds', filename: string): string => {
  return getAssetPath(`assets/images/${category}/${filename}`);
};

/**
 * Predefined asset paths for common icons
 */
export const ASSET_PATHS = {
  icons: {
    linkedin: getImagePath('icons', 'linkedin-icon.svg'),
    email: getImagePath('icons', 'email-icon.svg'),
    user: getImagePath('icons', 'user-icon.svg'),
  },
  logos: {
    apollo: getImagePath('logos', 'apollo-logo.png'),
    utd: getImagePath('logos', 'utd-logo.png'),
  },
  backgrounds: {
    hero: getImagePath('backgrounds', 'hero-bg.jpg'),
  },
} as const;

/**
 * Get icon props for consistent styling
 */
export const getIconProps = (iconType: 'linkedin' | 'email' | 'user', size: number = 16) => ({
  src: ASSET_PATHS.icons[iconType],
  alt: iconType.charAt(0).toUpperCase() + iconType.slice(1),
  style: { width: size, height: size }
});
