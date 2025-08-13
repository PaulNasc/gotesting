import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

// Single-tenant mode: when true, we bypass remote permissions and force master permissions
// Default to true if env is missing (safer for private/single setup)
const SINGLE_TENANT = String((import.meta as any).env?.VITE_SINGLE_TENANT ?? 'true') === 'true';

export type UserRole = 'master' | 'admin' | 'manager' | 'tester' | 'viewer';

export interface UserPermissions {
  can_manage_users: boolean;
  can_manage_plans: boolean;
  can_manage_cases: boolean;
  can_manage_executions: boolean;
  can_view_reports: boolean;
  can_use_ai: boolean;
  can_access_model_control: boolean;
  can_configure_ai_models: boolean;
  can_test_ai_connections: boolean;
  can_manage_ai_templates: boolean;
  can_select_ai_models: boolean;
  // Permissões do sistema To-Do
  can_access_todo: boolean;
  can_manage_todo_folders: boolean;
  can_manage_todo_tasks: boolean;
  can_manage_all_todos: boolean;
  can_upload_attachments: boolean;
  can_comment_tasks: boolean;
  can_assign_tasks: boolean;
  role?: UserRole;
}

const DEFAULT_PERMISSIONS: UserPermissions = {
  can_manage_users: false,
  can_manage_plans: false,
  can_manage_cases: false,
  can_manage_executions: false,
  can_view_reports: false,
  can_use_ai: false,
  can_access_model_control: false,
  can_configure_ai_models: false,
  can_test_ai_connections: false,
  can_manage_ai_templates: false,
  can_select_ai_models: false,
  can_access_todo: false,
  can_manage_todo_folders: false,
  can_manage_todo_tasks: false,
  can_manage_all_todos: false,
  can_upload_attachments: false,
  can_comment_tasks: false,
  can_assign_tasks: false,
};

const getDefaultPermissions = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'master':
      return {
        can_manage_users: true,
        can_manage_plans: true,
        can_manage_cases: true,
        can_manage_executions: true,
        can_view_reports: true,
        can_use_ai: true,
        can_access_model_control: true,
        can_configure_ai_models: true,
        can_test_ai_connections: true,
        can_manage_ai_templates: true,
        can_select_ai_models: true,
        can_access_todo: true,
        can_manage_todo_folders: true,
        can_manage_todo_tasks: true,
        can_manage_all_todos: true,
        can_upload_attachments: true,
        can_comment_tasks: true,
        can_assign_tasks: true,
      };
    case 'admin':
      return {
        can_manage_users: true,
        can_manage_plans: true,
        can_manage_cases: true,
        can_manage_executions: true,
        can_view_reports: true,
        can_use_ai: true,
        can_access_model_control: true,
        can_configure_ai_models: true,
        can_test_ai_connections: true,
        can_manage_ai_templates: true,
        can_select_ai_models: true,
        can_access_todo: true,
        can_manage_todo_folders: true,
        can_manage_todo_tasks: true,
        can_manage_all_todos: true,
        can_upload_attachments: true,
        can_comment_tasks: true,
        can_assign_tasks: true,
      };
    case 'manager':
      return {
        can_manage_users: false,
        can_manage_plans: true,
        can_manage_cases: true,
        can_manage_executions: true,
        can_view_reports: true,
        can_use_ai: true,
        can_access_model_control: false,
        can_configure_ai_models: false,
        can_test_ai_connections: false,
        can_manage_ai_templates: true,
        can_select_ai_models: true,
        can_access_todo: true,
        can_manage_todo_folders: true,
        can_manage_todo_tasks: true,
        can_manage_all_todos: false,
        can_upload_attachments: true,
        can_comment_tasks: true,
        can_assign_tasks: true,
      };
    case 'tester':
      return {
        can_manage_users: false,
        can_manage_plans: false,
        can_manage_cases: false,
        can_manage_executions: true,
        can_view_reports: false,
        can_use_ai: true,
        can_access_model_control: false,
        can_configure_ai_models: false,
        can_test_ai_connections: false,
        can_manage_ai_templates: false,
        can_select_ai_models: true,
        can_access_todo: true,
        can_manage_todo_folders: true,
        can_manage_todo_tasks: true,
        can_manage_all_todos: false,
        can_upload_attachments: true,
        can_comment_tasks: true,
        can_assign_tasks: false,
      };
    case 'viewer':
      return {
        can_manage_users: false,
        can_manage_plans: false,
        can_manage_cases: false,
        can_manage_executions: false,
        can_view_reports: false,
        can_use_ai: false,
        can_access_model_control: false,
        can_configure_ai_models: false,
        can_test_ai_connections: false,
        can_manage_ai_templates: false,
        can_select_ai_models: false,
        can_access_todo: false,
        can_manage_todo_folders: false,
        can_manage_todo_tasks: false,
        can_manage_all_todos: false,
        can_upload_attachments: false,
        can_comment_tasks: false,
        can_assign_tasks: false,
      };
    default:
      return DEFAULT_PERMISSIONS;
  }
};

