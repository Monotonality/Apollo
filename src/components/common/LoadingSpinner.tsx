import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  style?: React.CSSProperties;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  style = {}
}) => {
  const getSizeStyles = (): React.CSSProperties => {
    const sizes = {
      small: {
        width: '20px',
        height: '20px',
        borderWidth: '2px'
      },
      medium: {
        width: '40px',
        height: '40px',
        borderWidth: '4px'
      },
      large: {
        width: '60px',
        height: '60px',
        borderWidth: '6px'
      }
    };
    return sizes[size];
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    ...style
  };

  const spinnerStyles: React.CSSProperties = {
    border: `${getSizeStyles().borderWidth} solid #f3f3f3`,
    borderTop: `${getSizeStyles().borderWidth} solid #154734`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    ...getSizeStyles()
  };

  const messageStyles: React.CSSProperties = {
    marginTop: '1rem',
    color: '#666',
    fontSize: '1rem'
  };

  return (
    <div style={containerStyles}>
      <div style={spinnerStyles}></div>
      {message && (
        <p style={messageStyles}>{message}</p>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
