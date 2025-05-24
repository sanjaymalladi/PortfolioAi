
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider } from "@clerk/clerk-react";
import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Using the publishable key from env
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

const rootElement = document.getElementById("root")!;

if (!publishableKey) {
  console.warn("No Clerk publishable key found. Authentication features will not work.");
  createRoot(rootElement).render(<App />);
} else {
  createRoot(rootElement).render(
    <ClerkProvider publishableKey={publishableKey}>
      <App />
    </ClerkProvider>
  );
}
