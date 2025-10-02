import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS } from '../types/firebase';
import { UserProfile } from '../types/user';
import { Committee } from '../types/firebase';
import PageContainer from './common/PageContainer';
import Header from './common/Header';
import Card from './common/Card';
import Button from './common/Button';

interface CommitteesProps {
  user: UserProfile;
  onSignOut: () => void;
  onNavigate?: (page: string) => void;
}

const Committees: React.FC<CommitteesProps> = ({ user, onSignOut, onNavigate }) => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingCommittee, setUpdatingCommittee] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({
    active: true,
    inactive: true
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    chair: ''
  });

  useEffect(() => {
    fetchMembers();
    fetchCommittees();
  }, []);

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
        
        // Only include active members with Member role
        if (userProfile.USER_ORG_ROLE === 'Member' && userProfile.USER_IS_ACTIVE) {
          membersList.push(userProfile);
        }
      });
      
      setMembers(membersList);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchCommittees = async () => {
    try {
      setLoading(true);
      const committeesRef = collection(db, COLLECTIONS.COMMITTEE);
      const q = query(committeesRef, orderBy('COMM_NAME', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const committeesList: Committee[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const committee = {
          id: doc.id,
          COMM_ID: doc.id,
          COMM_NAME: data.COMM_NAME || '',
          COMM_DESCRIPTION: data.COMM_DESCRIPTION || '',
          CHAIR_ID: data.CHAIR_ID || '',
          COMM_IS_ACTIVE: data.COMM_IS_ACTIVE || false,
          COMM_TIMESTAMP: data.COMM_TIMESTAMP?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Committee;
        committeesList.push(committee);
      });
      
      setCommittees(committeesList);
    } catch (error) {
      console.error('Error fetching committees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.chair) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      // Create committee document
      const committeeData = {
        COMM_NAME: formData.name.trim(),
        COMM_DESCRIPTION: formData.description.trim(),
        CHAIR_ID: formData.chair,
        COMM_IS_ACTIVE: true,
        COMM_TIMESTAMP: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.COMMITTEE), committeeData);
      
      setSuccess(`Committee "${formData.name}" has been created successfully!`);
      resetForm();
      
      // Refresh committees list to show the new committee
      await fetchCommittees();
      
    } catch (error: any) {
      console.error('Error creating committee:', error);
      setError(error.message || 'Failed to create committee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      chair: ''
    });
    setIsCreating(false);
    setError(null);
    setSuccess(null);
  };

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChairChange = async (committeeId: string, newChairId: string) => {
    try {
      setUpdatingCommittee(committeeId);
      const committeeRef = doc(db, COLLECTIONS.COMMITTEE, committeeId);
      
      // Convert empty string to null for database storage
      const chairIdToStore = newChairId === '' ? null : newChairId;
      
      await updateDoc(committeeRef, {
        CHAIR_ID: chairIdToStore,
        updatedAt: new Date()
      });
      
      // Update local state
      setCommittees(prevCommittees => 
        prevCommittees.map(committee => 
          committee.id === committeeId 
            ? { ...committee, CHAIR_ID: chairIdToStore, updatedAt: new Date() }
            : committee
        )
      );
    } catch (error: any) {
      console.error('Error updating committee chair:', error);
      setError('Failed to update committee chair. Please try again.');
    } finally {
      setUpdatingCommittee(null);
    }
  };

  const handleActiveStatusChange = async (committeeId: string, isActive: boolean) => {
    try {
      setUpdatingCommittee(committeeId);
      const committeeRef = doc(db, COLLECTIONS.COMMITTEE, committeeId);
      
      // If setting to inactive, remove the chair
      const updateData: any = {
        COMM_IS_ACTIVE: isActive,
        updatedAt: new Date()
      };
      
      if (!isActive) {
        updateData.CHAIR_ID = null;
      }
      
      await updateDoc(committeeRef, updateData);
      
      // Update local state
      setCommittees(prevCommittees => 
        prevCommittees.map(committee => 
          committee.id === committeeId 
            ? { 
                ...committee, 
                COMM_IS_ACTIVE: isActive, 
                CHAIR_ID: !isActive ? null : committee.CHAIR_ID,
                updatedAt: new Date() 
              }
            : committee
        )
      );
    } catch (error: any) {
      console.error('Error updating committee status:', error);
      setError('Failed to update committee status. Please try again.');
    } finally {
      setUpdatingCommittee(null);
    }
  };

  const getChairName = (chairId: string) => {
    const chair = members.find(member => member.uid === chairId);
    return chair ? `${chair.USER_FNAME} ${chair.USER_LNAME}` : 'Unknown';
  };

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
          
          .member-item.inactive {
            opacity: 0.7;
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

      {/* Committee Creation */}
      <Card title="Committee Creation" style={{ marginBottom: '2rem' }}>
        {!isCreating ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: '#154734' }}>Create New Committee</strong>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                Set up a new committee with chair selection and configuration.
              </p>
            </div>
            <Button 
              variant="primary" 
              size="medium" 
              onClick={() => setIsCreating(true)}
              disabled={loading}
            >
              Create Committee
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            {/* Committee Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#154734' }}>
                Committee Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="Enter committee name"
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#154734' }}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
                placeholder="Describe the committee's purpose and responsibilities"
              />
            </div>

            {/* Chair Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#154734' }}>
                Committee Chair *
              </label>
              <select
                name="chair"
                value={formData.chair}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Select a chair from active members</option>
                {members.map((member) => (
                  <option key={member.uid} value={member.uid}>
                    {member.USER_FNAME} {member.USER_LNAME} ({member.email})
                  </option>
                ))}
              </select>
              {members.length === 0 && !loading && (
                <p style={{ margin: '0.5rem 0 0 0', color: '#dc3545', fontSize: '0.875rem' }}>
                  No active members available for chair selection.
                </p>
              )}
            </div>



            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button
                type="button"
                variant="secondary"
                size="medium"
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="medium"
                disabled={loading || isSubmitting || !formData.name || !formData.description || !formData.chair}
              >
                {isSubmitting ? 'Creating...' : 'Create Committee'}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Active Committees */}
      {committees.filter(committee => committee.COMM_IS_ACTIVE).length > 0 && (
        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>Active Committees ({committees.filter(committee => committee.COMM_IS_ACTIVE).length})</span>
              <button
                onClick={() => toggleSection('active')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0.25rem'
                }}
                aria-label={collapsedSections.active ? 'Expand section' : 'Collapse section'}
              >
                {collapsedSections.active ? '▼' : '▲'}
              </button>
            </div>
          }
          style={{ marginBottom: '2rem' }}
        >
          {!collapsedSections.active && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {committees.filter(committee => committee.COMM_IS_ACTIVE).map((committee) => (
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
                    <p style={{ margin: '0', color: '#999', fontSize: '0.75rem', textAlign: 'left' }}>
                      Created: {committee.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="member-buttons" style={{ alignItems: 'center' }}>
                    <select
                      value={committee.CHAIR_ID || ''}
                      onChange={(e) => handleChairChange(committee.id, e.target.value)}
                      disabled={updatingCommittee === committee.id}
                      style={{
                        padding: '0.25rem 0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        backgroundColor: updatingCommittee === committee.id ? '#f8f9fa' : '#fff',
                        cursor: updatingCommittee === committee.id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="">None</option>
                      {members.map((member) => (
                        <option key={member.uid} value={member.uid}>
                          {member.USER_FNAME} {member.USER_LNAME}
                        </option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={committee.COMM_IS_ACTIVE}
                        onChange={(e) => handleActiveStatusChange(committee.id, e.target.checked)}
                        disabled={updatingCommittee === committee.id}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <label style={{ fontSize: '0.875rem', color: '#666' }}>
                        Active
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Inactive Committees */}
      {committees.filter(committee => !committee.COMM_IS_ACTIVE).length > 0 && (
        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>Inactive Committees ({committees.filter(committee => !committee.COMM_IS_ACTIVE).length})</span>
              <button
                onClick={() => toggleSection('inactive')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0.25rem'
                }}
                aria-label={collapsedSections.inactive ? 'Expand section' : 'Collapse section'}
              >
                {collapsedSections.inactive ? '▼' : '▲'}
              </button>
            </div>
          }
          style={{ marginBottom: '2rem' }}
        >
          {!collapsedSections.inactive && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {committees.filter(committee => !committee.COMM_IS_ACTIVE).map((committee) => (
                <div key={committee.id} className="member-item inactive">
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#666', textAlign: 'left' }}>
                      {committee.COMM_NAME}
                    </h4>
                    <p style={{ margin: '0 0 0.25rem 0', color: '#999', textAlign: 'left' }}>
                      {committee.COMM_DESCRIPTION}
                    </p>
                    {committee.CHAIR_ID && (
                      <p style={{ margin: '0 0 0.25rem 0', color: '#999', fontSize: '0.875rem', textAlign: 'left' }}>
                        <strong>Chair:</strong> {getChairName(committee.CHAIR_ID)}
                      </p>
                    )}
                    <p style={{ margin: '0', color: '#ccc', fontSize: '0.75rem', textAlign: 'left' }}>
                      Created: {committee.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="member-buttons" style={{ alignItems: 'center' }}>
                    <select
                      value={committee.CHAIR_ID || ''}
                      onChange={(e) => handleChairChange(committee.id, e.target.value)}
                      disabled={updatingCommittee === committee.id}
                      style={{
                        padding: '0.25rem 0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        backgroundColor: updatingCommittee === committee.id ? '#f8f9fa' : '#fff',
                        cursor: updatingCommittee === committee.id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="">None</option>
                      {members.map((member) => (
                        <option key={member.uid} value={member.uid}>
                          {member.USER_FNAME} {member.USER_LNAME}
                        </option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={committee.COMM_IS_ACTIVE}
                        onChange={(e) => handleActiveStatusChange(committee.id, e.target.checked)}
                        disabled={updatingCommittee === committee.id}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <label style={{ fontSize: '0.875rem', color: '#999' }}>
                        Active
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </PageContainer>
  );
};

export default Committees;
