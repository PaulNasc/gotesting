
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube, Sparkles, FileText } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <TestTube className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold">TestMaster AI</CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              Geração inteligente de testes
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span className="text-sm">Geração automática com IA</span>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Planos e casos de teste</span>
              </div>
              <div className="flex items-center gap-3">
                <TestTube className="h-5 w-5 text-green-500" />
                <span className="text-sm">Execução e relatórios</span>
              </div>
            </div>
            
            <Button 
              onClick={signIn} 
              className="w-full"
              size="lg"
            >
              Entrar no Sistema
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              Configure suas credenciais Firebase para começar
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
