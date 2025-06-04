import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube, Sparkles, FileText, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao TestMaster AI"
        });
      } else {
        await signUp(email, password);
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar a conta"
        });
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      toast({
        title: "Erro na autenticação",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail("demo@testmaster.ai");
    setPassword("demo123");
  };

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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </Button>
          </form>
          
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin ? 'Não tem uma conta? Criar conta' : 'Já tem uma conta? Fazer login'}
            </Button>
          </div>
          
          <div className="text-center">
            <Button
              variant="outline"
              onClick={handleDemoLogin}
              className="text-sm w-full"
              type="button"
            >
              Usar conta de demonstração
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
