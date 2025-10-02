import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserRole } from '../types/auth';
import { UserProfile, UpdateUserData, CreateUserData } from '../types/user';
import { COLLECTIONS } from '../types/firebase';
import { getRolePermissions } from '../utils/roles';

// Helper function to create fallback user profile
const createFallbackUserProfile = (firebaseUser: FirebaseUser, role: UserRole = 'Pending User'): UserProfile => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || '',
    USER_FNAME: '',
    USER_LNAME: '',
    USER_IS_ACTIVE: true,
    USER_LINKEDIN: '',
    USER_ORG_ROLE: role,
    USER_TOTAL_VOL: 0,
    USER_CURRENT_VOL: 0,
    USER_ATND_TOTAL: 0,
    USER_IS_ATND_EXEMPT: false,
    permissions: getRolePermissions(role),
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<UserProfile> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Get user profile from Firestore
    const userProfile = await getUserProfile(firebaseUser.uid);
    
    return userProfile || createFallbackUserProfile(firebaseUser);
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Create new user
export const createUser = async (userData: CreateUserData): Promise<UserProfile> => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    const firebaseUser = userCredential.user;
    
    // Generate display name from first and last name
    const displayName = `${userData.firstName} ${userData.lastName}`;
    
    // Update Firebase Auth profile
    await updateProfile(firebaseUser, {
      displayName: displayName
    });
    
    // Check if this is the first user (Data & Systems Officer)
    const existingUsers = await getDocs(collection(db, COLLECTIONS.USER));
    const isFirstUser = existingUsers.empty;
    const userRole: UserRole = isFirstUser ? 'Data & Systems Officer' : 'Pending User';
    
    // Create user profile in Firestore with database schema fields
    const userProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: userData.email,
      displayName: displayName,
      USER_FNAME: userData.firstName,
      USER_LNAME: userData.lastName,
      USER_IS_ACTIVE: true,
      USER_LINKEDIN: '', // Default to empty string (null equivalent)
      USER_ORG_ROLE: userRole,
      USER_TOTAL_VOL: 0,
      USER_CURRENT_VOL: 0,
      USER_ATND_TOTAL: 0,
      USER_IS_ATND_EXEMPT: false,
      
      // Additional fields for application functionality
      permissions: getRolePermissions(userRole),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, COLLECTIONS.USER, firebaseUser.uid), userProfile);
    
    return userProfile;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USER, uid));
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate()
      } as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

// Update user role
export const updateUserRole = async (uid: string, role: UserRole): Promise<void> => {
  try {
    const userRef = doc(db, COLLECTIONS.USER, uid);
    await updateDoc(userRef, {
      role,
      permissions: getRolePermissions(role),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Update user role error:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (uid: string, updateData: UpdateUserData): Promise<void> => {
  try {
    const userRef = doc(db, COLLECTIONS.USER, uid);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
};

// Convert Firebase User to our UserProfile type
export const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<UserProfile> => {
  const userProfile = await getUserProfile(firebaseUser.uid);
  
  return userProfile || createFallbackUserProfile(firebaseUser);
};
