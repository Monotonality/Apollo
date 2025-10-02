import React from 'react';
import { UserProfile } from '../types/user';
import PageContainer from './common/PageContainer';
import Header from './common/Header';
import Card from './common/Card';

interface CommitteesProps {
  user: UserProfile;
  onSignOut: () => void;
  onNavigate?: (page: string) => void;
}

const Committees: React.FC<CommitteesProps> = ({ user, onSignOut, onNavigate }) => {
  return (
    <PageContainer>
      <Header
        title="Committee Management"
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
          ...(user.permissions?.manage_committees ? [{ label: 'Committees', path: 'committees' }] : [])
        ]}
        currentPath="committees"
        onNavigate={onNavigate}
      />

      {/* Committees Management Content */}
      <Card title="Committee Management" style={{ marginBottom: '2rem' }}>
        <p>Committee management page content will be added here.</p>
      </Card>
    </PageContainer>
  );
};

export default Committees;
