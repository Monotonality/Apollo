import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { db, auth } from '../firebase';
import { COLLECTIONS } from '../types/firebase';
import { UserProfile } from '../types/user';
import { UserRole } from '../types/auth';
import { ROLE_DEFINITIONS } from '../utils/roles';
import PageContainer from './common/PageContainer';
import Header from './common/Header';
import Card from './common/Card';
import RoleBadge from './common/RoleBadge';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import Select, { SelectOption } from './common/Select';

interface MembersProps {
  currentUser: UserProfile;
  onSignOut: () => void;
  onNavigate?: (page: string) => void;
}

const Members: React.FC<MembersProps> = ({ currentUser, onSignOut, onNavigate }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({
    pending: true,
    active: false,
    inactive: true,
    rejected: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, COLLECTIONS.USER);
      const q = query(usersRef, orderBy('USER_FNAME', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const usersList: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const userProfile = {
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          USER_FNAME: data.USER_FNAME || '',
          USER_LNAME: data.USER_LNAME || '',
          USER_IS_ACTIVE: data.USER_IS_ACTIVE || false,
          USER_LINKEDIN: data.USER_LINKEDIN || '',
          USER_ORG_ROLE: data.USER_ORG_ROLE ?? 'Pending User',
          USER_TOTAL_VOL: data.USER_TOTAL_VOL || 0,
          USER_CURRENT_VOL: data.USER_CURRENT_VOL || 0,
          USER_ATND_TOTAL: data.USER_ATND_TOTAL || 0,
          USER_IS_ATND_EXEMPT: data.USER_IS_ATND_EXEMPT || false,
          permissions: data.permissions || {},
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate()
        } as UserProfile;
        usersList.push(userProfile);
      });
      
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMember = async (userId: string, newRole: UserRole) => {
    try {
      setUpdating(userId);
      const userRef = doc(db, COLLECTIONS.USER, userId);
      
      // Determine if user should be active based on role
      const shouldBeActive = newRole !== 'Inactive Member';
      const newPermissions = getPermissionsForRole(newRole);
      
      await updateDoc(userRef, {
        USER_ORG_ROLE: newRole,
        USER_IS_ACTIVE: shouldBeActive,
        permissions: newPermissions,
        updatedAt: new Date()
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId 
            ? { ...user, USER_ORG_ROLE: newRole, USER_IS_ACTIVE: shouldBeActive, permissions: newPermissions as any }
            : user
        )
      );
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleReactivateMember = async (userId: string) => {
    try {
      setUpdating(userId);
      const userRef = doc(db, COLLECTIONS.USER, userId);
      const newPermissions = getPermissionsForRole('Member');
      
      await updateDoc(userRef, {
        USER_ORG_ROLE: 'Member',
        USER_IS_ACTIVE: true,
        permissions: newPermissions,
        updatedAt: new Date()
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId 
            ? { ...user, USER_ORG_ROLE: 'Member', USER_IS_ACTIVE: true, permissions: newPermissions as any }
            : user
        )
      );
    } catch (error) {
      console.error('Error reactivating user:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setUpdating(userId);
      const userRef = doc(db, COLLECTIONS.USER, userId);
      const newPermissions = getPermissionsForRole(newRole);
      
      await updateDoc(userRef, {
        USER_ORG_ROLE: newRole,
        permissions: newPermissions,
        updatedAt: new Date()
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId 
            ? { ...user, USER_ORG_ROLE: newRole, permissions: newPermissions as any }
            : user
        )
      );
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleRejectMember = async (userId: string) => {
    try {
      setUpdating(userId);
      
      // Update user to rejected status (null role) with no permissions
      const userRef = doc(db, COLLECTIONS.USER, userId);
      const emptyPermissions = ROLE_DEFINITIONS['Pending User'].permissions; // No permissions for rejected users
      
      await updateDoc(userRef, {
        USER_ORG_ROLE: null,
        USER_IS_ACTIVE: false,
        permissions: emptyPermissions,
        updatedAt: new Date()
      });
      
      // Update local state to mark user as rejected
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId 
            ? { ...user, USER_ORG_ROLE: null, USER_IS_ACTIVE: false, permissions: emptyPermissions as any }
            : user
        )
      );
    } catch (error) {
      console.error('Error rejecting user:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getAvailableRoles = (): UserRole[] => {
    const currentUserRole = currentUser.USER_ORG_ROLE as UserRole;
    const currentUserPriority = ROLE_DEFINITIONS[currentUserRole]?.priority || 0;
    
    return Object.entries(ROLE_DEFINITIONS)
      .filter(([role, roleData]) => roleData.priority < currentUserPriority && role !== 'Inactive Member')
      .map(([role]) => role as UserRole)
      .sort((a, b) => ROLE_DEFINITIONS[b].priority - ROLE_DEFINITIONS[a].priority);
  };

  const getPermissionsForRole = (role: UserRole): any => {
    return ROLE_DEFINITIONS[role]?.permissions || ROLE_DEFINITIONS['Member'].permissions;
  };

  const getRoleOptions = (): SelectOption[] => {
    return getAvailableRoles().map(role => ({
      value: role,
      label: role
    }));
  };

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const pendingUsers = users.filter(user => user.USER_ORG_ROLE === 'Pending User');
  const activeUsers = users.filter(user => user.USER_ORG_ROLE !== 'Pending User' && user.USER_ORG_ROLE !== null && user.USER_IS_ACTIVE);
  const inactiveUsers = users.filter(user => user.USER_ORG_ROLE !== 'Pending User' && user.USER_ORG_ROLE !== null && !user.USER_IS_ACTIVE);
  const rejectedUsers = users.filter(user => user.USER_ORG_ROLE === null);

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner message="Loading members..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <style>
        {`
          .member-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            background-color: #f8f9fa;
          }
          
          .member-item.inactive {
            opacity: 0.7;
          }
          
          .member-item.rejected {
            opacity: 0.5;
          }
          
          .member-buttons {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }
          
          .collapsible-content {
            overflow: hidden;
            transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
            max-height: 0;
            opacity: 0;
          }
          
          .collapsible-content.open {
            max-height: 2000px;
            opacity: 1;
          }
          
          .collapse-button {
            transition: transform 0.2s ease-in-out;
          }
          
          .collapse-button.rotated {
            transform: rotate(180deg);
          }
          
          @media (max-width: 768px) {
            .member-item {
              flex-direction: column;
              align-items: stretch;
              gap: 1rem;
            }
            
            .member-buttons {
              justify-content: center;
            }
            
            .member-buttons button {
              flex: 1;
              min-width: 120px;
            }
          }
        `}
      </style>
      <Header
        title="Member Management"
        user={{
          displayName: currentUser.displayName,
          role: currentUser.USER_ORG_ROLE || 'Member'
        }}
        onSignOut={onSignOut}
        navItems={(() => {
          const items = [
            { label: 'Dashboard', path: 'dashboard' },
            ...(currentUser.USER_ORG_ROLE === 'Member' || currentUser.USER_ORG_ROLE === 'Data & Systems Officer' ? [{ label: 'Committee', path: 'committee' }] : []),
            { label: 'Directory', path: 'directory' },
            { label: 'Profile', path: 'profile' },
            { label: 'About', path: 'about' },
            ...(currentUser.permissions?.approve_members ? [{ label: 'Members', path: 'members' }] : []),
            ...(currentUser.permissions?.manage_committees ? [{ label: 'Committees', path: 'committees' }] : [])
          ];
          console.log('Members navItems:', items);
          console.log('Current user permissions:', currentUser.permissions);
          console.log('Current user role:', currentUser.USER_ORG_ROLE);
          return items;
        })()}
        currentPath="members"
        onNavigate={onNavigate}
      />

      {/* Pending Members */}
      {pendingUsers.length > 0 && (
        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>Pending Members ({pendingUsers.length})</span>
              <button
                onClick={() => toggleSection('pending')}
                className={`collapse-button ${collapsedSections.pending ? '' : 'rotated'}`}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0.25rem'
                }}
                aria-label={collapsedSections.pending ? 'Expand section' : 'Collapse section'}
              >
                ▼
              </button>
            </div>
          }
          style={{ marginBottom: '2rem' }}
        >
          <div className={`collapsible-content ${!collapsedSections.pending ? 'open' : ''}`}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {pendingUsers.map((user) => (
              <div key={user.uid} className="member-item">
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#154734' }}>
                    {user.USER_FNAME} {user.USER_LNAME}
                  </h4>
                  <p style={{ margin: '0 0 0.25rem 0', color: '#666' }}>
                    {user.email}
                  </p>
                  <RoleBadge role={user.USER_ORG_ROLE} size="small" />
                </div>
                <div className="member-buttons">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleApproveMember(user.uid, 'Member')}
                    disabled={updating === user.uid}
                  >
                    {updating === user.uid ? 'Approving...' : 'Approve as Member'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleRejectMember(user.uid)}
                    disabled={updating === user.uid}
                    style={{ backgroundColor: '#dc3545', borderColor: '#dc3545', color: 'white' }}
                  >
                    {updating === user.uid ? 'Rejecting...' : 'Reject'}
                  </Button>
                </div>
              </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Active Members */}
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span>Active Members ({activeUsers.length})</span>
            <button
              onClick={() => toggleSection('active')}
              className={`collapse-button ${collapsedSections.active ? '' : 'rotated'}`}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: '#666',
                padding: '0.25rem'
              }}
              aria-label={collapsedSections.active ? 'Expand section' : 'Collapse section'}
            >
              ▼
            </button>
          </div>
        }
        style={{ marginBottom: '2rem' }}
      >
        <div className={`collapsible-content ${!collapsedSections.active ? 'open' : ''}`}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {activeUsers.map((user) => (
            <div key={user.uid} className="member-item" style={{ backgroundColor: '#fff' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#154734' }}>
                  {user.USER_FNAME} {user.USER_LNAME}
                </h4>
                <p style={{ margin: '0 0 0.25rem 0', color: '#666' }}>
                  {user.email}
                </p>
                <RoleBadge role={user.USER_ORG_ROLE} size="small" />
              </div>
              <div className="member-buttons" style={{ alignItems: 'center' }}>
                <Select
                  value={user.USER_ORG_ROLE || ''}
                  onChange={(value) => handleRoleChange(user.uid, value as UserRole)}
                  options={[
                    { value: user.USER_ORG_ROLE || '', label: user.USER_ORG_ROLE || 'Rejected' },
                    ...getRoleOptions().filter(option => option.value !== (user.USER_ORG_ROLE || ''))
                  ]}
                  disabled={updating === user.uid}
                />
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleApproveMember(user.uid, 'Inactive Member')}
                  disabled={updating === user.uid}
                >
                  {updating === user.uid ? 'Updating...' : 'Set Inactive'}
                </Button>
              </div>
            </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Inactive Members */}
      {inactiveUsers.length > 0 && (
        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>Inactive Members ({inactiveUsers.length})</span>
              <button
                onClick={() => toggleSection('inactive')}
                className={`collapse-button ${collapsedSections.inactive ? '' : 'rotated'}`}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0.25rem'
                }}
                aria-label={collapsedSections.inactive ? 'Expand section' : 'Collapse section'}
              >
                ▼
              </button>
            </div>
          }
          style={{ marginBottom: '2rem' }}
        >
          <div className={`collapsible-content ${!collapsedSections.inactive ? 'open' : ''}`}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {inactiveUsers.map((user) => (
              <div key={user.uid} className="member-item inactive">
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                    {user.USER_FNAME} {user.USER_LNAME}
                  </h4>
                  <p style={{ margin: '0 0 0.25rem 0', color: '#999' }}>
                    {user.email}
                  </p>
                  <RoleBadge role={user.USER_ORG_ROLE} size="small" />
                </div>
                <div className="member-buttons">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleReactivateMember(user.uid)}
                    disabled={updating === user.uid}
                  >
                    {updating === user.uid ? 'Reactivating...' : 'Reactivate'}
                  </Button>
                </div>
              </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Rejected Members */}
      {rejectedUsers.length > 0 && (
        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>Rejected Members ({rejectedUsers.length})</span>
              <button
                onClick={() => toggleSection('rejected')}
                className={`collapse-button ${collapsedSections.rejected ? '' : 'rotated'}`}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0.25rem'
                }}
                aria-label={collapsedSections.rejected ? 'Expand section' : 'Collapse section'}
              >
                ▼
              </button>
            </div>
          }
          style={{ marginBottom: '2rem' }}
        >
          <div className={`collapsible-content ${!collapsedSections.rejected ? 'open' : ''}`}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {rejectedUsers.map((user) => (
              <div key={user.uid} className="member-item rejected">
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#999' }}>
                    {user.USER_FNAME} {user.USER_LNAME}
                  </h4>
                  <p style={{ margin: '0 0 0.25rem 0', color: '#ccc' }}>
                    {user.email}
                  </p>
                  <div style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    Rejected
                  </div>
                </div>
                <div className="member-buttons">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleApproveMember(user.uid, 'Member')}
                    disabled={updating === user.uid}
                  >
                    {updating === user.uid ? 'Approving...' : 'Approve as Member'}
                  </Button>
                </div>
              </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </PageContainer>
  );
};

export default Members;
