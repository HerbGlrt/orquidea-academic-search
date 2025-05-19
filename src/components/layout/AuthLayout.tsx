
import React from 'react';
import Logo from '../Logo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  footer?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, description, footer }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 flex flex-col items-center">
          <Logo size="md" withText={false} />
          <CardTitle className="text-2xl text-center mt-2">{title}</CardTitle>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        {footer && <CardFooter className="flex justify-center">{footer}</CardFooter>}
      </Card>
    </div>
  );
};

export default AuthLayout;
