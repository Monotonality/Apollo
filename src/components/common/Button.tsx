import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  type = 'button',
  fullWidth = false,
  style = {}
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    const variants = {
      primary: {
        backgroundColor: '#154734',
        color: 'white',
        border: '1px solid #154734'
      },
      secondary: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: '1px solid #6c757d'
      },
      danger: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: '1px solid #dc3545'
      },
      success: {
        backgroundColor: '#198754',
        color: 'white',
        border: '1px solid #198754'
      },
      warning: {
        backgroundColor: '#ffc107',
        color: '#000',
        border: '1px solid #ffc107'
      }
    };
    return variants[variant];
  };

  const getSizeStyles = (): React.CSSProperties => {
    const sizes = {
      small: {
        padding: '0.25rem 0.75rem',
        fontSize: '0.875rem'
      },
      medium: {
        padding: '0.5rem 1rem',
        fontSize: '1rem'
      },
      large: {
        padding: '0.75rem 1.5rem',
        fontSize: '1.125rem'
      }
    };
    return sizes[size];
  };

  const baseStyles: React.CSSProperties = {
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-block',
    textAlign: 'center',
    textDecoration: 'none',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.opacity = '0.8';
      e.currentTarget.style.transform = 'translateY(-1px)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.opacity = '1';
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={baseStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
};

export default Button;
