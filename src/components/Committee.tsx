import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, where, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS } from '../types/firebase';
import { UserProfile } from '../types/user';
import { Committee as CommitteeType, Report } from '../types/firebase';
import { createReport, getCommitteeReports } from '../services/firestoreService';
import PageContainer from './common/PageContainer';
import Header from './common/Header';
import Card from './common/Card';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import Alert from './common/Alert';

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
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    title: '',
    description: '',
    isPublic: false
  });
  const [committeeReports, setCommitteeReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [committeeInfoExpanded, setCommitteeInfoExpanded] = useState(false);

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

  // Fetch committee reports when user committee is loaded
  useEffect(() => {
    if (userCommittees.length > 0 && committees.length > 0) {
      const userCommittee = committees.find(c => userCommittees.includes(c.id));
      if (userCommittee) {
        fetchCommitteeReports(userCommittee.id);
      }
    }
  }, [userCommittees, committees]);

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
      console.log('SERVES records found:', servesSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));

      if (servesSnapshot.empty) {
        console.log('No SERVES records found, trying alternative query...');
        // Try alternative query with compound ID format
        const alternativeQuery = query(
          collection(db, COLLECTIONS.SERVES),
          where('UID', '==', user.uid)
        );
        const altSnapshot = await getDocs(alternativeQuery);
        console.log('Alternative query found:', altSnapshot.docs.length, 'records');
        console.log('Alternative records:', altSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
        
        // Filter by COMM_ID in memory
        const matchingDocs = altSnapshot.docs.filter(doc => doc.data().COMM_ID === committeeId);
        console.log('Matching documents after filtering:', matchingDocs.length);
        
        if (matchingDocs.length === 0) {
          throw new Error('No committee membership found to remove');
        }
        
        // Delete the matching documents
        const deletePromises = matchingDocs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log('Successfully deleted SERVES records (alternative method)');
      } else {
        // Delete all SERVES records for this user-committee combination
        const deletePromises = servesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log('Successfully deleted SERVES records');
      }

      // Find the committee record to check if user is chair or vice chair
      const committee = committees.find(c => c.id === committeeId);
      if (committee) {
        const updateData: any = {};
        
        // If user is the chair, clear the chair ID
        if (committee.CHAIR_ID === user.uid) {
          updateData.CHAIR_ID = null;
          console.log('Clearing chair ID for committee:', committeeId);
        }
        
        // If user is the vice chair, clear the vice chair ID
        if (committee.VICE_CHAIR_ID === user.uid) {
          updateData.VICE_CHAIR_ID = null;
          console.log('Clearing vice chair ID for committee:', committeeId);
        }
        
        // Update the committee record if needed
        if (Object.keys(updateData).length > 0) {
          const committeeRef = doc(db, COLLECTIONS.COMMITTEE, committeeId);
          await updateDoc(committeeRef, updateData);
          console.log('Successfully updated committee record:', updateData);
        }
      }

      // Update local state
      setUserCommittees(prev => prev.filter(id => id !== committeeId));
      
      // Refresh committees data to reflect the role changes
      await fetchCommittees();
      
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

  const getAuthorName = (authorId: string) => {
    const author = members.find(member => member.uid === authorId);
    return author ? `${author.USER_FNAME} ${author.USER_LNAME}` : 'Unknown Author';
  };

  const isUserChairOrViceChair = (committee: CommitteeType) => {
    const isChair = user.uid === committee.CHAIR_ID;
    const isViceChair = user.uid === committee.VICE_CHAIR_ID;
    console.log('Committee role check:', {
      userId: user.uid,
      userDisplayName: user.displayName,
      committeeId: committee.id,
      committeeName: committee.COMM_NAME,
      chairId: committee.CHAIR_ID,
      viceChairId: committee.VICE_CHAIR_ID,
      isChair,
      isViceChair,
      chairIdMatch: committee.CHAIR_ID === user.uid,
      viceChairIdMatch: committee.VICE_CHAIR_ID === user.uid,
      result: isChair || isViceChair
    });
    return isChair || isViceChair;
  };

  const handleReportInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setReportFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleCreateReport = async (committeeId: string) => {
    if (!reportFormData.title.trim() || !reportFormData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmittingReport(true);
      setError(null);
      setSuccess(null);

      // Create report document using the service
      const reportData = {
        REP_ID: `report_${Date.now()}`, // Generate unique ID
        UID: user.uid,
        COMM_ID: committeeId,
        REP_TITLE: reportFormData.title.trim(),
        REP_DESCRIPTION: reportFormData.description.trim(),
        REP_IS_PUBLIC: reportFormData.isPublic,
        REP_TIMESTAMP: new Date()
      };

      await createReport(reportData);
      
      // Add the new report to local state so it appears immediately
      const newReport: Report = {
        id: `report_${Date.now()}`, // Use the same ID we generated
        ...reportData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCommitteeReports(prev => {
        const updated = [newReport, ...prev]; // Add new report at the beginning (most recent first)
        return updated.sort((a, b) => {
          const dateA = a.REP_TIMESTAMP instanceof Date ? a.REP_TIMESTAMP : (a.REP_TIMESTAMP as any).toDate();
          const dateB = b.REP_TIMESTAMP instanceof Date ? b.REP_TIMESTAMP : (b.REP_TIMESTAMP as any).toDate();
          return dateB.getTime() - dateA.getTime();
        });
      });
      
      setSuccess(`Report "${reportFormData.title}" has been created successfully!`);
      resetReportForm();
      
    } catch (error: any) {
      console.error('Error creating report:', error);
      setError(error.message || 'Failed to create report. Please try again.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const resetReportForm = () => {
    setReportFormData({
      title: '',
      description: '',
      isPublic: false
    });
    setIsCreatingReport(false);
    setError(null);
    setSuccess(null);
  };

  const fetchCommitteeReports = async (committeeId: string) => {
    try {
      setLoadingReports(true);
      console.log('Fetching reports for committee:', committeeId);
      const reports = await getCommitteeReports(committeeId);
      console.log('Fetched reports:', reports);
      
      // Sort reports by timestamp (most recent first)
      const sortedReports = reports.sort((a, b) => {
        const dateA = a.REP_TIMESTAMP instanceof Date ? a.REP_TIMESTAMP : (a.REP_TIMESTAMP as any).toDate();
        const dateB = b.REP_TIMESTAMP instanceof Date ? b.REP_TIMESTAMP : (b.REP_TIMESTAMP as any).toDate();
        return dateB.getTime() - dateA.getTime();
      });
      setCommitteeReports(sortedReports);
      console.log('Set committee reports:', sortedReports.length, 'reports');
    } catch (error) {
      console.error('Error fetching committee reports:', error);
      console.error('Error details:', {
        committeeId,
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      setError(`Failed to load committee reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingReports(false);
    }
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
    console.log('User committee data:', {
      userCommittees,
      userCommittee,
      user: {
        uid: user.uid,
        name: user.displayName
      },
      committeeDetails: userCommittee ? {
        id: userCommittee.id,
        name: userCommittee.COMM_NAME,
        chairId: userCommittee.CHAIR_ID,
        viceChairId: userCommittee.VICE_CHAIR_ID,
        isUserChair: userCommittee.CHAIR_ID === user.uid,
        isUserViceChair: userCommittee.VICE_CHAIR_ID === user.uid
      } : null
    });
    
    return (
      <PageContainer>
        <Header
          title={userCommittee ? userCommittee.COMM_NAME : "Committee"}
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
          currentPath="committee"
          onNavigate={onNavigate}
        />

        {/* Success Message */}
        {success && (
          <Alert
            variant="success"
            message={success}
            dismissible={true}
            onDismiss={() => setSuccess(null)}
            style={{ marginBottom: '1rem' }}
          />
        )}

        {/* Error Message */}
        {error && (
          <Alert
            variant="error"
            message={error}
            dismissible={true}
            onDismiss={() => setError(null)}
            style={{ marginBottom: '1rem' }}
          />
        )}


        {/* Report Creation Section - Only for Chairs and Vice Chairs */}
        {userCommittee && isUserChairOrViceChair(userCommittee) && (
          <Card title="Create Committee Report" style={{ marginBottom: '2rem' }}>
            {!isCreatingReport ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                    Create committee reports and documentation as {user.uid === userCommittee.CHAIR_ID ? 'Chair' : 'Vice Chair'}.
                  </p>
                </div>
                <Button 
                  variant="primary" 
                  size="medium" 
                  onClick={() => setIsCreatingReport(true)}
                  disabled={isSubmittingReport}
                >
                  Create Report
                </Button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleCreateReport(userCommittee.id); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Report Title */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#154734' }}>
                    Report Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={reportFormData.title}
                    onChange={handleReportInputChange}
                    required
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                    placeholder="Enter report title"
                  />
                </div>


                {/* Report Description */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#154734' }}>
                    Report Description *
                  </label>
                  <textarea
                    name="description"
                    value={reportFormData.description}
                    onChange={handleReportInputChange}
                    required
                    rows={6}
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                    placeholder="Enter detailed report description..."
                  />
                </div>

                {/* Public Visibility */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={reportFormData.isPublic}
                    onChange={handleReportInputChange}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <label style={{ fontWeight: 'bold', color: '#154734' }}>
                    Make this report public (visible to all club members)
                  </label>
                </div>

                {/* Form Actions */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="medium"
                    onClick={resetReportForm}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="medium"
                    disabled={isSubmittingReport || !reportFormData.title || !reportFormData.description}
                  >
                    {isSubmittingReport ? 'Creating...' : 'Create Report'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        )}

        {/* Committee Reports Section - Show if there are reports, hide if none */}
        {userCommittee && committeeReports.length > 0 && (
          <Card 
            title={`Committee Reports (${committeeReports.length})`}
            style={{ marginBottom: '2rem' }}
          >
            {loadingReports ? (
              <LoadingSpinner message="Loading reports..." />
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {committeeReports.map((report) => (
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
                          <p style={{ margin: '0 0 0.5rem 0', color: '#888', fontSize: '0.875rem', textAlign: 'left' }}>
                            <strong>Author:</strong> {getAuthorName(report.UID)}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <span style={{ 
                                padding: '0.25rem 0.5rem', 
                                borderRadius: '4px', 
                                fontSize: '0.75rem',
                                backgroundColor: report.REP_IS_PUBLIC ? '#d4edda' : '#fff3cd',
                                color: report.REP_IS_PUBLIC ? '#155724' : '#856404'
                              }}>
                                {report.REP_IS_PUBLIC ? 'Public' : 'Committee Only'}
                              </span>
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
        )}

        {/* Committee Info Section - At bottom with dropdown */}
        {userCommittee && (
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Committee Info</span>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setCommitteeInfoExpanded(!committeeInfoExpanded)}
                >
                  {committeeInfoExpanded ? '▼ Hide Info' : '▶ Show Info'}
                </Button>
              </div>
            }
            style={{ marginBottom: '2rem' }}
          >
            {committeeInfoExpanded && (
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
            )}
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
          ...(user.permissions?.manage_committees ? [{ label: 'Committees', path: 'committees' }] : []),
          ...(user.USER_ORG_ROLE === 'Data & Systems Officer' ? [{ label: 'Admin', path: 'admin' }] : [])
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
