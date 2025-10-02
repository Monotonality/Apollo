import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types/user';
import { COLLECTIONS } from '../types/firebase';
import { PageContainer, Header, LoadingSpinner, SearchBar } from './common';
import { getIconProps } from '../utils/assets';

interface DirectoryProps {
  currentUser: UserProfile;
  onSignOut: () => void;
  onNavigate?: (page: string) => void;
}

const Directory: React.FC<DirectoryProps> = ({ currentUser, onSignOut, onNavigate }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getInitials = (displayName: string) => {
    const names = displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  };

  const formatLinkedInUrl = (linkedin: string) => {
    if (!linkedin) return '';
    if (linkedin.startsWith('http')) return linkedin;
    if (linkedin.startsWith('linkedin.com/')) return `https://${linkedin}`;
    return `https://linkedin.com/in/${linkedin}`;
  };

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
          const userProfile = {
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            lastLoginAt: data.lastLoginAt?.toDate()
          } as UserProfile;
          
          // Filter out pending users
          if (userProfile.USER_ORG_ROLE !== 'Pending User') {
            usersList.push(userProfile);
          }
        });
        
        setUsers(usersList);
        setFilteredUsers(usersList);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load directory');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.USER_FNAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.USER_LNAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.USER_ORG_ROLE.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

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
      <style>
        {`
          @media (max-width: 768px) {
            .directory-additional-info {
              display: none !important;
            }
          }
        `}
      </style>
      <Header
        title="Member Directory"
        user={{
          displayName: currentUser.displayName,
          role: currentUser.USER_ORG_ROLE
        }}
        onSignOut={onSignOut}
        navItems={[
          { label: 'Dashboard', path: 'dashboard' },
          { label: 'Directory', path: 'directory' },
          { label: 'Profile', path: 'profile' },
          { label: 'About', path: 'about' }
        ]}
        currentPath="directory"
        onNavigate={onNavigate}
      />

      {/* Search Bar */}
      <SearchBar
        placeholder="Search by name, email, or role..."
        value={searchTerm}
        onChange={setSearchTerm}
      />

      {/* Directory List */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem' 
      }}>
        {filteredUsers.map((user) => (
          <div
            key={user.uid}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
          >
            {/* User Avatar */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#e87500',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              flexShrink: 0
            }}>
              {getInitials(user.displayName)}
            </div>

            {/* User Info */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '0.5rem', textAlign: 'left' }}>
                <h3 style={{ 
                  margin: '0 0 0.25rem 0', 
                  color: '#154734',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  textAlign: 'left'
                }}>
                  {user.USER_FNAME} {user.USER_LNAME}
                </h3>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#666',
                  margin: 0,
                  lineHeight: '1.2',
                  textAlign: 'left'
                }}>
                  {user.USER_ORG_ROLE}
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img {...getIconProps('email', 16)} />
                  <a 
                    href={`mailto:${user.email}`}
                    style={{ 
                      color: '#154734', 
                      textDecoration: 'none'
                    }}
                  >
                    {user.email}
                  </a>
                </div>
                
                {user.USER_LINKEDIN && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img {...getIconProps('linkedin', 16)} />
                    <a
                      href={formatLinkedInUrl(user.USER_LINKEDIN)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#154734',
                        textDecoration: 'none'
                      }}
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info - Hidden on Mobile */}
            <div className="directory-additional-info" style={{ 
              textAlign: 'right', 
              fontSize: '0.85rem', 
              color: '#666',
              minWidth: '120px'
            }}>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Status:</strong> {user.USER_IS_ACTIVE ? 'Active' : 'Inactive'}
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Member since:</strong> {user.createdAt.toLocaleDateString()}
              </div>
              {user.USER_TOTAL_VOL > 0 && (
                <div>
                  <strong>Volunteer hours:</strong> {user.USER_TOTAL_VOL}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && users.length > 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#666' 
        }}>
          <p>No members found matching your search.</p>
        </div>
      )}
      
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
