import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where,
  doc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS } from '../types/firebase';
import { UserRole } from '../types/auth';
import { getRolePermissions } from '../utils/roles';

// Dummy user data
const DUMMY_USERS = [
  {
    email: 'john.doe@utdallas.edu',
    displayName: 'John Doe',
    USER_FNAME: 'John',
    USER_LNAME: 'Doe',
    USER_IS_ACTIVE: true,
    USER_LINKEDIN: 'https://linkedin.com/in/johndoe',
    USER_ORG_ROLE: 'President' as UserRole,
    USER_TOTAL_VOL: 8,
    USER_CURRENT_VOL: 6,
    USER_ATND_TOTAL: 12,
    USER_IS_ATND_EXEMPT: false
  },
  {
    email: 'jane.smith@utdallas.edu',
    displayName: 'Jane Smith',
    USER_FNAME: 'Jane',
    USER_LNAME: 'Smith',
    USER_IS_ACTIVE: true,
    USER_LINKEDIN: 'https://linkedin.com/in/janesmith',
    USER_ORG_ROLE: 'Vice President' as UserRole,
    USER_TOTAL_VOL: 6,
    USER_CURRENT_VOL: 4,
    USER_ATND_TOTAL: 10,
    USER_IS_ATND_EXEMPT: false
  },
  {
    email: 'mike.johnson@utdallas.edu',
    displayName: 'Mike Johnson',
    USER_FNAME: 'Mike',
    USER_LNAME: 'Johnson',
    USER_IS_ACTIVE: true,
    USER_LINKEDIN: 'https://linkedin.com/in/mikejohnson',
    USER_ORG_ROLE: 'Internal Affairs Officer' as UserRole,
    USER_TOTAL_VOL: 4,
    USER_CURRENT_VOL: 2,
    USER_ATND_TOTAL: 8,
    USER_IS_ATND_EXEMPT: false
  },
  {
    email: 'sarah.wilson@utdallas.edu',
    displayName: 'Sarah Wilson',
    USER_FNAME: 'Sarah',
    USER_LNAME: 'Wilson',
    USER_IS_ACTIVE: true,
    USER_LINKEDIN: 'https://linkedin.com/in/sarahwilson',
    USER_ORG_ROLE: 'Finance Officer' as UserRole,
    USER_TOTAL_VOL: 5,
    USER_CURRENT_VOL: 3,
    USER_ATND_TOTAL: 9,
    USER_IS_ATND_EXEMPT: false
  },
  {
    email: 'alex.brown@utdallas.edu',
    displayName: 'Alex Brown',
    USER_FNAME: 'Alex',
    USER_LNAME: 'Brown',
    USER_IS_ACTIVE: true,
    USER_LINKEDIN: 'https://linkedin.com/in/alexbrown',
    USER_ORG_ROLE: 'Member' as UserRole,
    USER_TOTAL_VOL: 3,
    USER_CURRENT_VOL: 1,
    USER_ATND_TOTAL: 6,
    USER_IS_ATND_EXEMPT: false
  },
  {
    email: 'emma.davis@utdallas.edu',
    displayName: 'Emma Davis',
    USER_FNAME: 'Emma',
    USER_LNAME: 'Davis',
    USER_IS_ACTIVE: true,
    USER_LINKEDIN: 'https://linkedin.com/in/emmadavis',
    USER_ORG_ROLE: 'Member' as UserRole,
    USER_TOTAL_VOL: 2,
    USER_CURRENT_VOL: 0,
    USER_ATND_TOTAL: 4,
    USER_IS_ATND_EXEMPT: false
  },
  {
    email: 'david.miller@utdallas.edu',
    displayName: 'David Miller',
    USER_FNAME: 'David',
    USER_LNAME: 'Miller',
    USER_IS_ACTIVE: true,
    USER_LINKEDIN: 'https://linkedin.com/in/davidmiller',
    USER_ORG_ROLE: 'Member' as UserRole,
    USER_TOTAL_VOL: 1,
    USER_CURRENT_VOL: 0,
    USER_ATND_TOTAL: 3,
    USER_IS_ATND_EXEMPT: false
  },
  {
    email: 'lisa.garcia@utdallas.edu',
    displayName: 'Lisa Garcia',
    USER_FNAME: 'Lisa',
    USER_LNAME: 'Garcia',
    USER_IS_ACTIVE: false,
    USER_LINKEDIN: 'https://linkedin.com/in/lisagarcia',
    USER_ORG_ROLE: 'Inactive Member' as UserRole,
    USER_TOTAL_VOL: 0,
    USER_CURRENT_VOL: 0,
    USER_ATND_TOTAL: 0,
    USER_IS_ATND_EXEMPT: false
  }
];

