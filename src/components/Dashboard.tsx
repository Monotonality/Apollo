import React from 'react';
import { UserProfile } from '../types/user';
import { PageContainer, Header, Card, RoleBadge } from './common';

interface DashboardProps {
  user: UserProfile;
  onSignOut: () => void;
  onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut, onNavigate }) => {
  return (
    <PageContainer>
      <Header
        title="Apollo Dashboard"
        user={{
          displayName: user.displayName,
          role: user.USER_ORG_ROLE
        }}
        onSignOut={onSignOut}
      />

      {/* User Info */}
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
      </Card>

      {/* Quick Actions */}
      <div style={{ 
        marginBottom: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        <Card
          hoverable
          onClick={() => {
            if (onNavigate) {
              onNavigate('directory');
            } else {
              window.history.pushState({}, '', '/directory');
              window.location.reload();
            }
          }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '0.5rem',
            color: '#154734',
            fontWeight: 'bold'
          }}>DIR</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#154734' }}>Member Directory</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            View all organization members, their roles, and contact information
          </p>
        </Card>

        <Card
          style={{ textAlign: 'center', opacity: 0.6 }}
        >
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '0.5rem',
            color: '#6c757d',
            fontWeight: 'bold'
          }}>ANAL</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#154734' }}>Analytics</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            Coming soon - Organization statistics and reports
          </p>
        </Card>

        <Card
          style={{ textAlign: 'center', opacity: 0.6 }}
        >
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '0.5rem',
            color: '#6c757d',
            fontWeight: 'bold'
          }}>SET</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#154734' }}>Settings</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            Coming soon - Organization settings and configuration
          </p>
        </Card>
      </div>

      {/* Empty Dashboard */}
      <Card>
        <div style={{ 
          textAlign: 'center',
          color: '#666'
        }}>
          <p>Additional dashboard content will be added here based on your specifications.</p>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Dashboard;
