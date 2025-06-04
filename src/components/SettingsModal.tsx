import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDashboardSettings } from '@/hooks/useDashboardSettings';
import { useAISettings } from '@/hooks/useAISettings';
import { usePermissions } from '@/hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  UserCog, 
  Laptop, 
  Sparkles, 
  Shield, 
  TestTube, 
  Settings, 
  Users, 
  Sliders 
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ElementType;
  description?: string;
}

interface ParameterGroup {
  id: string;
  title: string;
  icon: React.ElementType;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { settings: dashboardSettings, updateSettings: updateDashboardSettings } = useDashboardSettings();
  const { settings: aiSettings, updateSettings: updateAISettings } = useAISettings();
  const { role, permissions, hasPermission, isAdmin } = usePermissions();
  const navigate = useNavigate();
  
  // State for open/closed sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    parameters: true,
    userControl: false,
  });

  // State for open/closed parameter groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    ai: false,
    permissions: false,
  });

  const handleSectionToggle = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleGroupToggle = (groupId: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleQuickActionChange = (value: 'plan' | 'case' | 'execution') => {
    updateDashboardSettings({ quickActionType: value });
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'plan': return 'Novo Plano';
      case 'case': return 'Novo Caso';
      case 'execution': return 'Nova Execução';
      default: return type;
    }
  };

  // Settings sections
  const sections: SettingsSection[] = [
    {
      id: 'parameters',
      title: 'Parâmetros',
      icon: Sliders,
      description: 'Configurações gerais do sistema'
    },
    {
      id: 'userControl',
      title: 'Controle de Usuários',
      icon: Users,
      description: 'Gerenciamento de usuários e permissões'
    }
  ];

  // Parameter groups inside the Parameters section
  const parameterGroups: ParameterGroup[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: Laptop
    },
    {
      id: 'ai',
      title: 'Gerador IA',
      icon: Sparkles
    },
    {
      id: 'permissions',
      title: 'Permissões',
      icon: Shield
    }
  ];

  // Role display names
  const roleNames: Record<string, string> = {
    master: 'Master (Acesso Total)',
    admin: 'Administrador',
    manager: 'Gerente',
    tester: 'Testador',
  };

  // Função para navegar para o gerenciamento de usuários
  const navigateToUserManagement = () => {
    onClose();
    navigate('/user-management');
  };

  // Função para navegar para o Model Control
  const navigateToModelControl = () => {
    onClose();
    navigate('/model-control');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {sections.map((section) => (
            <Collapsible 
              key={section.id}
              open={openSections[section.id]} 
              onOpenChange={() => handleSectionToggle(section.id)}
              className="border rounded-lg"
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <section.icon className="h-5 w-5 text-gray-500" />
                    <h3 className="font-medium">{section.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {section.description && (
                      <span className="text-sm text-gray-500 hidden sm:inline-block">
                        {section.description}
                      </span>
                    )}
                    {openSections[section.id] ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="border-t px-4 pb-4 pt-2">
                {/* Parâmetros Section */}
                {section.id === 'parameters' && (
                  <div className="space-y-4">
                    {parameterGroups.map((group) => (
                      <Collapsible 
                        key={group.id}
                        open={openGroups[group.id]} 
                        onOpenChange={() => handleGroupToggle(group.id)}
                        className="border rounded-lg"
                      >
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2">
                              <group.icon className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">{group.title}</span>
                            </div>
                            {openGroups[group.id] ? 
                              <ChevronDown className="h-3 w-3" /> : 
                              <ChevronRight className="h-3 w-3" />
                            }
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="border-t px-4 pb-3 pt-2 ml-2">
                          {/* Dashboard Settings */}
                          {group.id === 'dashboard' && (
              <div className="space-y-2">
                <Label htmlFor="quick-action">Funcionalidade Botão Principal</Label>
                <Select 
                                value={dashboardSettings.quickActionType} 
                  onValueChange={handleQuickActionChange}
                >
                  <SelectTrigger id="quick-action">
                    <SelectValue placeholder="Selecione a ação principal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plan">Novo Plano de Teste</SelectItem>
                    <SelectItem value="case">Novo Caso de Teste</SelectItem>
                    <SelectItem value="execution">Nova Execução de Teste</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Define qual tipo de item será criado pelo botão principal do Dashboard.
                                Atualmente: <strong>{getActionLabel(dashboardSettings.quickActionType)}</strong>
                              </p>
                            </div>
                          )}
                          
                          {/* AI Settings */}
                          {group.id === 'ai' && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="batch-mode" className="text-sm">
                                  Geração em Lote de Planos
                                </Label>
                                <Switch
                                  id="batch-mode"
                                  checked={aiSettings.batchGenerationEnabled}
                                  onCheckedChange={(checked) => updateAISettings({ batchGenerationEnabled: checked })}
                                />
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Habilita a geração de múltiplos planos de teste a partir de um único documento.
                                Útil para projetos com vários módulos ou funcionalidades.
                              </p>
                            </div>
                          )}
                          
                          {/* Permissions Settings */}
                          {group.id === 'permissions' && (
                            <div className="space-y-4">
                              <div className="flex flex-col">
                                <div className="flex items-center mb-2">
                                  <Shield className={`h-5 w-5 mr-2 ${
                                    role === 'master' ? 'text-purple-500' :
                                    role === 'admin' ? 'text-red-500' :
                                    role === 'manager' ? 'text-blue-500' :
                                    'text-green-500'
                                  }`} />
                                  <Label className="text-base font-medium">Seu Nível de Acesso</Label>
                                </div>
                                <div className="ml-7 text-sm">
                                  <p className="font-medium">{roleNames[role] || 'Usuário'}</p>
                                  <p className="text-gray-500 mt-1">
                                    {role === 'master' && 'Acesso total ao sistema e gerenciamento de usuários.'}
                                    {role === 'admin' && 'Acesso administrativo ao sistema e gerenciamento de usuários.'}
                                    {role === 'manager' && 'Acesso para gerenciar projetos e visualizar relatórios.'}
                                    {role === 'tester' && 'Acesso para criar e executar testes conforme permissões.'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="border-t pt-4">
                                <Label className="mb-3 block">Suas Permissões</Label>
                                
                                <div className="space-y-3 ml-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <UserCog className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm">Gerenciar Usuários</span>
                                    </div>
                                    <Switch 
                                      checked={permissions.can_manage_users} 
                                      disabled={true}
                                    />
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <span className="text-sm">Gerenciar Planos de Teste</span>
                                    </div>
                                    <Switch 
                                      checked={permissions.can_manage_plans} 
                                      disabled={true}
                                    />
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <TestTube className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm">Gerenciar Casos de Teste</span>
                                    </div>
                                    <Switch 
                                      checked={permissions.can_manage_cases} 
                                      disabled={true}
                                    />
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="text-sm">Gerenciar Execuções</span>
                                    </div>
                                    <Switch 
                                      checked={permissions.can_manage_executions} 
                                      disabled={true}
                                    />
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                      </svg>
                                      <span className="text-sm">Visualizar Relatórios</span>
                                    </div>
                                    <Switch 
                                      checked={permissions.can_view_reports} 
                                      disabled={true}
                                    />
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm">Utilizar Recursos de IA</span>
                                    </div>
                                    <Switch 
                                      checked={permissions.can_use_ai} 
                                      disabled={true}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}
                
                {/* Controle de Usuários Section */}
                {section.id === 'userControl' && hasPermission('can_manage_users') && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2 flex items-center">
                        <UserCog className="h-5 w-5 mr-2" />
                        Gerenciamento de Usuários
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                        Acesse a página completa de gerenciamento de usuários para:
                      </p>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                        <li className="flex items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></span>
                          Convidar novos usuários para o sistema
                        </li>
                        <li className="flex items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></span>
                          Definir níveis de acesso (Master, Admin, Gerente, Testador)
                        </li>
                        <li className="flex items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></span>
                          Configurar permissões individuais para cada usuário
                        </li>
                      </ul>
                      <div className="mt-4 flex justify-center">
                        <Button onClick={navigateToUserManagement}>
                          <Users className="h-4 w-4 mr-2" />
                          Acessar Gerenciamento de Usuários
                        </Button>
                      </div>
                    </div>
                    
                    {(role === 'admin' || role === 'master') && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg mt-4">
                        <h4 className="font-medium text-orange-900 dark:text-orange-400 mb-2 flex items-center">
                          <Settings className="h-5 w-5 mr-2" />
                          Model Control Panel
                        </h4>
                        <p className="text-sm text-orange-800 dark:text-orange-300 mb-3">
                          Acesse o painel de controle de modelos de IA para:
                        </p>
                        <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-2">
                          <li className="flex items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mr-2"></span>
                            Configurar modelos de IA e suas API keys
                          </li>
                          <li className="flex items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mr-2"></span>
                            Gerenciar templates de prompts personalizados
                          </li>
                          <li className="flex items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mr-2"></span>
                            Monitorar desempenho e configurações avançadas
                          </li>
                        </ul>
                        <div className="mt-4 flex justify-center">
                          <Button onClick={navigateToModelControl} variant="outline">
                            <Settings className="h-4 w-4 mr-2" />
                            Acessar Model Control Panel
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {role === 'master' && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mt-4">
                        <h4 className="font-medium text-purple-900 dark:text-purple-400 mb-2 flex items-center">
                          <Shield className="h-5 w-5 mr-2 text-purple-500" />
                          Funções do Administrador Master
                        </h4>
                        <p className="text-sm text-purple-800 dark:text-purple-300">
                          Como Master, você tem controle total sobre o sistema, incluindo o gerenciamento de outros administradores e a capacidade de alterar todos os parâmetros da aplicação.
                </p>
              </div>
                    )}
                  </div>
                )}
                
                {section.id === 'userControl' && !hasPermission('can_manage_users') && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-400 mb-2 flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Acesso Restrito
                    </h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Você não possui permissão para gerenciar usuários. Contate um administrador para obter acesso a esta funcionalidade.
                    </p>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          ))}

          <div className="flex justify-end">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
