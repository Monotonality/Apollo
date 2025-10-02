import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types/user';
import { COLLECTIONS } from '../types/firebase';
import { PageContainer, Header, LoadingSpinner, Card, RoleBadge } from './common';
import { getIconProps } from '../utils/assets';

interface DirectoryProps {
  currentUser: UserProfile;
  onSignOut: () => void;
  onNavigate?: (page: string) => void;
}

const Directory: React.FC<DirectoryProps> = ({ currentUser, onSignOut, onNavigate }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersQuery = query(
          collection(db, COLLECTIONS.USER),
          orderBy('USER_FNAME', 'asc')
        );
        const querySnapshot = await getDocs(usersQuery);
        
        const usersList: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          usersList.push({
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            lastLoginAt: data.lastLoginAt?.toDate()
          } as UserProfile);
        });
        
        setUsers(usersList);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load directory');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatLinkedInUrl = (linkedin: string): string => {
    if (!linkedin) return '';
    if (linkedin.startsWith('http')) return linkedin;
    if (linkedin.startsWith('linkedin.com') || linkedin.startsWith('www.linkedin.com')) {
      return `https://${linkedin}`;
    }
    return `https://linkedin.com/in/${linkedin}`;
  };


  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner message="Loading directory..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc3545' }}>{error}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header
        title="Member Directory"
        subtitle={`${users.length} member${users.length !== 1 ? 's' : ''} in the organization`}
        onBack={() => {
          if (onNavigate) {
            onNavigate('dashboard');
          } else {
            window.history.back();
          }
        }}
        backLabel="Back to Dashboard"
        onSignOut={onSignOut}
      />

      {/* Directory Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {users.map((user) => (
          <Card
            key={user.uid}
            hoverable
            style={{ margin: 0 }}
          >
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

            {/* Additional Info */}
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
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          color: '#666'
        }}>
          <p>No members found in the directory.</p>
        </div>
      )}
    </PageContainer>
  );
};

export default Directory;
