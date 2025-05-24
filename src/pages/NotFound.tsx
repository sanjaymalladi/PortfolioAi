
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 dark:from-background dark:to-background/80 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="rounded-full bg-muted/50 p-6 w-24 h-24 mx-auto flex items-center justify-center">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tighter">404</h1>
          <p className="text-xl text-muted-foreground">This page does not exist</p>
          <p className="text-sm text-muted-foreground/60">
            The page you're looking for couldn't be found or may have been moved.
          </p>
        </div>
        
        <div className="pt-4">
          <Button 
            onClick={() => navigate("/")} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
