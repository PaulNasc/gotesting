import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [databaseCode, setDatabaseCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const { error } = await signUp(email, password, databaseCode || undefined);
      
      if (error) {
        setError(error.message || 'Erro ao criar conta');
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/'), 1500);
      }
    } catch {
      setError('Erro inesperado ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8 bg-card shadow-lg">
        <CardHeader className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-primary mb-2">QualityCore AI</h1>
          <CardTitle className="text-lg font-semibold mb-1">Criar nova conta</CardTitle>
          <span className="text-sm text-muted-foreground">Junte-se à nossa plataforma</span>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
            <Input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Código de acesso (opcional)"
              value={databaseCode}
              onChange={e => setDatabaseCode(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Se você tem um código de acesso de uma organização, cole-o acima
            </p>
            
            {error && <div className="text-destructive text-sm text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center">Conta criada! Redirecionando...</div>}
            
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <span className="text-sm text-muted-foreground">Já tem uma conta?</span>
            <a href="/login" className="ml-1 text-primary underline">Entre aqui</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 