interface PermissionsContextType {
  permissions: UserPermissions;
  role: UserRole;
  loading: boolean;
  refreshPermissions: () => Promise<void>;
  hasPermission: (permission: keyof Omit<UserPermissions, 'role'>) => boolean;
  isAdmin: () => boolean;
  isMaster: () => boolean;
  updateUserToMaster: (userId: string) => Promise<void>;
  getDefaultPermissions: (role: UserRole) => UserPermissions;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

interface PermissionsProviderProps {
  children: React.ReactNode;
}

export const PermissionsProvider = ({ children }: PermissionsProviderProps) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>(
    SINGLE_TENANT ? getDefaultPermissions('master') : DEFAULT_PERMISSIONS
  );
  const [role, setRole] = useState<UserRole>(SINGLE_TENANT ? 'master' : 'tester');
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    if (SINGLE_TENANT) return 'master' as UserRole;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.role as UserRole || 'tester';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'tester' as UserRole;
    }
  };

  const fetchUserPermissions = async (userId: string) => {
    if (SINGLE_TENANT) return getDefaultPermissions('master');
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user permissions:', error);
        return DEFAULT_PERMISSIONS;
      }
      
      if (!data) {
        return DEFAULT_PERMISSIONS;
      }
      
      return {
        ...DEFAULT_PERMISSIONS,
        ...data,
        role: undefined
      } as UserPermissions;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return DEFAULT_PERMISSIONS;
    }
  };

  const refreshPermissions = async () => {
    if (!user) {
      setPermissions(SINGLE_TENANT ? getDefaultPermissions('master') : DEFAULT_PERMISSIONS);
      setRole(SINGLE_TENANT ? 'master' : 'tester');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [userRole, userPermissions] = await Promise.all([
        fetchUserRole(user.id),
        fetchUserPermissions(user.id)
      ]);

      setRole(userRole);
      setPermissions({ ...userPermissions, role: userRole });
    } catch (error) {
      console.error('Error refreshing permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserToMaster = async (userId: string) => {
    // In single-tenant mode, don't write to DB; just update local state
    if (SINGLE_TENANT) {
      setRole('master');
      setPermissions({ ...getDefaultPermissions('master'), role: 'master' });
      return;
    }
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'master' })
        .eq('id', userId);

      if (profileError) throw profileError;

      const masterPermissions = getDefaultPermissions('master');
      const { error: permissionsError } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: userId,
          ...masterPermissions
        });

      if (permissionsError) throw permissionsError;

      if (user && user.id === userId) {
        await refreshPermissions();
      }
    } catch (error) {
      console.error('Error updating user to master:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      refreshPermissions();
    } else {
      setPermissions(SINGLE_TENANT ? getDefaultPermissions('master') : DEFAULT_PERMISSIONS);
      setRole(SINGLE_TENANT ? 'master' : 'tester');
      setLoading(false);
    }
  }, [user]);

  const hasPermission = (permission: keyof Omit<UserPermissions, 'role'>) => {
    const adminPermissions = [
      'can_manage_users',
      'can_manage_plans', 
      'can_manage_cases',
      'can_manage_executions',
      'can_view_reports'
    ];
    
    if (adminPermissions.includes(permission)) {
      if (role === 'master' || role === 'admin') {
        return true;
      }
    }
    
    return permissions[permission] === true;
  };

  const isAdmin = () => {
    return role === 'admin' || role === 'master';
  };

  const isMaster = () => {
    return role === 'master';
  };

  return (
    <PermissionsContext.Provider 
      value={{ 
        permissions, 
        role, 
        loading, 
        refreshPermissions, 
        hasPermission,
        isAdmin,
        isMaster,
        updateUserToMaster,
        getDefaultPermissions
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}; 