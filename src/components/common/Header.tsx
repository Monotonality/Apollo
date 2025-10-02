import React, { useState } from 'react';
import Button from './Button';
import Logo from './Logo';
import UserInfo from './UserInfo';
import './Header.css';

interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

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
  navItems?: NavItem[];
  currentPath?: string;
  onNavigate?: (path: string) => void;
  style?: React.CSSProperties;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  user,
  onSignOut,
  onBack,
  backLabel = 'Back',
  navItems = [],
  currentPath = '',
  onNavigate,
  style = {}
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
    setIsMobileMenuOpen(false);
  };


  return (
    <header className="header" style={style}>
      <div className="top-bar">
        <div className="title-section">
          <Logo size={32} />
          <div>
            <h1 className="title">{title}</h1>
            {subtitle && (
              <p className="subtitle">{subtitle}</p>
            )}
          </div>
        </div>

        {/* User Section */}
        {user && (
          <UserInfo 
            user={user}
            onSignOut={onSignOut}
            showDropdown={true}
          />
        )}

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Actions */}
        <div className="actions">
          {onBack && (
            <Button
              variant="secondary"
              size="medium"
              onClick={onBack}
            >
              {backLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Container */}
      <div className="nav-container">
        {/* Desktop Navigation */}
        <nav className="navigation">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`mobile-nav-item ${currentPath === item.path ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
