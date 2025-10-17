import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types/user';
import { DummyDataService } from '../services/dummyDataService';
import PageContainer from './common/PageContainer';
import Header from './common/Header';
import Card from './common/Card';
import Button from './common/Button';

interface AdminProps {
  user: UserProfile;
  onSignOut: () => void;
  onNavigate?: (page: string) => void;
}

const Admin: React.FC<AdminProps> = ({ user, onSignOut, onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataStatus, setDataStatus] = useState<{
    exists: boolean;
    counts: { users: number; committees: number; serves: number };
  } | null>(null);

  useEffect(() => {
    checkDataStatus();
  }, []);

  const checkDataStatus = async () => {
    try {
      const status = await DummyDataService.checkDummyDataExists();
      setDataStatus(status);
    } catch (error) {
      console.error('Error checking data status:', error);
    }
  };

  const handleAddDummyData = async () => {
    if (!window.confirm('This will add dummy users, committees, and SERVES records. Continue?')) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await DummyDataService.addDummyData();
      
      if (result.success) {
        setSuccess(result.message);
        await checkDataStatus(); // Refresh status
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError(`Failed to add dummy data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDummyData = async () => {
    if (!window.confirm('This will delete all dummy data (users, committees, SERVES records). The current user will be preserved. Continue?')) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await DummyDataService.clearDummyData();
      
      if (result.success) {
        setSuccess(result.message);
        await checkDataStatus(); // Refresh status
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError(`Failed to clear dummy data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <PageContainer>
      <Header
        title="Admin Panel"
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
        currentPath="admin"
        onNavigate={onNavigate}
      />

      {/* Success/Error Messages */}
      {success && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #c3e6cb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{success}</span>
          <button
            onClick={clearMessages}
            style={{
              background: 'none',
              border: 'none',
              color: '#155724',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button
            onClick={clearMessages}
            style={{
              background: 'none',
              border: 'none',
              color: '#721c24',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Admin Panel Content */}
      <Card title="Database Management" style={{ marginBottom: '2rem' }}>
        <div style={{ lineHeight: '1.6' }}>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Manage dummy data for development and testing purposes. This will help populate the system 
            with sample users, committees, and relationships for demonstration.
          </p>

          {/* Current Data Status */}
          {dataStatus && (
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1.5rem',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#154734' }}>Current Database Status:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div>
                  <strong>Users:</strong> {dataStatus.counts.users}
                </div>
                <div>
                  <strong>Committees:</strong> {dataStatus.counts.committees}
                </div>
                <div>
                  <strong>SERVES Records:</strong> {dataStatus.counts.serves}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              onClick={handleAddDummyData}
              disabled={isLoading}
              style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
            >
              {isLoading ? 'Adding Data...' : 'Add Dummy Data'}
            </Button>
            
            <Button
              onClick={handleClearDummyData}
              disabled={isLoading}
              variant="secondary"
              style={{ backgroundColor: '#dc3545', borderColor: '#dc3545', color: 'white' }}
            >
              {isLoading ? 'Clearing Data...' : 'Clear Dummy Data'}
            </Button>
            
            <Button
              onClick={checkDataStatus}
              disabled={isLoading}
              variant="secondary"
            >
              Refresh Status
            </Button>
          </div>
        </div>
      </Card>

      {/* Dummy Data Information */}
      <Card title="Dummy Data Details" style={{ marginBottom: '2rem' }}>
        <div style={{ lineHeight: '1.6' }}>
          <h4 style={{ color: '#154734', marginBottom: '1rem' }}>What will be added:</h4>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h5 style={{ color: '#666', marginBottom: '0.5rem' }}>Users (8 total):</h5>
            <div style={{ color: '#666', lineHeight: '1.8' }}>
              <div>John Doe - President</div>
              <div>Jane Smith - Vice President</div>
              <div>Mike Johnson - Internal Affairs Officer</div>
              <div>Sarah Wilson - Finance Officer</div>
              <div>Alex Brown - Member</div>
              <div>Emma Davis - Member</div>
              <div>David Miller - Member</div>
              <div>Lisa Garcia - Inactive Member</div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h5 style={{ color: '#666', marginBottom: '0.5rem' }}>Committees (4 total):</h5>
            <div style={{ color: '#666', lineHeight: '1.8' }}>
              <div>Academic Affairs Committee (Active)</div>
              <div>Student Life Committee (Active)</div>
              <div>Finance Committee (Active)</div>
              <div>Events Committee (Inactive)</div>
            </div>
          </div>

          <div>
            <h5 style={{ color: '#666', marginBottom: '0.5rem' }}>SERVES Records:</h5>
            <p style={{ margin: '0', color: '#666' }}>
              Each committee will have a chair, vice chair, and 2-3 regular members assigned. 
              The current user (Data & Systems Officer) will be preserved and not affected by clear operations.
            </p>
          </div>
        </div>
      </Card>

      {/* Warning */}
      <Card title="⚠️ Important Notes" style={{ backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }}>
        <div style={{ lineHeight: '1.8', color: '#856404' }}>
          <div style={{ marginBottom: '0.5rem' }}>This feature is only available to Data & Systems Officers</div>
          <div style={{ marginBottom: '0.5rem' }}>Dummy data is for development and testing purposes only</div>
          <div style={{ marginBottom: '0.5rem' }}>Clearing data will remove all users except the current Data & Systems Officer</div>
          <div style={{ marginBottom: '0.5rem' }}>All committee memberships and relationships will be removed</div>
          <div>This action cannot be undone - use with caution</div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Admin;
