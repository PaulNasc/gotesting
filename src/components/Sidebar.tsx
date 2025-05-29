
import { useState } from 'react';
import { 
  FileText, 
  TestTube, 
  PlayCircle, 
  History, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: FileText, label: 'Planos de Teste', href: '/plans' },
    { icon: TestTube, label: 'Casos de Teste', href: '/cases' },
    { icon: PlayCircle, label: 'Execuções', href: '/executions' },
    { icon: Sparkles, label: 'Gerador IA', href: '/ai-generator' },
    { icon: History, label: 'Histórico', href: '/history' },
  ];

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-start"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
          {!collapsed && <span className="ml-2">Recolher</span>}
        </Button>
      </div>

      <nav className="mt-4">
        {menuItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </a>
        ))}
      </nav>
    </div>
  );
};
