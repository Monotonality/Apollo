import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types/user';
import { Report, Committee } from '../types/firebase';
import { getPublicReports, getCommittees, getMembers } from '../services/firestoreService';
import { PageContainer, Header, Card, Alert } from './common';

interface DashboardProps {
  user: UserProfile;
  onSignOut: () => void;
  onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut, onNavigate }) => {
  const [dismissedPendingAlert, setDismissedPendingAlert] = useState(false);
  const [dismissedWelcomeAlert, setDismissedWelcomeAlert] = useState(() => {
    // Check localStorage for previously dismissed welcome alert
    return localStorage.getItem(`welcomeAlertDismissed_${user.uid}`) === 'true';
  });
  const [publicReports, setPublicReports] = useState<Report[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const handleDismissPendingAlert = () => {
    setDismissedPendingAlert(true);
  };

  const handleDismissWelcomeAlert = () => {
    setDismissedWelcomeAlert(true);
    // Persist the dismissal in localStorage
    localStorage.setItem(`welcomeAlertDismissed_${user.uid}`, 'true');
  };

  // Check if user is a new member (not pending user and not dismissed welcome)
  const isNewMember = (user.USER_ORG_ROLE === 'Member' || user.USER_ORG_ROLE === 'Data & Systems Officer') && !dismissedWelcomeAlert;

  useEffect(() => {
    fetchPublicReports();
    fetchCommittees();
    fetchMembers();
  }, []);

  const fetchPublicReports = async () => {
    try {
      const reports = await getPublicReports();
      setPublicReports(reports);
    } catch (error) {
      console.error('Error fetching public reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchCommittees = async () => {
    try {
      const committeesList = await getCommittees();
      setCommittees(committeesList);
    } catch (error) {
      console.error('Error fetching committees:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const membersList = await getMembers();
      setMembers(membersList);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const getCommitteeName = (committeeId: string): string => {
    const committee = committees.find(c => c.id === committeeId);
    return committee ? committee.COMM_NAME : `Committee ${committeeId}`;
  };

  const getAuthorName = (authorId: string): string => {
    const author = members.find(member => member.uid === authorId);
    return author ? `${author.USER_FNAME} ${author.USER_LNAME}` : 'Unknown Author';
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
          ...(user.permissions?.create_committees || user.permissions?.manage_committees ? [{ label: 'Committee', path: 'committee' }] : []),
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

      {/* Welcome Alert for New Members */}
      {isNewMember && (
        <Alert
          variant="success"
          title="Welcome to Apollo!"
          message="Congratulations on becoming a member! You now have access to all member functions including committee participation, volunteer opportunities, and full organizational features. Use the navigation menu to explore different sections of the application."
          dismissible={true}
          onDismiss={handleDismissWelcomeAlert}
          style={{ marginBottom: '2rem' }}
        />
      )}

      {/* Public Reports */}
      <Card
        title="Public Reports"
        style={{ marginBottom: '2rem' }}
      >
        {loadingReports ? (
          <p>Loading public reports...</p>
        ) : publicReports.length === 0 ? (
          <p>No public reports are currently available.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {publicReports.map((report) => (
              <div 
                key={report.id} 
                style={{ 
                  padding: '1rem',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#154734', textAlign: 'left' }}>
                    {report.REP_TITLE}
                  </h4>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666', textAlign: 'left' }}>
                    {report.REP_DESCRIPTION}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <p style={{ margin: '0', color: '#999', fontSize: '0.875rem', textAlign: 'left' }}>
                        <strong>Committee:</strong> {getCommitteeName(report.COMM_ID)}
                      </p>
                      <p style={{ margin: '0', color: '#999', fontSize: '0.875rem', textAlign: 'left' }}>
                        <strong>Author:</strong> {getAuthorName(report.UID)}
                      </p>
                    </div>
                    <p style={{ margin: '0', color: '#999', fontSize: '0.875rem', textAlign: 'right' }}>
                      {report.REP_TIMESTAMP instanceof Date 
                        ? report.REP_TIMESTAMP.toLocaleDateString()
                        : (report.REP_TIMESTAMP as any).toDate().toLocaleDateString()
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

    </PageContainer>
  );
};

export default Dashboard;
