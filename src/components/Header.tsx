import { useState } from 'react';
import { Moon, Sun, Settings, User, LogOut, Shield } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SettingsModal } from '@/components/SettingsModal';

export const Header = () => {
  const { mode, toggleMode } = useTheme();
  const { user, logout } = useAuth();
  const { role } = usePermissions();
  const [showSettings, setShowSettings] = useState(false);

  // Role display names and colors
  const roleInfo = {
    master: { name: 'Master', color: 'text-purple-500' },
    admin: { name: 'Administrador', color: 'text-red-500' },
    manager: { name: 'Gerente', color: 'text-blue-500' },
    tester: { name: 'Testador', color: 'text-green-500' }
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white hidden md:block">
              TestMaster AI
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 hidden lg:block">
              Geração inteligente de testes
            </p>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMode}
              className="relative"
            >
              {mode === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-5 w-5" />
                  {role && (
                    <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${roleInfo[role]?.color || 'bg-gray-500'}`}></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="truncate">{user?.email}</div>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <Shield className={`h-3 w-3 mr-1 ${roleInfo[role]?.color || ''}`} />
                    {roleInfo[role]?.name || 'Usuário'}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
};
