import React, { useState } from 'react';
import { UserProfile } from '../types/user';
import { updatePassword, updateProfile, deleteUser } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { COLLECTIONS } from '../types/firebase';
import PageContainer from './common/PageContainer';
import Header from './common/Header';
import Card from './common/Card';
import RoleBadge from './common/RoleBadge';
import Button from './common/Button';

interface ProfileProps {
  user: UserProfile;
  onSignOut: () => void;
  onNavigate?: (page: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onSignOut, onNavigate }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isResigning, setIsResigning] = useState(false);
  
  // Form states
  const [newFirstName, setNewFirstName] = useState(user.USER_FNAME);
  const [newLastName, setNewLastName] = useState(user.USER_LNAME);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resignConfirmation, setResignConfirmation] = useState('');
  
  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Helper function to capitalize names properly
  const capitalizeName = (name: string): string => {
    return name.trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleUpdateName = async () => {
    if (!newFirstName.trim() || !newLastName.trim()) {
      setError('First and last name are required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('No user logged in');

      // Capitalize names properly
      const capitalizedFirstName = capitalizeName(newFirstName);
      const capitalizedLastName = capitalizeName(newLastName);
      const newDisplayName = `${capitalizedFirstName} ${capitalizedLastName}`;

      // Update Firebase Auth display name
      await updateProfile(firebaseUser, {
        displayName: newDisplayName
      });

      // Update Firestore user document
      await updateDoc(doc(db, COLLECTIONS.USER, user.uid), {
        USER_FNAME: capitalizedFirstName,
        USER_LNAME: capitalizedLastName,
        displayName: newDisplayName,
        updatedAt: new Date()
      });

      setSuccess('Name updated successfully');
      setIsEditingName(false);
    } catch (err) {
      setError('Failed to update name. Please try again.');
      console.error('Error updating name:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (oldPassword === newPassword) {
      setError('New password must be different from the old password');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('No user logged in');

      // Re-authenticate with old password first
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, user.email, oldPassword);
      
      // Now update the password
      await updatePassword(firebaseUser, newPassword);
      
      setSuccess('Password changed successfully');
      setIsChangingPassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('Please sign out and sign back in before changing your password');
      } else {
        setError('Failed to change password. Please try again.');
      }
      console.error('Error changing password:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResign = async () => {
    if (resignConfirmation !== 'RESIGN') {
      setError('Please type "RESIGN" (in all caps) to confirm resignation');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update user to inactive status
      const userRef = doc(db, COLLECTIONS.USER, user.uid);
      await updateDoc(userRef, {
        USER_ORG_ROLE: 'Inactive Member',
        USER_IS_ACTIVE: false,
        updatedAt: new Date()
      });

      setSuccess('You have successfully resigned from the organization. You will be signed out.');
      
      // Sign out after a short delay
      setTimeout(() => {
        onSignOut();
      }, 2000);
    } catch (error: any) {
      console.error('Error resigning:', error);
      setError(error.message || 'Failed to resign');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Password strength calculation (from Auth component)
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    let feedback = '';

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Determine strength level
    if (score <= 2) {
      return { strength: 'weak', color: '#dc3545', feedback: 'Weak password' };
    } else if (score <= 4) {
      return { strength: 'medium', color: '#e87500', feedback: 'Medium password' };
    } else {
      return { strength: 'strong', color: '#198754', feedback: 'Strong password' };
    }
  };

  const getPasswordStrengthBar = () => {
    if (!newPassword) return null;
    
    const { strength, color, feedback } = calculatePasswordStrength(newPassword);
    const width = strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%';
    
    return (
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#e0e0e0',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: width,
            height: '100%',
            backgroundColor: color,
            transition: 'all 0.3s ease'
          }} />
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: color,
          marginTop: '0.25rem',
          fontWeight: '500'
        }}>
          {feedback}
        </div>
      </div>
    );
  };

  // Check if passwords match
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = newPassword && confirmPassword && newPassword !== confirmPassword;

  return (
    <PageContainer>
      <Header
        title="Profile"
        user={{
          displayName: user.displayName,
          role: user.USER_ORG_ROLE || 'Member'
        }}
        onSignOut={onSignOut}
        navItems={[
          { label: 'Dashboard', path: 'dashboard' },
          { label: 'Directory', path: 'directory' },
          { label: 'Profile', path: 'profile' },
          { label: 'About', path: 'about' },
          ...(user.permissions?.approve_members ? [{ label: 'Members', path: 'members' }] : [])
        ]}
        currentPath="profile"
        onNavigate={onNavigate}
      />


      {/* Account Information */}
      <Card
        title="Account Information"
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>Role:</strong> <RoleBadge role={user.USER_ORG_ROLE} size="small" />
          </div>
          <div>
            <strong>Member Since:</strong> {user.createdAt.toLocaleDateString()}
          </div>
          <div>
            <strong>Total Volunteer Credits:</strong> {user.USER_TOTAL_VOL || 0}
          </div>
          <div>
            <strong>Current Volunteer Credits:</strong> {user.USER_CURRENT_VOL || 0}
          </div>
          <div>
            <strong>Volunteer Credits Required:</strong> 4
          </div>
          <div>
            <strong>Total Attendance:</strong> {user.USER_ATND_TOTAL || 0}
          </div>
          <div>
            <strong>Attendance Exempt:</strong> {user.USER_IS_ATND_EXEMPT ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Account Active:</strong> {user.USER_IS_ACTIVE ? 'Yes' : 'No'}
          </div>
        </div>
      </Card>

      {/* Edit Name */}
      <Card
        title="Edit Name"
        style={{ marginBottom: '2rem' }}
      >
        {!isEditingName ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Current Name:</strong> {user.USER_FNAME} {user.USER_LNAME}
            </div>
            <Button
              variant="secondary"
              size="medium"
              onClick={() => setIsEditingName(true)}
              disabled={loading}
            >
              Edit Name
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter first name"
                  disabled={loading}
                />
                {newFirstName.trim() && (
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: '#666', 
                    marginTop: '0.25rem',
                    fontStyle: 'italic'
                  }}>
                    Will be saved as: {capitalizeName(newFirstName)}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter last name"
                  disabled={loading}
                />
                {newLastName.trim() && (
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: '#666', 
                    marginTop: '0.25rem',
                    fontStyle: 'italic'
                  }}>
                    Will be saved as: {capitalizeName(newLastName)}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button
                variant="primary"
                size="medium"
                onClick={handleUpdateName}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Name'}
              </Button>
              <Button
                variant="secondary"
                size="medium"
                onClick={() => {
                  setIsEditingName(false);
                  setNewFirstName(user.USER_FNAME);
                  setNewLastName(user.USER_LNAME);
                  clearMessages();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Change Password */}
      <Card
        title="Change Password"
        style={{ marginBottom: '2rem' }}
      >
        {!isChangingPassword ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Password:</strong> ••••••••••••
            </div>
            <Button
              variant="secondary"
              size="medium"
              onClick={() => setIsChangingPassword(true)}
              disabled={loading}
            >
              Change Password
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 2.5rem 0.5rem 0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter current password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: '#666'
                  }}
                  disabled={loading}
                >
                  <img 
                    src={showOldPassword ? '/assets/images/icons/eye-slash.svg' : '/assets/images/icons/eye.svg'}
                    alt={showOldPassword ? 'Hide password' : 'Show password'}
                    style={{ width: '16px', height: '16px' }}
                  />
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 2.5rem 0.5rem 0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: '#666'
                  }}
                  disabled={loading}
                >
                  <img 
                    src={showNewPassword ? '/assets/images/icons/eye-slash.svg' : '/assets/images/icons/eye.svg'}
                    alt={showNewPassword ? 'Hide password' : 'Show password'}
                    style={{ width: '16px', height: '16px' }}
                  />
                </button>
              </div>
              {getPasswordStrengthBar()}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 2.5rem 0.5rem 0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: '#666'
                  }}
                  disabled={loading}
                >
                  <img 
                    src={showConfirmPassword ? '/assets/images/icons/eye-slash.svg' : '/assets/images/icons/eye.svg'}
                    alt={showConfirmPassword ? 'Hide password' : 'Show password'}
                    style={{ width: '16px', height: '16px' }}
                  />
                </button>
              </div>
              {passwordsMatch && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#198754', 
                  marginTop: '0.25rem',
                  fontWeight: '500'
                }}>
                  ✓ Passwords match
                </div>
              )}
              {passwordsMismatch && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#dc3545', 
                  marginTop: '0.25rem',
                  fontWeight: '500'
                }}>
                  Passwords do not match
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button
                variant="primary"
                size="medium"
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
              <Button
                variant="secondary"
                size="medium"
                onClick={() => {
                  setIsChangingPassword(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setShowOldPassword(false);
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                  clearMessages();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Resign from Organization */}
      <Card
        title="Resign from Organization"
        style={{ marginBottom: '2rem', borderColor: '#e87500' }}
      >
        {!isResigning ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: '#e87500' }}>Resignation</strong>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                Resign from the organization and set your account to inactive status.
              </p>
            </div>
            <Button
              variant="primary"
              size="medium"
              onClick={() => setIsResigning(true)}
              disabled={loading}
              style={{ backgroundColor: '#e87500', borderColor: '#e87500' }}
            >
              Resign
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
              backgroundColor: '#fff3cd', 
              color: '#856404', 
              padding: '1rem', 
              borderRadius: '4px', 
              border: '1px solid #ffeaa7' 
            }}>
              <strong>Resignation Notice</strong>
              <p style={{ margin: '0.5rem 0 0 0' }}>
                Resigning will set your account to inactive status. You will lose access to the organization's resources and will be signed out. Your data will be preserved but you will no longer be an active member.
              </p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Type "RESIGN" (in all caps) to confirm
              </label>
              <input
                type="text"
                value={resignConfirmation}
                onChange={(e) => setResignConfirmation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e87500',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="Type RESIGN (all caps) to confirm"
                disabled={loading}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button
                variant="primary"
                size="medium"
                onClick={handleResign}
                disabled={loading || resignConfirmation !== 'RESIGN'}
                style={{ backgroundColor: '#e87500', borderColor: '#e87500' }}
              >
                {loading ? 'Resigning...' : 'Resign'}
              </Button>
              <Button
                variant="secondary"
                size="medium"
                onClick={() => {
                  setIsResigning(false);
                  setResignConfirmation('');
                  clearMessages();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

    </PageContainer>
  );
};

export default Profile;
