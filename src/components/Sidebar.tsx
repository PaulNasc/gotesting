import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  TestTube, 
  PlayCircle, 
  History as HistoryIcon,
  BarChart3,
  Sparkles,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  CheckSquare
} from 'lucide-react';
import KrigzisLogo from '@/components/branding/KrigzisLogo';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, requiredPermission: null },
  { name: 'Planos de Teste', href: '/plans', icon: FileText, requiredPermission: 'can_manage_plans' },
  { name: 'Casos de Teste', href: '/cases', icon: TestTube, requiredPermission: 'can_manage_cases' },
  { name: 'Execuções', href: '/executions', icon: PlayCircle, requiredPermission: 'can_manage_executions' },
  { name: 'To-Do List', href: '/todo', icon: CheckSquare, requiredPermission: 'can_access_todo' },
  { name: 'Gerador IA', href: '/ai-generator', icon: Sparkles, requiredPermission: 'can_use_ai' },
  { name: 'Relatórios', href: '/reports', icon: BarChart3, requiredPermission: 'can_view_reports' },
  { name: 'Histórico', href: '/history', icon: HistoryIcon, requiredPermission: null },
];

export const Sidebar = () => {
  const location = useLocation();
  const { hasPermission, role } = usePermissions();
  const [isOpen, setIsOpen] = useState(false); // Mobile sidebar state
  const [isExpanded, setIsExpanded] = useState(true); // Desktop sidebar expansion state

  const toggleSidebar = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Emitir evento para informar o layout que a barra lateral foi expandida/retraída
    const event = new CustomEvent('sidebarStateChange', { 
      detail: { expanded: newExpandedState } 
    });
    window.dispatchEvent(event);
  };

  // Filter navigation items based on permissions
  const filteredNavigation = navigation.filter(item => {
    // If no permission is required, show the item
    if (!item.requiredPermission) {
      return true;
    }
    
    // Check permission requirement
    if (item.requiredPermission) {
      return hasPermission(item.requiredPermission as any);
    }
    
    return true;
  });

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-md dark:bg-gray-800 dark:text-white"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Toggle sidebar button for desktop */}
      <div className="hidden lg:block fixed top-4 left-4 z-50" style={{ left: isExpanded ? '240px' : '64px' }}>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 shadow-md text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-900 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 h-full",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isExpanded ? "lg:w-64" : "lg:w-16"
      )}>
        <div className="flex flex-col h-full">
          <div className={cn(
            "flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700",
            isExpanded ? "justify-center" : "justify-center"
          )}>
            {isExpanded ? (
              <div className="flex items-center gap-2">
                <KrigzisLogo size={24} className="h-6 w-6" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Krigzis web</h1>
              </div>
            ) : (
              <KrigzisLogo size={24} className="h-6 w-6" />
            )}
          </div>
          
          <nav className={cn(
            "flex-1 py-6 space-y-2 overflow-y-auto",
            isExpanded ? "px-4" : "px-2"
          )}>
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center py-2 text-sm font-medium rounded-lg transition-colors",
                    isExpanded ? "px-3 justify-start" : "px-2 justify-center",
                    isActive
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  )}
                  title={!isExpanded ? item.name : undefined}
                >
                  <item.icon className={cn("h-5 w-5", isExpanded ? "mr-3" : "")} />
                  {isExpanded && item.name}
                </Link>
              );
            })}
          </nav>
          
          {isExpanded && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Geração inteligente de testes
            </p>
          </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
