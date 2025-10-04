import React from 'react';

export interface AlertProps {
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  style,
  className
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: '#d4edda',
          borderColor: '#c3e6cb',
          color: '#155724',
          borderLeft: '4px solid #28a745'
        };
      case 'warning':
        return {
          backgroundColor: '#fff3cd',
          borderColor: '#ffeaa7',
          color: '#856404',
          borderLeft: '4px solid #ffc107'
        };
      case 'error':
        return {
          backgroundColor: '#f8d7da',
          borderColor: '#f5c6cb',
          color: '#721c24',
          borderLeft: '4px solid #dc3545'
        };
      case 'info':
      default:
        return {
          backgroundColor: '#d1ecf1',
          borderColor: '#bee5eb',
          color: '#0c5460',
          borderLeft: '4px solid #17a2b8'
        };
    }
  };

  const baseStyles: React.CSSProperties = {
    padding: '1rem',
    marginBottom: '1rem',
    border: '1px solid',
    borderRadius: '4px',
    fontSize: '1rem',
    lineHeight: '1.5',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    ...getVariantStyles(),
    ...style
  };

  const iconStyles: React.CSSProperties = {
    fontSize: '1.25rem',
    flexShrink: 0,
    marginTop: '0.125rem'
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
    minWidth: 0
  };

  const titleStyles: React.CSSProperties = {
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
    fontSize: '1.1rem'
  };

  const messageStyles: React.CSSProperties = {
    margin: title ? '0' : '0',
    wordWrap: 'break-word'
  };

  const dismissButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0',
    marginLeft: '0.5rem',
    flexShrink: 0,
    opacity: 0.7,
    transition: 'opacity 0.2s ease'
  };

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const handleDismissClick = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div 
      style={baseStyles} 
      className={className}
      role="alert"
      aria-live="polite"
    >
      <div style={iconStyles} aria-hidden="true">
        {getIcon()}
      </div>
      
      <div style={contentStyles}>
        {title && (
          <div style={titleStyles}>
            {title}
          </div>
        )}
        <div style={messageStyles}>
          {message}
        </div>
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={handleDismissClick}
          style={dismissButtonStyles}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
          aria-label="Dismiss alert"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
