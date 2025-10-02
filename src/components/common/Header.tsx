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
  showUserInfo?: boolean;
  showAuthButtons?: boolean;
  showMobileMenu?: boolean;
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
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
  showUserInfo = true,
  showAuthButtons = false,
  showMobileMenu = true,
  onLoginClick,
  onSignUpClick,
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

  // Extract page name from title (e.g., "Apollo Dashboard" -> "Dashboard")
  const getPageName = (title: string) => {
    if (title.includes('Apollo ')) {
      return title.replace('Apollo ', '');
    }
    if (title === 'Member Directory') {
      return 'Directory';
    }
    return title;
  };


  return (
    <header className="header" style={style}>
      <div className="top-bar">
        <div className="title-section">
          <Logo size={32} />
          <div>
            <h1 className="title desktop-title">{title}</h1>
            <h1 className="title mobile-title">{getPageName(title)}</h1>
            {subtitle && (
              <p className="subtitle">{subtitle}</p>
            )}
          </div>
        </div>

        {/* User Section - Hidden on Mobile */}
        {user && showUserInfo && (
          <div className="desktop-user-info">
            <UserInfo 
              user={user}
              onSignOut={onSignOut}
              onNavigate={onNavigate}
              showDropdown={true}
            />
          </div>
        )}

        {/* Mobile User Avatar */}
        {user && showUserInfo && (
          <div className="mobile-user-avatar">
            <UserInfo 
              user={user}
              onSignOut={onSignOut}
              onNavigate={onNavigate}
              showDropdown={true}
              mobileOnly={true}
            />
          </div>
        )}

        {/* Auth Buttons for Landing Page */}
        {!user && showAuthButtons && (
          <div className="auth-buttons" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Button
              variant="secondary"
              size="medium"
              onClick={onLoginClick}
            >
              Login
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={onSignUpClick}
              style={{ backgroundColor: '#e87500', borderColor: '#e87500' }}
            >
              Sign Up
            </Button>
          </div>
        )}

        {/* Mobile Menu Button */}
        {showMobileMenu && (
          <button
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className={`hamburger-icon ${isMobileMenuOpen ? 'hidden' : ''}`}>
              ☰
            </span>
            <span className={`close-icon ${isMobileMenuOpen ? 'visible' : ''}`}>
              ✕
            </span>
          </button>
        )}

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
              className={`nav-item ${currentPath === item.path ? 'active' : ''} ${item.label === 'Members' ? 'members-nav' : ''} ${item.label === 'Committees' ? 'committees-nav' : ''} ${item.label === 'Admin' ? 'admin-nav' : ''}`}
              onClick={() => handleNavClick(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`mobile-nav-item ${currentPath === item.path ? 'active' : ''} ${item.label === 'Members' ? 'members-nav' : ''} ${item.label === 'Committees' ? 'committees-nav' : ''} ${item.label === 'Admin' ? 'admin-nav' : ''}`}
                onClick={() => handleNavClick(item.path)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
