import React from 'react';
import Button from './Button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  user?: {
    displayName: string;
    role: string;
  };
  onSignOut?: () => void;
  onBack?: () => void;
  backLabel?: string;
  style?: React.CSSProperties;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  user,
  onSignOut,
  onBack,
  backLabel = 'Back',
  style = {}
}) => {
  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #154734',
    ...style
  };

  const titleSectionStyles: React.CSSProperties = {
    flex: 1
  };

  const titleStyles: React.CSSProperties = {
    color: '#154734',
    margin: 0,
    fontSize: '2rem',
    fontWeight: 'bold'
  };

  const subtitleStyles: React.CSSProperties = {
    color: '#666',
    margin: '0.5rem 0 0 0',
    fontSize: '1rem'
  };

  const actionsStyles: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  };

  return (
    <header style={headerStyles}>
      <div style={titleSectionStyles}>
        <h1 style={titleStyles}>{title}</h1>
        {subtitle && (
          <p style={subtitleStyles}>{subtitle}</p>
        )}
        {user && (
          <p style={subtitleStyles}>
            Welcome, {user.displayName} ({user.role})
          </p>
        )}
      </div>
      
      <div style={actionsStyles}>
        {onBack && (
          <Button
            variant="secondary"
            size="medium"
            onClick={onBack}
          >
            {backLabel}
          </Button>
        )}
        {onSignOut && (
          <Button
            variant="danger"
            size="medium"
            onClick={onSignOut}
          >
            Sign Out
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
