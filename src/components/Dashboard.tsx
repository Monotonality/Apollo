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
        navItems={[
          { label: 'Dashboard', path: 'dashboard' },
          { label: 'Directory', path: 'directory' },
          { label: 'Analytics', path: 'analytics' },
          { label: 'Settings', path: 'settings' }
        ]}
        currentPath="dashboard"
        onNavigate={onNavigate}
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

    </PageContainer>
  );
};

export default Dashboard;
