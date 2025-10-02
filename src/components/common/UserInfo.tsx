import React, { useState } from 'react';
import './UserInfo.css';

interface UserInfoProps {
  user: {
    displayName: string;
    role: string;
  };
  onSignOut?: () => void;
  showDropdown?: boolean;
}

const UserInfo: React.FC<UserInfoProps> = ({ 
  user, 
  onSignOut,
  showDropdown = true 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getInitials = (displayName: string) => {
    const names = displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  };

  const handleUserSectionClick = () => {
    if (showDropdown) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    if (onSignOut) {
      onSignOut();
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isDropdownOpen && !target.closest('.user-info-section')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, showDropdown]);

  return (
    <div 
      className={`user-info-section ${showDropdown ? 'clickable' : ''}`}
      onClick={handleUserSectionClick}
    >
      <div className="user-avatar">
        {getInitials(user.displayName)}
      </div>
      <div className="user-info">
        <p className="user-name">{user.displayName}</p>
        <p className="user-role">{user.role}</p>
      </div>
      
      {/* User Dropdown */}
      {showDropdown && isDropdownOpen && (
        <div className="user-dropdown">
          <div className="dropdown-item">
            <span>Profile</span>
          </div>
          <div className="dropdown-item">
            <span>Settings</span>
          </div>
          <div className="dropdown-divider"></div>
          <button className="dropdown-item danger" onClick={handleSignOut}>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
