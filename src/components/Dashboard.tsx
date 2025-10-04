import React, { useState } from 'react';
import { UserProfile } from '../types/user';
import { PageContainer, Header, Card, Alert } from './common';

interface DashboardProps {
  user: UserProfile;
  onSignOut: () => void;
  onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut, onNavigate }) => {
  const [dismissedPendingAlert, setDismissedPendingAlert] = useState(false);

  const handleDismissPendingAlert = () => {
    setDismissedPendingAlert(true);
  };

  return (
    <PageContainer>
      <Header
        title="Apollo Dashboard"
        user={{
          displayName: user.displayName,
          role: user.USER_ORG_ROLE || 'Member'
        }}
        onSignOut={onSignOut}
        navItems={[
          { label: 'Dashboard', path: 'dashboard' },
          ...(user.USER_ORG_ROLE === 'Member' || user.USER_ORG_ROLE === 'Data & Systems Officer' ? [{ label: 'Committee', path: 'committee' }] : []),
          { label: 'Directory', path: 'directory' },
          { label: 'Profile', path: 'profile' },
          { label: 'About', path: 'about' },
          ...(user.permissions?.approve_members ? [{ label: 'Members', path: 'members' }] : []),
          ...(user.permissions?.manage_committees ? [{ label: 'Committees', path: 'committees' }] : []),
          ...(user.USER_ORG_ROLE === 'Data & Systems Officer' ? [{ label: 'Admin', path: 'admin' }] : [])
        ]}
        currentPath="dashboard"
        onNavigate={onNavigate}
      />

      {/* Pending User Alert */}
      {user.USER_ORG_ROLE === 'Pending User' && !dismissedPendingAlert && (
        <Alert
          variant="info"
          title="Account Verification Pending"
          message="Your account is currently pending verification. Once approved by an administrator, you will have access to all member functions including committee participation, volunteer opportunities, and full organizational features. Thank you for your patience!"
          dismissible={true}
          onDismiss={handleDismissPendingAlert}
          style={{ marginBottom: '2rem' }}
        />
      )}

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
