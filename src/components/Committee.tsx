import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS } from '../types/firebase';
import { UserProfile } from '../types/user';
import { Committee as CommitteeType } from '../types/firebase';
import PageContainer from './common/PageContainer';
import Header from './common/Header';
import Card from './common/Card';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';

interface CommitteeProps {
  user: UserProfile;
  onSignOut: () => void;
  onNavigate?: (page: string) => void;
}

const Committee: React.FC<CommitteeProps> = ({ user, onSignOut, onNavigate }) => {
  const [committees, setCommittees] = useState<CommitteeType[]>([]);
  const [userCommittees, setUserCommittees] = useState<string[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [committeesLoaded, setCommitteesLoaded] = useState(false);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [joiningCommittee, setJoiningCommittee] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCommittees();
    fetchUserCommittees();
    fetchMembers();
  }, []);

  useEffect(() => {
    if (committeesLoaded && membersLoaded) {
      setLoading(false);
    }
  }, [committeesLoaded, membersLoaded]);

  const fetchCommittees = async () => {
    try {
      const committeesRef = collection(db, COLLECTIONS.COMMITTEE);
      const q = query(committeesRef, where('COMM_IS_ACTIVE', '==', true), orderBy('COMM_NAME', 'asc'));
      const querySnapshot = await getDocs(q);

      const committeesList: CommitteeType[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const committee = {
          id: doc.id,
          REP_ID: doc.id,
          COMM_ID: doc.id,
          COMM_NAME: data.COMM_NAME || '',
          COMM_DESCRIPTION: data.COMM_DESCRIPTION || '',
          CHAIR_ID: data.CHAIR_ID || null,
          VICE_CHAIR_ID: data.VICE_CHAIR_ID || null,
          COMM_IS_ACTIVE: data.COMM_IS_ACTIVE || false,
          COMM_TIMESTAMP: data.COMM_TIMESTAMP?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as CommitteeType;
        committeesList.push(committee);
      });

      setCommittees(committeesList);
      setCommitteesLoaded(true);
    } catch (error) {
      console.error('Error fetching committees:', error);
      setError('Failed to load committees. Please try again.');
      setCommitteesLoaded(true);
    }
  };

  const fetchUserCommittees = async () => {
    try {
      const servesRef = collection(db, COLLECTIONS.SERVES);
      const q = query(servesRef, where('UID', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const userCommitteeIds: string[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userCommitteeIds.push(data.COMM_ID);
      });

      setUserCommittees(userCommitteeIds);
    } catch (error) {
      console.error('Error fetching user committees:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const usersRef = collection(db, COLLECTIONS.USER);
      const q = query(usersRef, orderBy('USER_FNAME', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const membersList: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const userProfile = {
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          USER_FNAME: data.USER_FNAME || '',
          USER_LNAME: data.USER_LNAME || '',
          USER_IS_ACTIVE: data.USER_IS_ACTIVE || false,
          USER_LINKEDIN: data.USER_LINKEDIN || '',
          USER_ORG_ROLE: data.USER_ORG_ROLE ?? 'Pending User',
          USER_TOTAL_VOL: data.USER_TOTAL_VOL || 0,
          USER_CURRENT_VOL: data.USER_CURRENT_VOL || 0,
          USER_ATND_TOTAL: data.USER_ATND_TOTAL || 0,
          USER_IS_ATND_EXEMPT: data.USER_IS_ATND_EXEMPT || false,
          permissions: data.permissions || {},
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate()
        } as UserProfile;
        membersList.push(userProfile);
      });
      
      setMembers(membersList);
      setMembersLoaded(true);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembersLoaded(true);
    }
  };

  const handleJoinCommittee = async (committeeId: string) => {
    try {
      setJoiningCommittee(committeeId);
      setError(null);
      setSuccess(null);

      console.log('Attempting to join committee:', committeeId, 'for user:', user.uid);

      // Add user to committee in SERVES collection
      const servesData = {
        UID: user.uid,
        COMM_ID: committeeId,
        SERVES_JOIN_DATE: new Date(),
        SERVES_ROLE: 'Member',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Creating SERVES record with data:', servesData);
      const docRef = await addDoc(collection(db, COLLECTIONS.SERVES), servesData);
      console.log('Successfully created SERVES record:', docRef.id);

      // Update local state
      setUserCommittees(prev => [...prev, committeeId]);
      setSuccess('Successfully joined the committee!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error joining committee:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      setError(`Failed to join committee: ${error.message || 'Please try again.'}`);
    } finally {
      setJoiningCommittee(null);
    }
  };

  const handleLeaveCommittee = async (committeeId: string) => {
    try {
      setJoiningCommittee(committeeId); // Reuse the same loading state
      setError(null);
      setSuccess(null);

      console.log('Attempting to leave committee:', committeeId, 'for user:', user.uid);

      // Find and delete the user's SERVES record for this committee
      const servesQuery = query(
        collection(db, COLLECTIONS.SERVES),
        where('UID', '==', user.uid),
        where('COMM_ID', '==', committeeId)
      );
      
      const servesSnapshot = await getDocs(servesQuery);
      console.log('Found SERVES records to delete:', servesSnapshot.docs.length);

      if (servesSnapshot.empty) {
        throw new Error('No committee membership found to remove');
      }

      // Delete all SERVES records for this user-committee combination
      const deletePromises = servesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log('Successfully deleted SERVES records');

      // Update local state
      setUserCommittees(prev => prev.filter(id => id !== committeeId));
      setSuccess('Successfully left the committee!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error leaving committee:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      setError(`Failed to leave committee: ${error.message || 'Please try again.'}`);
    } finally {
      setJoiningCommittee(null);
    }
  };

  const getChairName = (chairId: string | null) => {
    if (!chairId) return 'No chair assigned';
    const chair = members.find(member => member.uid === chairId);
    console.log('Looking for chair:', chairId, 'Found:', chair, 'Members count:', members.length);
    return chair ? `${chair.USER_FNAME} ${chair.USER_LNAME}` : 'Unknown';
  };

  const getViceChairName = (viceChairId: string | null) => {
    if (!viceChairId) return 'No vice chair assigned';
    const viceChair = members.find(member => member.uid === viceChairId);
    return viceChair ? `${viceChair.USER_FNAME} ${viceChair.USER_LNAME}` : 'Unknown';
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner message="Loading committees..." />
      </PageContainer>
    );
  }

  // If user is already in committees, show their committee info
  if (userCommittees.length > 0) {
    const userCommittee = committees.find(c => userCommittees.includes(c.id));
    
    return (
      <PageContainer>
        <Header
          title="Committee"
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
          currentPath="committee"
          onNavigate={onNavigate}
        />

        {/* User's Committee Info */}
        {userCommittee && (
          <Card title={`${userCommittee.COMM_NAME} Committee`} style={{ marginBottom: '2rem' }}>
            <div style={{ lineHeight: '1.6' }}>
              <p><strong>Description:</strong> {userCommittee.COMM_DESCRIPTION}</p>
              <p><strong>Chair:</strong> {getChairName(userCommittee.CHAIR_ID)}</p>
              <p><strong>Vice Chair:</strong> {getViceChairName(userCommittee.VICE_CHAIR_ID)}</p>
              <p><strong>Member Since:</strong> {new Date().toLocaleDateString()}</p>
              
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e9ecef' }}>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleLeaveCommittee(userCommittee.id)}
                  disabled={joiningCommittee === userCommittee.id}
                  style={{ backgroundColor: '#dc3545', borderColor: '#dc3545', color: 'white' }}
                >
                  {joiningCommittee === userCommittee.id ? 'Leaving...' : 'Leave Committee'}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </PageContainer>
    );
  }

  // If user is not in any committees, show committee selection
  return (
    <PageContainer>
      <style>
        {`
          .member-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            background-color: #f8f9fa;
          }
          
          .member-buttons {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }
          
          @media (max-width: 768px) {
            .member-item {
              flex-direction: column;
              align-items: stretch;
              gap: 1rem;
            }
            
            .member-buttons {
              justify-content: center;
            }
            
            .member-buttons button {
              flex: 1;
              min-width: 120px;
            }
          }
        `}
      </style>
      <Header
        title="Join a Committee"
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
        currentPath="committee"
        onNavigate={onNavigate}
      />

      {/* Success Message */}
      {success && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '1rem',
          borderRadius: '4px',
          border: '1px solid #c3e6cb',
          marginBottom: '1rem'
        }}>
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '4px',
          border: '1px solid #f5c6cb',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Available Committees */}
      <Card title="Available Committees" style={{ marginBottom: '2rem' }}>
        {committees.length === 0 ? (
          <p>No active committees are currently available to join.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {committees.map((committee) => (
              <div key={committee.id} className="member-item" style={{ backgroundColor: '#fff' }}>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#154734', textAlign: 'left' }}>
                    {committee.COMM_NAME}
                  </h4>
                  <p style={{ margin: '0 0 0.25rem 0', color: '#666', textAlign: 'left' }}>
                    {committee.COMM_DESCRIPTION}
                  </p>
                  {committee.CHAIR_ID && (
                    <p style={{ margin: '0 0 0.25rem 0', color: '#666', fontSize: '0.875rem', textAlign: 'left' }}>
                      <strong>Chair:</strong> {getChairName(committee.CHAIR_ID)}
                    </p>
                  )}
                  {committee.VICE_CHAIR_ID && (
                    <p style={{ margin: '0 0 0.25rem 0', color: '#666', fontSize: '0.875rem', textAlign: 'left' }}>
                      <strong>Vice Chair:</strong> {getViceChairName(committee.VICE_CHAIR_ID)}
                    </p>
                  )}
                  <p style={{ margin: '0', color: '#999', fontSize: '0.75rem', textAlign: 'left' }}>
                    Created: {committee.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="member-buttons" style={{ alignItems: 'center' }}>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleJoinCommittee(committee.id)}
                    disabled={joiningCommittee === committee.id}
                  >
                    {joiningCommittee === committee.id ? 'Joining...' : 'Join Committee'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default Committee;
