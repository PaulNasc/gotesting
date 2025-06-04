import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

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

  return (
    <div className="min-h-screen h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
