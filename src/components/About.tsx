import React from 'react';
import { UserProfile } from '../types/user';
import PageContainer from './common/PageContainer';
import Header from './common/Header';
import Card from './common/Card';

interface AboutProps {
  user: UserProfile;
  onSignOut: () => void;
  onNavigate?: (page: string) => void;
}

const About: React.FC<AboutProps> = ({ user, onSignOut, onNavigate }) => {
  return (
    <PageContainer>
      <Header
        title="About Apollo"
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
        currentPath="about"
        onNavigate={onNavigate}
      />

      {/* About Apollo */}
      <Card
        title="About Apollo"
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ lineHeight: '1.6', fontSize: '1rem' }}>
          <p style={{ marginBottom: '1.5rem' }}>
            Apollo is a comprehensive organization management platform designed to streamline 
            volunteer coordination, member management, and organizational operations. Created 
            specifically for the Undergraduate Dean's Council in Spring 2025, Apollo provides 
            a secure and user-friendly interface for managing all aspects of organizational activities.
          </p>
          
          <h3 style={{ color: '#154734', marginBottom: '1rem', fontSize: '1.25rem' }}>
            Key Features
          </h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Member Directory:</strong> Comprehensive member profiles with contact information and organizational roles
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Volunteer Management:</strong> Track volunteer hours and manage volunteer opportunities
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Attendance Tracking:</strong> Monitor member participation and meeting attendance
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Role-Based Access:</strong> Secure access control with different permission levels
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Profile Management:</strong> User-friendly profile editing and account management
            </div>
          </div>

          <h3 style={{ color: '#154734', marginBottom: '1rem', fontSize: '1.25rem' }}>
            Technology Stack
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Apollo is built using modern web technologies including React, TypeScript, and Firebase, 
            ensuring a secure, scalable, and maintainable platform for organizational management.
          </p>

          <h3 style={{ color: '#154734', marginBottom: '1rem', fontSize: '1.25rem' }}>
            Security & Privacy
          </h3>
          <p style={{ marginBottom: '1rem' }}>
            Your data security is our priority. Apollo implements comprehensive security measures 
            including input validation, secure authentication, and role-based access controls to 
            protect your organization's information.
          </p>

          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '4px', 
            border: '1px solid #e9ecef',
            marginTop: '1.5rem'
          }}>
            <p style={{ margin: 0, fontStyle: 'italic', color: '#666' }}>
              For technical support or questions about Apollo, please contact the 
              Data & Systems Officer. You can find their contact information in the{' '}
              <button
                onClick={() => onNavigate && onNavigate('directory')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#154734',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontStyle: 'italic',
                  fontSize: 'inherit'
                }}
              >
                Member Directory
              </button>
              .
            </p>
          </div>
        </div>
      </Card>

    </PageContainer>
  );
};

export default About;
