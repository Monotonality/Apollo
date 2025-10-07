import { UserRole, Role, Permissions } from '../types/auth';

// Role definitions based on auth.json
export const ROLE_DEFINITIONS: Record<UserRole, Role> = {
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
    priority: 2,
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
    priority: 3,
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
  'President': {
    priority: 4,
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
    priority: 6,
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
    priority: 7,
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

// Helper functions
export const getRolePermissions = (role: UserRole): Permissions => {
  return ROLE_DEFINITIONS[role].permissions;
};

export const getRolePriority = (role: UserRole): number => {
  return ROLE_DEFINITIONS[role].priority;
};

export const hasPermission = (userRole: UserRole, permission: keyof Permissions): boolean => {
  return ROLE_DEFINITIONS[userRole].permissions[permission];
};

export const canManageRole = (managerRole: UserRole, targetRole: UserRole): boolean => {
  return ROLE_DEFINITIONS[managerRole].priority > ROLE_DEFINITIONS[targetRole].priority;
};

// Helper function to check permissions using USER_ORG_ROLE
export const hasPermissionFromProfile = (userProfile: { USER_ORG_ROLE: UserRole }, permission: keyof Permissions): boolean => {
  return hasPermission(userProfile.USER_ORG_ROLE, permission);
};

export const getAllRoles = (): UserRole[] => {
  return Object.keys(ROLE_DEFINITIONS) as UserRole[];
};

export const getRolesByPriority = (): UserRole[] => {
  return getAllRoles().sort((a, b) => ROLE_DEFINITIONS[a].priority - ROLE_DEFINITIONS[b].priority);
};
