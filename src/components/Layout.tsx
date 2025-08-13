import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DatabaseSetup } from '@/pages/DatabaseSetup';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const { user, loading, needsDatabaseSetup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Escutar o evento personalizado para saber quando a barra lateral é expandida/retraída
  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setSidebarExpanded(e.detail.expanded);
    };

    window.addEventListener('sidebarStateChange', handleSidebarChange as EventListener);
    
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarChange as EventListener);
    };
  }, []);

  // Redirecionar para configuração de banco de dados se necessário
  useEffect(() => {
    if (!loading && user && needsDatabaseSetup && location.pathname !== '/database-setup') {
      navigate('/database-setup');
    }
  }, [loading, user, needsDatabaseSetup, location.pathname, navigate]);

  // Se o usuário precisa configurar banco de dados, mostrar apenas a página de configuração
  if (!loading && user && needsDatabaseSetup) {
    return <DatabaseSetup />;
  }

  return (
    <div className="min-h-screen h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
