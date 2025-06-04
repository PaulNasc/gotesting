import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions, UserRole } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { UserCog, Shield, Users, Loader2, Search, UserPlus, Trash2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, ChevronUp, Sparkles, FileText, ClipboardCheck, Play } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserData extends User {
  profile?: {
    display_name: string | null;
    role: UserRole;
  };
  permissions?: {
    can_manage_users: boolean;
    can_manage_plans: boolean;
    can_manage_cases: boolean;
    can_manage_executions: boolean;
    can_view_reports: boolean;
    can_use_ai: boolean;
  };
}

const roleLabels = {
  master: 'Master',
  admin: 'Administrador',
  manager: 'Gerente',
  tester: 'Testador'
};

const roleColors = {
  master: 'bg-purple-100 text-purple-800 border-purple-300',
  admin: 'bg-red-100 text-red-800 border-red-300',
  manager: 'bg-blue-100 text-blue-800 border-blue-300',
  tester: 'bg-green-100 text-green-800 border-green-300'
};

export const UserManagement = () => {
  const { role, isMaster } = usePermissions();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('tester');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  
  // Form state for editing user
  const [editForm, setEditForm] = useState({
    role: 'tester' as UserRole,
    display_name: '',
    can_manage_users: false,
    can_manage_plans: true,
    can_manage_cases: true,
    can_manage_executions: true,
    can_view_reports: true,
    can_use_ai: true,
  });

  // Load users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all users from Supabase Auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      // Fetch profiles and permissions
      const usersWithDetails = await Promise.all(
        authUsers.users.map(async (user) => {
          // Get profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name, role')
            .eq('id', user.id)
            .single();
            
          // Get permissions
          const { data: permissionsData } = await supabase
            .from('user_permissions')
            .select('can_manage_users, can_manage_plans, can_manage_cases, can_manage_executions, can_view_reports, can_use_ai')
            .eq('user_id', user.id)
            .single();
            
          return {
            ...user,
            profile: profileData || { display_name: null, role: 'tester' },
            permissions: permissionsData || {
              can_manage_users: false,
              can_manage_plans: true,
              can_manage_cases: true,
              can_manage_executions: true,
              can_view_reports: true,
              can_use_ai: true,
            }
          };
        })
      );
      
      setUsers(usersWithDetails);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setEditForm({
      role: user.profile?.role || 'tester',
      display_name: user.profile?.display_name || '',
      can_manage_users: user.permissions?.can_manage_users || false,
      can_manage_plans: user.permissions?.can_manage_plans || true,
      can_manage_cases: user.permissions?.can_manage_cases || true,
      can_manage_executions: user.permissions?.can_manage_executions || true,
      can_view_reports: user.permissions?.can_view_reports || true,
      can_use_ai: user.permissions?.can_use_ai || true,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveUserChanges = async () => {
    if (!selectedUser) return;
    
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name,
          role: editForm.role,
        })
        .eq('id', selectedUser.id);
        
      if (profileError) throw profileError;
      
      // Update permissions
      const { error: permissionsError } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: selectedUser.id,
          can_manage_users: editForm.can_manage_users,
          can_manage_plans: editForm.can_manage_plans,
          can_manage_cases: editForm.can_manage_cases,
          can_manage_executions: editForm.can_manage_executions,
          can_view_reports: editForm.can_view_reports,
          can_use_ai: editForm.can_use_ai,
        });
        
      if (permissionsError) throw permissionsError;
      
      // Refresh users
      await fetchUsers();
      
      // Close modal
      setIsEditModalOpen(false);
      setSelectedUser(null);
      
      toast({
        title: 'Usuário atualizado',
        description: 'As alterações foram salvas com sucesso',
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o usuário',
        variant: 'destructive'
      });
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, insira um email válido',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setInviteLoading(true);
      
      // Send invite email
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail);
      
      if (error) throw error;
      
      // Set role for new user
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ role: inviteRole })
          .eq('id', data.user.id);
          
        // Set default permissions
        await supabase
          .from('user_permissions')
          .insert({
            user_id: data.user.id,
            can_manage_users: inviteRole === 'admin' || inviteRole === 'master',
            can_manage_plans: true,
            can_manage_cases: true,
            can_manage_executions: true,
            can_view_reports: true,
            can_use_ai: true,
          });
      }
      
      toast({
        title: 'Convite enviado',
        description: `Um email de convite foi enviado para ${inviteEmail}`,
      });
      
      setInviteEmail('');
      setInviteRole('tester');
      setIsInviteModalOpen(false);
      
      // Refresh users
      await fetchUsers();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o convite',
        variant: 'destructive'
      });
    } finally {
      setInviteLoading(false);
    }
  };

  // Função para alterar o papel/role do usuário
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole as UserRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Atualiza o state local
      setUsers(prev => prev.map(user => {
        if (user.id === userId && user.profile) {
          return {
            ...user,
            profile: {
              ...user.profile,
              role: newRole as UserRole
            }
          };
        }
        return user;
      }));
      
      // Atualiza as permissões padrão de acordo com o papel
      await updateDefaultPermissionsByRole(userId, newRole as UserRole);
      
      toast({
        title: 'Nível atualizado',
        description: `O nível de acesso foi alterado para ${roleLabels[newRole as UserRole]}`,
      });
    } catch (error) {
      console.error('Erro ao alterar o nível de acesso:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o nível de acesso',
        variant: 'destructive'
      });
    }
  };
  
  // Função para alterar permissões individuais
  const handlePermissionChange = async (userId: string, permission: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .update({ [permission]: value })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Atualiza o state local
      setUsers(prev => prev.map(user => {
        if (user.id === userId && user.permissions) {
          return {
            ...user,
            permissions: {
              ...user.permissions,
              [permission]: value
            }
          };
        }
        return user;
      }));
      
      toast({
        title: 'Permissão atualizada',
        description: `A permissão foi ${value ? 'concedida' : 'revogada'} com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao alterar permissão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar a permissão',
        variant: 'destructive'
      });
    }
  };
  
  // Função para atualizar as permissões padrão por papel
  const updateDefaultPermissionsByRole = async (userId: string, userRole: UserRole) => {
    const defaultPermissions = {
      master: {
        can_manage_users: true,
        can_manage_plans: true,
        can_manage_cases: true,
        can_manage_executions: true,
        can_view_reports: true,
        can_use_ai: true
      },
      admin: {
        can_manage_users: true,
        can_manage_plans: true,
        can_manage_cases: true,
        can_manage_executions: true,
        can_view_reports: true,
        can_use_ai: true
      },
      manager: {
        can_manage_users: false,
        can_manage_plans: true,
        can_manage_cases: true,
        can_manage_executions: true,
        can_view_reports: true,
        can_use_ai: true
      },
      tester: {
        can_manage_users: false,
        can_manage_plans: false,
        can_manage_cases: true,
        can_manage_executions: true,
        can_view_reports: false,
        can_use_ai: false
      }
    };
    
    try {
      const { error } = await supabase
        .from('user_permissions')
        .update(defaultPermissions[userRole])
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Atualiza o state local
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            permissions: {
              ...user.permissions,
              ...defaultPermissions[userRole]
            }
          };
        }
        return user;
      }));
    } catch (error) {
      console.error('Erro ao atualizar permissões padrão:', error);
    }
  };

  // Expande/colapsa detalhes do usuário
  const toggleUserExpand = (userId: string) => {
    setExpandedUser(prev => prev === userId ? null : userId);
  };

  // Verifica se o usuário atual pode alterar permissões do usuário especificado
  const canManageUser = (userRole: string) => {
    if (role === 'master') return true;
    if (role === 'admin' && userRole !== 'master') return true;
    return false;
  };

  // Filtra os usuários com base na busca
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Função para iniciar o processo de deleção de usuário
  const handleDeleteUser = (user: UserData) => {
    if (user.profile?.role === 'master') {
      toast({
        title: 'Ação não permitida',
        description: 'Não é possível apagar um usuário Master',
        variant: 'destructive'
      });
      return;
    }
    
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Função para confirmar e executar a deleção do usuário
  const confirmDeleteUser = async () => {
    if (!userToDelete || !isMaster()) return;
    
    try {
      setDeleteLoading(true);
      
      // Primeiro, remover dados das tabelas relacionadas
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userToDelete.id);
        
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);
      
      // Por último, remover o usuário do Auth
      const { error } = await supabase.auth.admin.deleteUser(userToDelete.id);
      
      if (error) throw error;
      
      // Atualizar a lista de usuários
      await fetchUsers();
      
      toast({
        title: 'Usuário removido',
        description: `O usuário ${userToDelete.email} foi removido do sistema`,
      });
      
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o usuário',
        variant: 'destructive'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Se não tem permissão, redireciona
  if (role !== 'master' && role !== 'admin') {
    return (
      <PermissionGuard requiredPermission="can_manage_users">
        <div>Você precisa de permissão para acessar esta página</div>
      </PermissionGuard>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema e suas permissões
          </p>
        </div>
        
        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  placeholder="email@exemplo.com" 
                  value={inviteEmail} 
                  onChange={(e) => setInviteEmail(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Nível de Acesso</Label>
                <Select value={inviteRole} onValueChange={(value: UserRole) => setInviteRole(value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {role === 'master' && (
                      <SelectItem value="admin">Administrador</SelectItem>
                    )}
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="tester">Testador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleInviteUser}
                disabled={inviteLoading}
              >
                {inviteLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Convite'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos os Usuários</TabsTrigger>
          <TabsTrigger value="master">Masters</TabsTrigger>
          <TabsTrigger value="admin">Administradores</TabsTrigger>
          <TabsTrigger value="manager">Gerentes</TabsTrigger>
          <TabsTrigger value="tester">Testadores</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="p-0">
          <UserTable 
            users={filteredUsers} 
            loading={loading} 
            expandedUser={expandedUser}
            canManageUser={canManageUser}
            toggleUserExpand={toggleUserExpand}
            handleRoleChange={handleRoleChange}
            handlePermissionChange={handlePermissionChange}
            handleDeleteUser={handleDeleteUser}
            isMaster={isMaster()}
          />
        </TabsContent>
        
        {['master', 'admin', 'manager', 'tester'].map(roleFilter => (
          <TabsContent key={roleFilter} value={roleFilter} className="p-0">
            <UserTable 
              users={filteredUsers.filter(u => u.profile?.role === roleFilter)} 
              loading={loading} 
              expandedUser={expandedUser}
              canManageUser={canManageUser}
              toggleUserExpand={toggleUserExpand}
              handleRoleChange={handleRoleChange}
              handlePermissionChange={handlePermissionChange}
              handleDeleteUser={handleDeleteUser}
              isMaster={isMaster()}
            />
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Modal de confirmação para deleção de usuário */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção de Usuário</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Você tem certeza que deseja remover o usuário:</p>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <p className="font-medium">{userToDelete?.profile?.display_name || 'Usuário'}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{userToDelete?.email}</p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Nível: {userToDelete?.profile?.role ? roleLabels[userToDelete.profile.role] : 'Não definido'}
                </p>
              </div>
              <p className="text-red-600 dark:text-red-400 font-medium">
                Esta ação é irreversível e removerá permanentemente:
              </p>
              <ul className="text-sm text-red-600 dark:text-red-400 space-y-1 ml-4">
                <li>• O acesso do usuário ao sistema</li>
                <li>• Todas as permissões e configurações</li>
                <li>• Dados do perfil do usuário</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover Usuário
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Componente para exibir a tabela de usuários
const UserTable = ({ 
  users, 
  loading, 
  expandedUser, 
  canManageUser,
  toggleUserExpand, 
  handleRoleChange, 
  handlePermissionChange,
  handleDeleteUser,
  isMaster
}: { 
  users: UserData[], 
  loading: boolean, 
  expandedUser: string | null,
  canManageUser: (role: string) => boolean,
  toggleUserExpand: (id: string) => void, 
  handleRoleChange: (id: string, role: string) => void, 
  handlePermissionChange: (id: string, permission: string, value: boolean) => void,
  handleDeleteUser: (user: UserData) => void,
  isMaster: boolean
}) => {
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando usuários...</div>
        </CardContent>
      </Card>
    );
  }
  
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Nenhum usuário encontrado</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Nível de Acesso</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <React.Fragment key={user.id}>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                        {user.profile?.display_name ? user.profile.display_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{user.profile?.display_name || 'Usuário'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {canManageUser(user.profile?.role || 'tester') ? (
                      <Select 
                        value={user.profile?.role || 'tester'} 
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className={`w-[180px] ${roleColors[user.profile?.role || 'tester']} border`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {user.profile?.role === 'master' && (
                            <SelectItem value="master">Master</SelectItem>
                          )}
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="manager">Gerente</SelectItem>
                          <SelectItem value="tester">Testador</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className={`px-3 py-1 rounded text-sm font-medium inline-block ${roleColors[user.profile?.role || 'tester']}`}>
                        {roleLabels[user.profile?.role || 'tester']}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {user.permissions?.can_manage_users && (
                        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Gerenciar Usuários
                        </div>
                      )}
                      {user.permissions?.can_manage_plans && (
                        <div className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">
                          Planos
                        </div>
                      )}
                      {user.permissions?.can_use_ai && (
                        <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          IA
                        </div>
                      )}
                      {user.permissions?.can_view_reports && (
                        <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                          Relatórios
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleUserExpand(user.id)}
                      >
                        {expandedUser === user.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      
                      {/* Botão de apagar disponível apenas para usuários master */}
                      {isMaster && user.profile?.role !== 'master' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Remover usuário (apenas Master)"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                
                {/* Linha expandida com detalhes */}
                {expandedUser === user.id && (
                  <TableRow>
                    <TableCell colSpan={4} className="bg-gray-50 dark:bg-gray-900/20">
                      <div className="p-4 space-y-6">
                        <h4 className="font-medium flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Permissões do Usuário
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <UserCog className="h-4 w-4 text-blue-500" />
                              <Label>Gerenciar Usuários</Label>
                            </div>
                            <Switch 
                              checked={user.permissions?.can_manage_users}
                              onCheckedChange={(checked) => handlePermissionChange(user.id, 'can_manage_users', checked)}
                              disabled={!canManageUser(user.profile?.role || 'tester')}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-emerald-500" />
                              <Label>Gerenciar Planos</Label>
                            </div>
                            <Switch 
                              checked={user.permissions?.can_manage_plans}
                              onCheckedChange={(checked) => handlePermissionChange(user.id, 'can_manage_plans', checked)}
                              disabled={!canManageUser(user.profile?.role || 'tester')}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ClipboardCheck className="h-4 w-4 text-indigo-500" />
                              <Label>Gerenciar Casos</Label>
                            </div>
                            <Switch 
                              checked={user.permissions?.can_manage_cases}
                              onCheckedChange={(checked) => handlePermissionChange(user.id, 'can_manage_cases', checked)}
                              disabled={!canManageUser(user.profile?.role || 'tester')}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Play className="h-4 w-4 text-orange-500" />
                              <Label>Gerenciar Execuções</Label>
                            </div>
                            <Switch 
                              checked={user.permissions?.can_manage_executions}
                              onCheckedChange={(checked) => handlePermissionChange(user.id, 'can_manage_executions', checked)}
                              disabled={!canManageUser(user.profile?.role || 'tester')}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              <Label>Visualizar Relatórios</Label>
                            </div>
                            <Switch 
                              checked={user.permissions?.can_view_reports}
                              onCheckedChange={(checked) => handlePermissionChange(user.id, 'can_view_reports', checked)}
                              disabled={!canManageUser(user.profile?.role || 'tester')}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-purple-500" />
                              <Label>Utilizar Recursos de IA</Label>
                            </div>
                            <Switch 
                              checked={user.permissions?.can_use_ai}
                              onCheckedChange={(checked) => handlePermissionChange(user.id, 'can_use_ai', checked)}
                              disabled={!canManageUser(user.profile?.role || 'tester')}
                            />
                          </div>
                        </div>
                        
                        {!canManageUser(user.profile?.role || 'tester') && (
                          <div className="text-sm text-muted-foreground mt-4">
                            Você não tem permissão para alterar as configurações deste usuário.
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}; 