// Dummy committee data
const DUMMY_COMMITTEES = [
  {
    COMM_NAME: 'Academic Affairs Committee',
    COMM_DESCRIPTION: 'Oversees academic policies and student academic concerns',
    CHAIR_ID: null, // Will be set after users are created
    VICE_CHAIR_ID: null, // Will be set after users are created
    COMM_IS_ACTIVE: true,
    COMM_TIMESTAMP: new Date()
  },
  {
    COMM_NAME: 'Student Life Committee',
    COMM_DESCRIPTION: 'Manages student activities and campus life initiatives',
    CHAIR_ID: null,
    VICE_CHAIR_ID: null,
    COMM_IS_ACTIVE: true,
    COMM_TIMESTAMP: new Date()
  },
  {
    COMM_NAME: 'Finance Committee',
    COMM_DESCRIPTION: 'Handles budget allocation and financial planning',
    CHAIR_ID: null,
    VICE_CHAIR_ID: null,
    COMM_IS_ACTIVE: true,
    COMM_TIMESTAMP: new Date()
  },
  {
    COMM_NAME: 'Events Committee',
    COMM_DESCRIPTION: 'Plans and coordinates organizational events',
    CHAIR_ID: null,
    VICE_CHAIR_ID: null,
    COMM_IS_ACTIVE: false,
    COMM_TIMESTAMP: new Date()
  }
];

