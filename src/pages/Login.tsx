import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import KrigzisLogo from '@/components/branding/KrigzisLogo';

export default function Login() {
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError('E-mail ou senha inválidos.');
      } else {
        navigate('/');
      }
    } catch {
      setError('Erro ao tentar entrar.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setResetMessage('');
    setError('');
    if (!email) {
      setError('Informe seu e-mail para enviar o link de recuperação.');
      return;
    }
    try {
      setResetLoading(true);
      const { error } = await resetPassword(email);
      if (error) {
        setError('Não foi possível enviar o e-mail de recuperação. Tente novamente.');
      } else {
        setResetMessage('Enviamos um link de recuperação para o seu e-mail. Verifique sua caixa de entrada.');
      }
    } catch {
      setError('Ocorreu um erro ao solicitar a recuperação de senha.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8 bg-card shadow-lg">
        <CardHeader className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <KrigzisLogo size={28} className="h-7 w-7" />
            <h1 className="text-2xl font-bold text-primary">Krigzis web</h1>
          </div>
          <CardTitle className="text-lg font-semibold mb-1">Entrar na conta</CardTitle>
          <span className="text-sm text-muted-foreground">Bem-vindo de volta!</span>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <div className="text-destructive text-sm text-center">{error}</div>}
            {resetMessage && <div className="text-green-600 text-sm text-center">{resetMessage}</div>}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-2 text-right">
            <button
              type="button"
              className="text-sm text-primary underline disabled:opacity-50"
              onClick={handleResetPassword}
              disabled={resetLoading}
            >
              {resetLoading ? 'Enviando...' : 'Esqueci minha senha'}
            </button>
          </div>
          <div className="mt-4 text-center">
            <span className="text-sm text-muted-foreground">Não tem uma conta?</span>
            <a href="/register" className="ml-1 text-primary underline">Cadastre-se aqui</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}