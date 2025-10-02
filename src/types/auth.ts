import { UserProfile } from './user';

// User roles as defined in auth.json
export type UserRole = 
  | 'Pending User'
  | 'Member'
  | 'Finance Officer'
  | 'Internal Affairs Officer'
  | 'Vice President'
  | 'President'
  | 'Program Manager'
  | 'Dean'
  | 'Data & Systems Officer';

// Permission types
export interface Permissions {
  view_dashboard: boolean;
  approve_attendance: boolean;
  create_attendance: boolean;
  approve_funds: boolean;
  approve_volunteering: boolean;
  manage_site: boolean;
  approve_members: boolean;
  create_volunteering: boolean;
  create_committees: boolean;
  manage_committees: boolean;
}

// Role definition with priority and permissions
export interface Role {
  priority: number;
  permissions: Permissions;
}

// Authentication context type
export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (uid: string, role: UserRole) => Promise<void>;
}
