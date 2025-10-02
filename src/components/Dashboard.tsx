import React from 'react';
import { UserProfile } from '../types/user';

interface DashboardProps {
  user: UserProfile;
  onSignOut: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #154734'
      }}>
        <div>
          <h1 style={{ color: '#154734', margin: 0 }}>Apollo Dashboard</h1>
          <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>
            Welcome, {user.displayName} ({user.USER_ORG_ROLE})
          </p>
        </div>
        <button
          onClick={onSignOut}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </header>

      {/* User Info */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ color: '#154734', margin: '0 0 1rem 0' }}>Account Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>Role:</strong> {user.USER_ORG_ROLE}
          </div>
          <div>
            <strong>Member Since:</strong> {user.createdAt.toLocaleDateString()}
          </div>
          <div>
            <strong>Total Volunteer Hours:</strong> {user.USER_TOTAL_VOL || 0}
          </div>
          <div>
            <strong>Current Volunteer Hours:</strong> {user.USER_CURRENT_VOL || 0}
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
      </div>

      {/* Empty Dashboard */}
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: '#666'
      }}>
        <p>Dashboard content will be added here based on your specifications.</p>
      </div>
    </div>
  );
};

export default Dashboard;
