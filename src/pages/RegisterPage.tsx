
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';

const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [orcidId, setOrcidId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Validation functions
  const validateOrcidId = (value: string) => {
    const orcidPattern = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    return orcidPattern.test(value);
  };

  const validateEmail = (value: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
  };

  const validatePassword = (value: string) => {
    return value.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOrcidId(orcidId)) {
      toast({
        title: 'ORCID ID Inválido',
        description: 'Por favor, insira um ORCID ID válido no formato 0000-0000-0000-0000.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!validateEmail(email)) {
      toast({
        title: 'Email Inválido',
        description: 'Por favor, insira um endereço de email válido.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!validatePassword(password)) {
      toast({
        title: 'Senha Inválida',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register({
        name: `${firstName} ${lastName}`,
        email,
        orcidId,
        password,
      });
      
      toast({
        title: 'Registro bem-sucedido',
        description: 'Sua conta foi criada com sucesso.',
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: 'Erro no registro',
        description: 'Ocorreu um erro ao criar sua conta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const footerContent = (
    <p className="text-sm text-center text-muted-foreground">
      Já tem uma conta?{' '}
      <Link to="/login" className="text-tea hover:underline">
        Fazer login
      </Link>
    </p>
  );

  return (
    <AuthLayout 
      title="Cadastrar-se no Chá de Orquideira" 
      description="Crie sua conta para acessar todos os recursos"
      footer={footerContent}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nome</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {email && !validateEmail(email) && (
            <p className="text-xs text-destructive">
              Por favor, insira um email válido
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="orcidId">ORCID ID</Label>
          <Input
            id="orcidId"
            placeholder="0000-0000-0000-0000"
            value={orcidId}
            onChange={(e) => setOrcidId(e.target.value)}
            required
          />
          {orcidId && !validateOrcidId(orcidId) && (
            <p className="text-xs text-destructive">
              ORCID ID deve estar no formato 0000-0000-0000-0000
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {password && !validatePassword(password) && (
            <p className="text-xs text-destructive">
              A senha deve ter pelo menos 6 caracteres
            </p>
          )}
        </div>
        
        <Button
          type="submit"
          className="w-full bg-tea hover:bg-tea-dark"
          disabled={isLoading}
        >
          {isLoading ? 'Cadastrando...' : 'Confirmar Registro'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
