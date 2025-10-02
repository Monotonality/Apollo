import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS } from '../types/firebase';
import { 
  Serves,
  Committee, 
  Funding, 
  Volunteer, 
  Volunteered,
  Attended,
  Attendance
} from '../types/firebase';

// Generic CRUD operations
export const createDocument = async <T extends { [key: string]: any }>(
  collectionName: string, 
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error(`Create document error in ${collectionName}:`, error);
    throw error;
  }
};

export const getDocument = async <T>(collectionName: string, id: string): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as T;
    }
    
    return null;
  } catch (error) {
    console.error(`Get document error in ${collectionName}:`, error);
    throw error;
  }
};

export const updateDocument = async <T extends { [key: string]: any }>(
  collectionName: string, 
  id: string, 
  data: Partial<Omit<T, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error(`Update document error in ${collectionName}:`, error);
    throw error;
  }
};

export const deleteDocument = async (collectionName: string, id: string): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Delete document error in ${collectionName}:`, error);
    throw error;
  }
};

export const getDocuments = async <T>(
  collectionName: string,
  filters?: { field: string; operator: any; value: any }[],
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'asc',
  limitCount?: number
): Promise<T[]> => {
  try {
    let q: any = collection(db, collectionName);
    
    // Apply filters
    if (filters) {
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
    }
    
    // Apply ordering
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }
    
    // Apply limit
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as T;
    });
  } catch (error) {
    console.error(`Get documents error in ${collectionName}:`, error);
    throw error;
  }
};

// SERVES - User committee membership operations
export const createServes = async (data: Omit<Serves, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  return createDocument<Serves>(COLLECTIONS.SERVES, data);
};

export const getUserCommittees = async (uid: string): Promise<Serves[]> => {
  return getDocuments<Serves>(COLLECTIONS.SERVES, [{ field: 'UID', operator: '==', value: uid }], 'SERVES_JOIN_DATE', 'desc');
};

// COMMITTEE - Committee operations
export const createCommittee = async (data: Omit<Committee, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  return createDocument<Committee>(COLLECTIONS.COMMITTEE, data);
};

export const getCommittee = async (id: string): Promise<Committee | null> => {
  return getDocument<Committee>(COLLECTIONS.COMMITTEE, id);
};

export const getCommittees = async (): Promise<Committee[]> => {
  return getDocuments<Committee>(COLLECTIONS.COMMITTEE, undefined, 'COMM_NAME');
};

export const updateCommittee = async (id: string, data: Partial<Omit<Committee, 'id' | 'createdAt'>>): Promise<void> => {
  return updateDocument<Committee>(COLLECTIONS.COMMITTEE, id, data);
};

export const deleteCommittee = async (id: string): Promise<void> => {
  return deleteDocument(COLLECTIONS.COMMITTEE, id);
};

// FUNDING - Funding operations
export const createFunding = async (data: Omit<Funding, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  return createDocument<Funding>(COLLECTIONS.FUNDING, data);
};

export const getFunding = async (uid?: string, commId?: string): Promise<Funding[]> => {
  const filters = [];
  if (uid) filters.push({ field: 'UID', operator: '==', value: uid });
  if (commId) filters.push({ field: 'COMM_ID', operator: '==', value: commId });
  
  return getDocuments<Funding>(COLLECTIONS.FUNDING, filters, 'FUND_TIMESTAMP', 'desc');
};

// VOLUNTEER - Volunteer opportunity operations
export const createVolunteer = async (data: Omit<Volunteer, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  return createDocument<Volunteer>(COLLECTIONS.VOLUNTEER, data);
};

export const getVolunteers = async (): Promise<Volunteer[]> => {
  return getDocuments<Volunteer>(COLLECTIONS.VOLUNTEER, undefined, 'VOL_DATE', 'asc');
};

// VOLUNTEERED - User volunteer participation operations
export const createVolunteered = async (data: Omit<Volunteered, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  return createDocument<Volunteered>(COLLECTIONS.VOLUNTEERED, data);
};

export const getUserVolunteering = async (uid: string): Promise<Volunteered[]> => {
  return getDocuments<Volunteered>(COLLECTIONS.VOLUNTEERED, [{ field: 'UID', operator: '==', value: uid }], 'VOL_DATE_REQUESTED', 'desc');
};

// ATTENDED - User attendance operations
export const createAttended = async (data: Omit<Attended, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  return createDocument<Attended>(COLLECTIONS.ATTENDED, data);
};

export const getUserAttendance = async (uid: string): Promise<Attended[]> => {
  return getDocuments<Attended>(COLLECTIONS.ATTENDED, [{ field: 'UID', operator: '==', value: uid }], 'ATNDED_TIMESTAMP', 'desc');
};

// ATTENDANCE - Attendance event operations
export const createAttendance = async (data: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  return createDocument<Attendance>(COLLECTIONS.ATTENDANCE, data);
};

export const getAttendanceEvents = async (): Promise<Attendance[]> => {
  return getDocuments<Attendance>(COLLECTIONS.ATTENDANCE, undefined, 'ATND_TIMESTAMP', 'desc');
};

export const getLiveAttendance = async (): Promise<Attendance[]> => {
  return getDocuments<Attendance>(COLLECTIONS.ATTENDANCE, [{ field: 'ATND_IS_LIVE', operator: '==', value: true }], 'ATND_TIMESTAMP', 'desc');
};
