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
          { label: 'Profile', path: 'profile' },
          { label: 'About', path: 'about' }
        ]}
        currentPath="dashboard"
        onNavigate={onNavigate}
      />

      {/* Dashboard Content */}
      <Card
        title="Welcome to Apollo"
        style={{ marginBottom: '2rem' }}
      >
        <p>Welcome to the Apollo dashboard. Use the navigation menu to access different sections of the application.</p>
      </Card>

    </PageContainer>
  );
};

export default Dashboard;
