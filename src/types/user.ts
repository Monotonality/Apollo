import { UserRole, Permissions } from './auth';

// Extended user profile information based on database schema
export interface UserProfile {
  uid: string;                    // FK to Firebase Auth ID
  email: string;
  displayName: string;
  USER_FNAME: string;             // User's first name
  USER_LNAME: string;             // User's last name
  USER_IS_ACTIVE: boolean;        // Indicates if the user account is active
  USER_LINKEDIN?: string;         // User's LinkedIn profile information (URL or ID)
  USER_ORG_ROLE: UserRole;        // The user's role within an organization
  USER_TOTAL_VOL: number;         // Total number of volunteer hours accrued
  USER_CURRENT_VOL: number;       // Current/active volunteer hours
  USER_ATND_TOTAL: number;        // Total attendance count for the user
  USER_IS_ATND_EXEMPT: boolean;   // Indicates if the user is exempt from attendance requirements
  
  // Additional fields for application functionality
  permissions: Permissions;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// User creation/update data
export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserData {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  linkedin?: string;
  studentId?: string;
  gpa?: number;
  major?: string;
  year?: string;
  phone?: string;
  profilePicture?: string;
  isActive?: boolean;
  USER_IS_ACTIVE?: boolean;
  USER_LINKEDIN?: string;
  USER_ORG_ROLE?: UserRole;
  USER_TOTAL_VOL?: number;
  USER_CURRENT_VOL?: number;
  USER_ATND_TOTAL?: number;
  USER_IS_ATND_EXEMPT?: boolean;
}
