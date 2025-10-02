import React from 'react';
import { UserProfile } from '../../types/user';
import { Card, RoleBadge } from './index';
import { getIconProps } from '../../utils/assets';

interface UserCardProps {
  user: UserProfile;
  showContactInfo?: boolean;
  showAdditionalInfo?: boolean;
  style?: React.CSSProperties;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  showContactInfo = true, 
  showAdditionalInfo = true,
  style = {}
}) => {
  const formatLinkedInUrl = (linkedin: string) => {
    if (!linkedin) return '';
    if (linkedin.startsWith('http')) return linkedin;
    if (linkedin.startsWith('linkedin.com/')) return `https://${linkedin}`;
    return `https://linkedin.com/in/${linkedin}`;
  };

  return (
    <Card hoverable style={{ margin: 0, ...style }}>
      {/* User Info */}
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ 
          margin: '0 0 0.5rem 0', 
          color: '#154734',
          fontSize: '1.25rem'
        }}>
          {user.USER_FNAME} {user.USER_LNAME}
        </h3>
        
        <RoleBadge role={user.USER_ORG_ROLE} />
      </div>

      {/* Contact Info */}
      {showContactInfo && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <span style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Email:</span>
            <a 
              href={`mailto:${user.email}`}
              style={{ 
                color: '#0d6efd', 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <img {...getIconProps('email', 16)} />
              {user.email}
            </a>
          </div>

          {user.USER_LINKEDIN && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: '0.9rem'
            }}>
              <span style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>LinkedIn:</span>
              <a
                href={formatLinkedInUrl(user.USER_LINKEDIN)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#0077b5',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <img {...getIconProps('linkedin', 16)} />
                View Profile
                <span style={{ fontSize: '0.8rem' }}>(opens in new tab)</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Additional Info */}
      {showAdditionalInfo && (
        <div style={{ 
          fontSize: '0.8rem', 
          color: '#666', 
          borderTop: '1px solid #eee', 
          paddingTop: '0.75rem' 
        }}>
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>Member since:</strong> {user.createdAt.toLocaleDateString()}
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>Status:</strong> {user.USER_IS_ACTIVE ? 'Active' : 'Inactive'}
          </div>
          {user.USER_TOTAL_VOL > 0 && (
            <div>
              <strong>Volunteer hours:</strong> {user.USER_TOTAL_VOL}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default UserCard;
