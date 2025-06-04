import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'master' | 'admin' | 'manager' | 'tester';

export interface UserPermissions {
  can_manage_users: boolean;
  can_manage_plans: boolean;
  can_manage_cases: boolean;
  can_manage_executions: boolean;
  can_view_reports: boolean;
  can_use_ai: boolean;
  role?: UserRole;
}

const DEFAULT_PERMISSIONS: UserPermissions = {
  can_manage_users: false,
  can_manage_plans: true,
  can_manage_cases: true,
  can_manage_executions: true,
  can_view_reports: true,
  can_use_ai: true,
  role: 'tester'
};

interface PermissionsContextType {
  permissions: UserPermissions;
  role: UserRole;
  loading: boolean;
  refreshPermissions: () => Promise<void>;
  hasPermission: (permission: keyof Omit<UserPermissions, 'role'>) => boolean;
  isAdmin: () => boolean;
  isMaster: () => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

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
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS);
  const [role, setRole] = useState<UserRole>('tester');
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
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
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data as UserPermissions;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return DEFAULT_PERMISSIONS;
    }
  };

  const refreshPermissions = async () => {
    if (!user) {
      setPermissions(DEFAULT_PERMISSIONS);
      setRole('tester');
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

  useEffect(() => {
    if (user) {
      refreshPermissions();
    } else {
      setPermissions(DEFAULT_PERMISSIONS);
      setRole('tester');
      setLoading(false);
    }
  }, [user]);

  const hasPermission = (permission: keyof Omit<UserPermissions, 'role'>) => {
    // Masters and admins have all permissions
    if (role === 'master' || role === 'admin') {
      return true;
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
        isMaster
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}; 