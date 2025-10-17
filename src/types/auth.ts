import { UserProfile } from './user';

// User roles as defined in auth.json
export type UserRole = 
  | 'Pending User'
  | 'Inactive Member'
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

// Roles with their priorities and permissions (based on auth.json)
export const ROLES: Record<UserRole, Role> = {
  'Pending User': {
    priority: 0,
    permissions: {
      view_dashboard: false,
      approve_attendance: false,
      create_attendance: false,
      approve_funds: false,
      approve_volunteering: false,
      manage_site: false,
      approve_members: false,
      create_volunteering: false,
      create_committees: false,
      manage_committees: false
    }
  },
  'Inactive Member': {
    priority: 0,
    permissions: {
      view_dashboard: false,
      approve_attendance: false,
      create_attendance: false,
      approve_funds: false,
      approve_volunteering: false,
      manage_site: false,
      approve_members: false,
      create_volunteering: false,
      create_committees: false,
      manage_committees: false
    }
  },
  'Member': {
    priority: 1,
    permissions: {
      view_dashboard: true,
      approve_attendance: false,
      create_attendance: false,
      approve_funds: false,
      approve_volunteering: false,
      manage_site: false,
      approve_members: false,
      create_volunteering: false,
      create_committees: false,
      manage_committees: false
    }
  },
  'Finance Officer': {
    priority: 2,
    permissions: {
      view_dashboard: true,
      approve_attendance: false,
      create_attendance: false,
      approve_funds: true,
      approve_volunteering: false,
      manage_site: false,
      approve_members: true,
      create_volunteering: false,
      create_committees: true,
      manage_committees: true
    }
  },
  'Internal Affairs Officer': {
    priority: 3,
    permissions: {
      view_dashboard: true,
      approve_attendance: true,
      create_attendance: true,
      approve_funds: false,
      approve_volunteering: true,
      manage_site: false,
      approve_members: true,
      create_volunteering: true,
      create_committees: true,
      manage_committees: true
    }
  },
  'Vice President': {
    priority: 4,
    permissions: {
      view_dashboard: true,
      approve_attendance: true,
      create_attendance: true,
      approve_funds: true,
      approve_volunteering: true,
      manage_site: false,
      approve_members: true,
      create_volunteering: true,
      create_committees: true,
      manage_committees: true
    }
  },
  'President': {
    priority: 5,
    permissions: {
      view_dashboard: true,
      approve_attendance: true,
      create_attendance: true,
      approve_funds: true,
      approve_volunteering: true,
      manage_site: true,
      approve_members: true,
      create_volunteering: true,
      create_committees: true,
      manage_committees: true
    }
  },
  'Program Manager': {
    priority: 5,
    permissions: {
      view_dashboard: true,
      approve_attendance: true,
      create_attendance: true,
      approve_funds: true,
      approve_volunteering: true,
      manage_site: true,
      approve_members: true,
      create_volunteering: true,
      create_committees: true,
      manage_committees: true
    }
  },
  'Dean': {
    priority: 5,
    permissions: {
      view_dashboard: true,
      approve_attendance: true,
      create_attendance: true,
      approve_funds: true,
      approve_volunteering: true,
      manage_site: true,
      approve_members: true,
      create_volunteering: true,
      create_committees: true,
      manage_committees: true
    }
  },
  'Data & Systems Officer': {
    priority: 5,
    permissions: {
      view_dashboard: true,
      approve_attendance: true,
      create_attendance: true,
      approve_funds: true,
      approve_volunteering: true,
      manage_site: true,
      approve_members: true,
      create_volunteering: true,
      create_committees: true,
      manage_committees: true
    }
  }
};

// Authentication context type
export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (uid: string, role: UserRole) => Promise<void>;
}