export class DummyDataService {
  /**
   * Add dummy data to the database
   */
  static async addDummyData(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('Starting to add dummy data...');
      
      // Step 1: Add dummy users
      const userIds: string[] = [];
      const batch = writeBatch(db);
      
      for (const userData of DUMMY_USERS) {
        const userWithPermissions = {
          ...userData,
          permissions: getRolePermissions(userData.USER_ORG_ROLE),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const userRef = doc(collection(db, COLLECTIONS.USER));
        batch.set(userRef, userWithPermissions);
        userIds.push(userRef.id);
      }
      
      await batch.commit();
      console.log('Added dummy users:', userIds.length);
      
      // Step 2: Add dummy committees with chair assignments
      const committeeIds: string[] = [];
      const committeeBatch = writeBatch(db);
      
      for (let i = 0; i < DUMMY_COMMITTEES.length; i++) {
        const committeeData = {
          ...DUMMY_COMMITTEES[i],
          CHAIR_ID: i < userIds.length ? userIds[i] : null,
          VICE_CHAIR_ID: i + 1 < userIds.length ? userIds[i + 1] : null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const committeeRef = doc(collection(db, COLLECTIONS.COMMITTEE));
        committeeBatch.set(committeeRef, committeeData);
        committeeIds.push(committeeRef.id);
      }
      
      await committeeBatch.commit();
      console.log('Added dummy committees:', committeeIds.length);
      
      // Step 3: Add SERVES records
      const servesBatch = writeBatch(db);
      let servesCount = 0;
      
      // Add chair and vice chair SERVES records
      for (let i = 0; i < committeeIds.length; i++) {
        const committeeId = committeeIds[i];
        const chairId = i < userIds.length ? userIds[i] : null;
        const viceChairId = i + 1 < userIds.length ? userIds[i + 1] : null;
        
        if (chairId) {
          const chairServesRef = doc(collection(db, COLLECTIONS.SERVES));
          servesBatch.set(chairServesRef, {
            UID: chairId,
            COMM_ID: committeeId,
            SERVES_JOIN_DATE: new Date(),
            SERVES_ROLE: 'Chair',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          servesCount++;
        }
        
        if (viceChairId) {
          const viceChairServesRef = doc(collection(db, COLLECTIONS.SERVES));
          servesBatch.set(viceChairServesRef, {
            UID: viceChairId,
            COMM_ID: committeeId,
            SERVES_JOIN_DATE: new Date(),
            SERVES_ROLE: 'Vice Chair',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          servesCount++;
        }
        
        // Add some regular members to committees
        const memberStartIndex = Math.max(4, i + 2);
        for (let j = memberStartIndex; j < Math.min(memberStartIndex + 2, userIds.length); j++) {
          const memberServesRef = doc(collection(db, COLLECTIONS.SERVES));
          servesBatch.set(memberServesRef, {
            UID: userIds[j],
            COMM_ID: committeeId,
            SERVES_JOIN_DATE: new Date(),
            SERVES_ROLE: 'Member',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          servesCount++;
        }
      }
      
      await servesBatch.commit();
      console.log('Added SERVES records:', servesCount);
      
      return {
        success: true,
        message: `Successfully added dummy data: ${userIds.length} users, ${committeeIds.length} committees, ${servesCount} SERVES records`,
        details: {
          users: userIds.length,
          committees: committeeIds.length,
          serves: servesCount
        }
      };
      
    } catch (error: any) {
      console.error('Error adding dummy data:', error);
      return {
        success: false,
        message: `Failed to add dummy data: ${error.message}`
      };
    }
  }
  
  /**
   * Clear all dummy data from the database
   */
  static async clearDummyData(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('Starting to clear dummy data...');
      
      let deletedCounts = {
        users: 0,
        committees: 0,
        serves: 0
      };
      
      // Clear SERVES records
      const servesQuery = query(collection(db, COLLECTIONS.SERVES));
      const servesSnapshot = await getDocs(servesQuery);
      const servesBatch = writeBatch(db);
      
      servesSnapshot.docs.forEach(doc => {
        servesBatch.delete(doc.ref);
        deletedCounts.serves++;
      });
      
      await servesBatch.commit();
      console.log('Deleted SERVES records:', deletedCounts.serves);
      
      // Clear committees
      const committeesQuery = query(collection(db, COLLECTIONS.COMMITTEE));
      const committeesSnapshot = await getDocs(committeesQuery);
      const committeesBatch = writeBatch(db);
      
      committeesSnapshot.docs.forEach(doc => {
        committeesBatch.delete(doc.ref);
        deletedCounts.committees++;
      });
      
      await committeesBatch.commit();
      console.log('Deleted committees:', deletedCounts.committees);
      
      // Clear users (but keep the current user)
      const usersQuery = query(collection(db, COLLECTIONS.USER));
      const usersSnapshot = await getDocs(usersQuery);
      const usersBatch = writeBatch(db);
      
      usersSnapshot.docs.forEach(doc => {
        // Don't delete the current user (Data & Systems Officer)
        const userData = doc.data();
        if (userData.USER_ORG_ROLE !== 'Data & Systems Officer') {
          usersBatch.delete(doc.ref);
          deletedCounts.users++;
        }
      });
      
      await usersBatch.commit();
      console.log('Deleted users:', deletedCounts.users);
      
      return {
        success: true,
        message: `Successfully cleared dummy data: ${deletedCounts.users} users, ${deletedCounts.committees} committees, ${deletedCounts.serves} SERVES records`,
        details: deletedCounts
      };
      
    } catch (error: any) {
      console.error('Error clearing dummy data:', error);
      return {
        success: false,
        message: `Failed to clear dummy data: ${error.message}`
      };
    }
  }
  
  /**
   * Check if dummy data exists
   */
  static async checkDummyDataExists(): Promise<{ exists: boolean; counts: { users: number; committees: number; serves: number } }> {
    try {
      const [usersSnapshot, committeesSnapshot, servesSnapshot] = await Promise.all([
        getDocs(query(collection(db, COLLECTIONS.USER))),
        getDocs(query(collection(db, COLLECTIONS.COMMITTEE))),
        getDocs(query(collection(db, COLLECTIONS.SERVES)))
      ]);
      
      return {
        exists: usersSnapshot.docs.length > 1 || committeesSnapshot.docs.length > 0 || servesSnapshot.docs.length > 0,
        counts: {
          users: usersSnapshot.docs.length,
          committees: committeesSnapshot.docs.length,
          serves: servesSnapshot.docs.length
        }
      };
    } catch (error) {
      console.error('Error checking dummy data:', error);
      return {
        exists: false,
        counts: { users: 0, committees: 0, serves: 0 }
      };
    }
  }
}
