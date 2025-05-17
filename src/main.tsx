import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import { useTheme } from "next-themes";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  throw new Error("Missing Publishable Key")
}

const AppWithClerk = () => {
    const { theme } = useTheme();
    const [clerkTheme, setClerkTheme] = useState("light");
  
    useEffect(() => {
      setClerkTheme(theme === "dark" ? "dark" : "light");
    }, [theme]);
  
    return (
      <ClerkProvider
        publishableKey={publishableKey}
        appearance={{
          baseTheme: clerkTheme,
        }}
      >
        <App />
      </ClerkProvider>
    );
  };
  
  createRoot(document.getElementById("root")!).render(<AppWithClerk />);