import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: string;
  style?: React.CSSProperties;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = '1200px',
  style = {}
}) => {
  const containerStyles: React.CSSProperties = {
    padding: '0.5rem 2rem 2rem 2rem',
    maxWidth,
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    ...style
  };

  return (
    <div style={containerStyles}>
      {children}
    </div>
  );
};

export default PageContainer;
