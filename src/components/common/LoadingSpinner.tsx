import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = '#154734',
  message
}) => {
  const sizeMap = {
    small: '40px',
    medium: '60px',
    large: '80px'
  };

  const dotSizeMap = {
    small: '8px',
    medium: '12px',
    large: '16px'
  };

  const loaderSize = sizeMap[size];
  const dotSize = dotSizeMap[size];
  const dotSizeHalf = `calc(${dotSize} / 2)`;
  const dotSizeHalfNeg = `calc(${dotSize} / -2)`;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: '200px',
      gap: '2rem'
    }}>
      <style>
        {`
          .loader {
            height: 15px;
            aspect-ratio: 5;
            display: grid;
            --_g: no-repeat radial-gradient(farthest-side, ${color} 94%, transparent);
          }
          .loader:before,
          .loader:after {
            content: "";
            grid-area: 1/1;
            background:
              var(--_g) left,
              var(--_g) right;
            background-size: 20% 100%;
            animation: l32 1s infinite; 
          }
          .loader:after { 
            background:
              var(--_g) calc(1*100%/3),
              var(--_g) calc(2*100%/3);
            background-size: 20% 100%;
            animation-direction: reverse;
          }
          @keyframes l32 {
            80%,100% {transform:rotate(.5turn)}
          }
        `}
      </style>
      <div className="loader"></div>
      {message && (
        <p style={{ 
          color: color, 
          fontSize: '1rem', 
          margin: 0,
          textAlign: 'center'
        }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;