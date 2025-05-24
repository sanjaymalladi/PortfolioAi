import React from 'react';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, Lock, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { isSignedIn, isLoaded, user } = useUser();

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is signed in, show the protected content
  if (isSignedIn) {
    return <>{children}</>;
  }

  // If user is not signed in, show sign-in prompt or custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default sign-in prompt
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-primary/10 p-3 rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Sign In Required</CardTitle>
            <CardDescription className="mt-2">
              You need to sign in to access this feature and start practicing your interview skills.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Personalized Experience</p>
                <p className="text-xs text-muted-foreground">Get tailored interview questions and feedback</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Lock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Save Your Progress</p>
                <p className="text-xs text-muted-foreground">Track your improvement over time</p>
              </div>
            </div>
          </div>
          
          <SignInButton mode="modal">
            <Button className="w-full" size="lg">
              <User className="h-4 w-4 mr-2" />
              Sign In to Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </SignInButton>
          
          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProtectedRoute; 