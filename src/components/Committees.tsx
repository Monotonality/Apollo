import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS } from '../types/firebase';
import { UserProfile } from '../types/user';
import { Committee as CommitteeType } from '../types/firebase';
import PageContainer from './common/PageContainer';
import Header from './common/Header';
import Card from './common/Card';
import Button from './common/Button';
import Select, { SelectOption } from './common/Select';

interface CommitteesProps {
  user: UserProfile;
  onSignOut: () => void;
  onNavigate?: (page: string) => void;
}

const Committees: React.FC<CommitteesProps> = ({ user, onSignOut, onNavigate }) => {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [committees, setCommittees] = useState<CommitteeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingCommittee, setUpdatingCommittee] = useState<string | null>(null);
  const [deletingCommittee, setDeletingCommittee] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({
    active: true,
    inactive: true
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    chair: '',
    viceChair: ''
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
      
      const committeesList: CommitteeType[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const committee = {
          id: doc.id,
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
        VICE_CHAIR_ID: formData.viceChair || null,
        COMM_IS_ACTIVE: true,
        COMM_TIMESTAMP: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.COMMITTEE), committeeData);
      
      // Create SERVES record for the chair if chair is selected
      if (formData.chair) {
        const servesData = {
          UID: formData.chair,
          COMM_ID: docRef.id,
          SERVES_JOIN_DATE: new Date(),
          SERVES_ROLE: 'Chair',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await addDoc(collection(db, COLLECTIONS.SERVES), servesData);
      }

      // Create SERVES record for the vice chair if vice chair is selected
      if (formData.viceChair) {
        const viceChairServesData = {
          UID: formData.viceChair,
          COMM_ID: docRef.id,
          SERVES_JOIN_DATE: new Date(),
          SERVES_ROLE: 'Vice Chair',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await addDoc(collection(db, COLLECTIONS.SERVES), viceChairServesData);
      }
      
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
      chair: '',
      viceChair: ''
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
      
      // Get current committee to find old chair
      const currentCommittee = committees.find(c => c.id === committeeId);
      const oldChairId = currentCommittee?.CHAIR_ID;
      
      // Delete old chair's SERVES record if exists
      if (oldChairId) {
        const oldServesQuery = query(
          collection(db, COLLECTIONS.SERVES),
          where('UID', '==', oldChairId),
          where('COMM_ID', '==', committeeId),
          where('SERVES_ROLE', '==', 'Chair')
        );
        const oldServesSnapshot = await getDocs(oldServesQuery);
        const deleteOldServesPromises = oldServesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deleteOldServesPromises);
      }
      
      // Create new chair's SERVES record if new chair selected
      if (chairIdToStore) {
        const newServesData = {
          UID: chairIdToStore,
          COMM_ID: committeeId,
          SERVES_JOIN_DATE: new Date(),
          SERVES_ROLE: 'Chair',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await addDoc(collection(db, COLLECTIONS.SERVES), newServesData);
      }
      
      // Update committee document
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

  const handleViceChairChange = async (committeeId: string, newViceChairId: string) => {
    try {
      setUpdatingCommittee(committeeId);
      const committeeRef = doc(db, COLLECTIONS.COMMITTEE, committeeId);
      
      // Convert empty string to null for database storage
      const viceChairIdToStore = newViceChairId === '' ? null : newViceChairId;
      
      // Get current committee to find old vice chair
      const currentCommittee = committees.find(c => c.id === committeeId);
      const oldViceChairId = currentCommittee?.VICE_CHAIR_ID;
      
      // Delete old vice chair's SERVES record if exists
      if (oldViceChairId) {
        const oldServesQuery = query(
          collection(db, COLLECTIONS.SERVES),
          where('UID', '==', oldViceChairId),
          where('COMM_ID', '==', committeeId),
          where('SERVES_ROLE', '==', 'Vice Chair')
        );
        const oldServesSnapshot = await getDocs(oldServesQuery);
        const deleteOldServesPromises = oldServesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deleteOldServesPromises);
      }
      
      // Create new vice chair's SERVES record if new vice chair selected
      if (viceChairIdToStore) {
        const newServesData = {
          UID: viceChairIdToStore,
          COMM_ID: committeeId,
          SERVES_JOIN_DATE: new Date(),
          SERVES_ROLE: 'Vice Chair',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await addDoc(collection(db, COLLECTIONS.SERVES), newServesData);
      }
      
      // Update committee document
      await updateDoc(committeeRef, {
        VICE_CHAIR_ID: viceChairIdToStore,
        updatedAt: new Date()
      });
      
      // Update local state
      setCommittees(prevCommittees => 
        prevCommittees.map(committee => 
          committee.id === committeeId 
            ? { ...committee, VICE_CHAIR_ID: viceChairIdToStore, updatedAt: new Date() }
            : committee
        )
      );
    } catch (error: any) {
      console.error('Error updating committee vice chair:', error);
      setError('Failed to update committee vice chair. Please try again.');
    } finally {
      setUpdatingCommittee(null);
    }
  };

  const handleActiveStatusChange = async (committeeId: string, isActive: boolean) => {
    try {
      setUpdatingCommittee(committeeId);
      const committeeRef = doc(db, COLLECTIONS.COMMITTEE, committeeId);
      
      // Get current committee to find current chair and vice chair
      const currentCommittee = committees.find(c => c.id === committeeId);
      const currentChairId = currentCommittee?.CHAIR_ID;
      const currentViceChairId = currentCommittee?.VICE_CHAIR_ID;
      
      // If setting to inactive, remove the chair and vice chair and delete their SERVES records
      const updateData: any = {
        COMM_IS_ACTIVE: isActive,
        updatedAt: new Date()
      };
      
      if (!isActive) {
        updateData.CHAIR_ID = null;
        updateData.VICE_CHAIR_ID = null;
        
        // Delete chair's SERVES record if exists
        if (currentChairId) {
          const chairServesQuery = query(
            collection(db, COLLECTIONS.SERVES),
            where('UID', '==', currentChairId),
            where('COMM_ID', '==', committeeId),
            where('SERVES_ROLE', '==', 'Chair')
          );
          const chairServesSnapshot = await getDocs(chairServesQuery);
          const deleteChairServesPromises = chairServesSnapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deleteChairServesPromises);
        }
        
        // Delete vice chair's SERVES record if exists
        if (currentViceChairId) {
          const viceChairServesQuery = query(
            collection(db, COLLECTIONS.SERVES),
            where('UID', '==', currentViceChairId),
            where('COMM_ID', '==', committeeId),
            where('SERVES_ROLE', '==', 'Vice Chair')
          );
          const viceChairServesSnapshot = await getDocs(viceChairServesQuery);
          const deleteViceChairServesPromises = viceChairServesSnapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deleteViceChairServesPromises);
        }
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
                VICE_CHAIR_ID: !isActive ? null : committee.VICE_CHAIR_ID,
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

  const getViceChairName = (viceChairId: string | null) => {
    if (!viceChairId) return 'No vice chair assigned';
    const viceChair = members.find(member => member.uid === viceChairId);
    return viceChair ? `${viceChair.USER_FNAME} ${viceChair.USER_LNAME}` : 'Unknown';
  };

  const getMemberOptions = (): SelectOption[] => {
    return [
      { value: '', label: 'None' },
      ...members.map(member => ({
        value: member.uid,
        label: `${member.USER_FNAME} ${member.USER_LNAME}`
      }))
    ];
  };

  const handleDeleteCommittee = async (committeeId: string) => {
    if (!window.confirm('Are you sure you want to delete this committee? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingCommittee(committeeId);
      setError(null);
      setSuccess(null);

      // First, delete all SERVES records for this committee
      const servesRef = collection(db, COLLECTIONS.SERVES);
      const servesQuery = query(servesRef, where('COMM_ID', '==', committeeId));
      const servesSnapshot = await getDocs(servesQuery);
      
      const deleteServesPromises = servesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteServesPromises);

      // Then, delete the committee document
      const committeeRef = doc(db, COLLECTIONS.COMMITTEE, committeeId);
      await deleteDoc(committeeRef);

      // Update local state
      setCommittees(prevCommittees => 
        prevCommittees.filter(committee => committee.id !== committeeId)
      );

      setSuccess('Committee deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error deleting committee:', error);
      setError('Failed to delete committee. Please try again.');
    } finally {
      setDeletingCommittee(null);
    }
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
          
          .collapsible-content {
            overflow: hidden;
            transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
            max-height: 0;
            opacity: 0;
          }
          
          .collapsible-content.open {
            max-height: 2000px;
            opacity: 1;
          }
          
          .collapse-button {
            transition: transform 0.2s ease-in-out;
          }
          
          .collapse-button.rotated {
            transform: rotate(180deg);
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

            {/* Vice Chair Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#154734' }}>
                Committee Vice Chair
              </label>
              <select
                name="viceChair"
                value={formData.viceChair}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">Select a vice chair from active members (optional)</option>
                {members.map((member) => (
                  <option key={member.uid} value={member.uid}>
                    {member.USER_FNAME} {member.USER_LNAME} ({member.email})
                  </option>
                ))}
              </select>
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
                className={`collapse-button ${collapsedSections.active ? '' : 'rotated'}`}
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
                ▼
              </button>
            </div>
          }
          style={{ marginBottom: '2rem' }}
        >
          <div className={`collapsible-content ${!collapsedSections.active ? 'open' : ''}`}>
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
                    {committee.VICE_CHAIR_ID && (
                      <p style={{ margin: '0 0 0.25rem 0', color: '#666', fontSize: '0.875rem', textAlign: 'left' }}>
                        <strong>Vice Chair:</strong> {getViceChairName(committee.VICE_CHAIR_ID)}
                      </p>
                    )}
                    <p style={{ margin: '0', color: '#999', fontSize: '0.75rem', textAlign: 'left' }}>
                      Created: {committee.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="member-buttons" style={{ alignItems: 'center', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'bold' }}>Chair:</label>
                      <Select
                        value={committee.CHAIR_ID || ''}
                        onChange={(value) => handleChairChange(committee.id, value)}
                        options={getMemberOptions()}
                        disabled={updatingCommittee === committee.id}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'bold' }}>Vice Chair:</label>
                      <Select
                        value={committee.VICE_CHAIR_ID || ''}
                        onChange={(value) => handleViceChairChange(committee.id, value)}
                        options={getMemberOptions()}
                        disabled={updatingCommittee === committee.id}
                      />
                    </div>
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
          </div>
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
                className={`collapse-button ${collapsedSections.inactive ? '' : 'rotated'}`}
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
                ▼
              </button>
            </div>
          }
          style={{ marginBottom: '2rem' }}
        >
          <div className={`collapsible-content ${!collapsedSections.inactive ? 'open' : ''}`}>
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
                    {committee.VICE_CHAIR_ID && (
                      <p style={{ margin: '0 0 0.25rem 0', color: '#999', fontSize: '0.875rem', textAlign: 'left' }}>
                        <strong>Vice Chair:</strong> {getViceChairName(committee.VICE_CHAIR_ID)}
                      </p>
                    )}
                    <p style={{ margin: '0', color: '#ccc', fontSize: '0.75rem', textAlign: 'left' }}>
                      Created: {committee.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="member-buttons" style={{ alignItems: 'center', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#999', fontWeight: 'bold' }}>Chair:</label>
                      <Select
                        value={committee.CHAIR_ID || ''}
                        onChange={(value) => handleChairChange(committee.id, value)}
                        options={getMemberOptions()}
                        disabled={true}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#999', fontWeight: 'bold' }}>Vice Chair:</label>
                      <Select
                        value={committee.VICE_CHAIR_ID || ''}
                        onChange={(value) => handleViceChairChange(committee.id, value)}
                        options={getMemberOptions()}
                        disabled={true}
                      />
                    </div>
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
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleDeleteCommittee(committee.id)}
                      disabled={deletingCommittee === committee.id}
                      style={{ backgroundColor: '#dc3545', borderColor: '#dc3545', color: 'white' }}
                    >
                      {deletingCommittee === committee.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </PageContainer>
  );
};

export default Committees;
