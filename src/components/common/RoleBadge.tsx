import React from 'react';
import { UserRole } from '../../types/auth';

interface RoleBadgeProps {
  role: UserRole | null;
  size?: 'small' | 'medium' | 'large';
  style?: React.CSSProperties;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'medium',
  style = {}
}) => {
  const getRoleColor = (role: UserRole | null): string => {
    if (role === null) {
      return '#dc3545'; // Red for rejected users
    }
    
    const roleColors: { [key in UserRole]: string } = {
      'Data & Systems Officer': '#dc3545',
      'Dean': '#6f42c1',
      'Program Manager': '#fd7e14',
      'President': '#0d6efd',
      'Vice President': '#198754',
      'Internal Affairs Officer': '#20c997',
      'Finance Officer': '#ffc107',
      'Member': '#6c757d',
      'Inactive Member': '#adb5bd',
      'Pending User': '#f8f9fa'
    };
    return roleColors[role] || '#6c757d';
  };

  const getSizeStyles = (): React.CSSProperties => {
    const sizes = {
      small: {
        padding: '0.125rem 0.5rem',
        fontSize: '0.75rem'
      },
      medium: {
        padding: '0.25rem 0.75rem',
        fontSize: '0.875rem'
      },
      large: {
        padding: '0.375rem 1rem',
        fontSize: '1rem'
      }
    };
    return sizes[size];
  };

  const badgeStyles: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor: getRoleColor(role),
    color: role === 'Pending User' ? '#000' : 'white',
    borderRadius: '20px',
    fontWeight: 'bold',
    textAlign: 'center',
    ...getSizeStyles(),
    ...style
  };

  return (
    <span style={badgeStyles}>
      {role === null ? 'Rejected' : role}
    </span>
  );
};

export default RoleBadge;
