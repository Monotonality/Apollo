import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  hoverable?: boolean;
  style?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  onClick,
  hoverable = false,
  style = {},
  headerStyle = {},
  bodyStyle = {},
  className
}) => {
  const baseCardStyles: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: hoverable ? 'all 0.2s ease' : 'none',
    cursor: onClick ? 'pointer' : 'default',
    ...style
  };

  const headerStyles: React.CSSProperties = {
    padding: '1rem 1.5rem',
    borderBottom: title || subtitle ? '1px solid #dee2e6' : 'none',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px 8px 0 0',
    ...headerStyle
  };

  const bodyStyles: React.CSSProperties = {
    padding: title || subtitle ? '1.5rem' : '1.5rem',
    ...bodyStyle
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    }
  };

  return (
    <div
      className={className}
      style={baseCardStyles}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {(title || subtitle) && (
        <div style={headerStyles}>
          {title && (
            <h3 style={{ 
              margin: '0 0 0.5rem 0', 
              color: '#154734',
              fontSize: '1.25rem'
            }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{ 
              margin: 0, 
              color: '#666', 
              fontSize: '0.9rem' 
            }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div style={bodyStyles}>
        {children}
      </div>
    </div>
  );
};

export default Card;
