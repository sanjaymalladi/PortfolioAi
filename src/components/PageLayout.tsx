
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const PageLayout = ({ 
  title, 
  description, 
  children,
  actions
}: PageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 dark:from-background dark:to-background/80 pb-8">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60 sticky top-0 z-10">
        <div className="container flex h-14 max-w-screen-2xl items-center px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mr-6 flex items-center"
          >
            ← Back to Home
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <div className="container max-w-screen-xl px-4 pt-6 md:pt-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="mt-2 text-lg text-muted-foreground">{description}</p>
          )}
          {actions && (
            <div className="mt-4 flex flex-wrap gap-3">
              {actions}
            </div>
          )}
        </div>
        
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
