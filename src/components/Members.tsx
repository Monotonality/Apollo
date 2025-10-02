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

interface MembersProps {
  currentUser: UserProfile;
  onSignOut: () => void;
  onNavigate?: (page: string) => void;
}

const Members: React.FC<MembersProps> = ({ currentUser, onSignOut, onNavigate }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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
          USER_ORG_ROLE: data.USER_ORG_ROLE || 'Pending User',
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
      
      await updateDoc(userRef, {
        USER_ORG_ROLE: newRole,
        USER_IS_ACTIVE: shouldBeActive,
        updatedAt: new Date()
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId 
            ? { ...user, USER_ORG_ROLE: newRole, USER_IS_ACTIVE: shouldBeActive }
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
      
      await updateDoc(userRef, {
        USER_ORG_ROLE: 'Member',
        USER_IS_ACTIVE: true,
        updatedAt: new Date()
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId 
            ? { ...user, USER_ORG_ROLE: 'Member', USER_IS_ACTIVE: true }
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
      await updateDoc(userRef, {
        USER_ORG_ROLE: newRole,
        updatedAt: new Date()
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId 
            ? { ...user, USER_ORG_ROLE: newRole }
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
      
      // Update user to rejected status (null role)
      const userRef = doc(db, COLLECTIONS.USER, userId);
      await updateDoc(userRef, {
        USER_ORG_ROLE: null,
        USER_IS_ACTIVE: false,
        updatedAt: new Date()
      });
      
      // Update local state by removing the user from pending list
      setUsers(prevUsers => 
        prevUsers.filter(user => user.uid !== userId)
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

  const pendingUsers = users.filter(user => user.USER_ORG_ROLE === 'Pending User');
  const activeUsers = users.filter(user => user.USER_ORG_ROLE !== 'Pending User' && user.USER_IS_ACTIVE);
  const inactiveUsers = users.filter(user => user.USER_ORG_ROLE !== 'Pending User' && !user.USER_IS_ACTIVE);

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner message="Loading members..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header
        title="Member Management"
        user={{
          displayName: currentUser.displayName,
          role: currentUser.USER_ORG_ROLE
        }}
        onSignOut={onSignOut}
        navItems={[
          { label: 'Dashboard', path: 'dashboard' },
          { label: 'Directory', path: 'directory' },
          { label: 'Profile', path: 'profile' },
          { label: 'About', path: 'about' },
          ...(currentUser.permissions?.approve_members ? [{ label: 'Members', path: 'members' }] : [])
        ]}
        currentPath="members"
        onNavigate={onNavigate}
      />

      {/* Pending Members */}
      {pendingUsers.length > 0 && (
        <Card title="Pending Members" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {pendingUsers.map((user) => (
              <div key={user.uid} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#154734' }}>
                    {user.USER_FNAME} {user.USER_LNAME}
                  </h4>
                  <p style={{ margin: '0 0 0.25rem 0', color: '#666' }}>
                    {user.email}
                  </p>
                  <RoleBadge role={user.USER_ORG_ROLE} size="small" />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
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
        </Card>
      )}

      {/* Active Members */}
      <Card title="Active Members" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {activeUsers.map((user) => (
            <div key={user.uid} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              backgroundColor: '#fff'
            }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#154734' }}>
                  {user.USER_FNAME} {user.USER_LNAME}
                </h4>
                <p style={{ margin: '0 0 0.25rem 0', color: '#666' }}>
                  {user.email}
                </p>
                <RoleBadge role={user.USER_ORG_ROLE} size="small" />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  value={user.USER_ORG_ROLE}
                  onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                  disabled={updating === user.uid}
                  style={{
                    padding: '0.25rem 0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    backgroundColor: updating === user.uid ? '#f8f9fa' : '#fff',
                    cursor: updating === user.uid ? 'not-allowed' : 'pointer'
                  }}
                >
                  <option value={user.USER_ORG_ROLE}>{user.USER_ORG_ROLE}</option>
                  {getAvailableRoles().map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
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
      </Card>

      {/* Inactive Members */}
      {inactiveUsers.length > 0 && (
        <Card title="Inactive Members" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {inactiveUsers.map((user) => (
              <div key={user.uid} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
                opacity: 0.7
              }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                    {user.USER_FNAME} {user.USER_LNAME}
                  </h4>
                  <p style={{ margin: '0 0 0.25rem 0', color: '#999' }}>
                    {user.email}
                  </p>
                  <RoleBadge role={user.USER_ORG_ROLE} size="small" />
                </div>
                <div>
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
        </Card>
      )}
    </PageContainer>
  );
};

export default Members;
