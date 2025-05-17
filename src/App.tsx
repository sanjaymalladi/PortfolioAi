import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn } from "@clerk/clerk-react";
import Index from "./pages/Index";
import Resume from "./pages/Resume";
import Jobs from "./pages/Jobs";
import Portfolio from "./pages/Portfolio";
import CoverLetter from "./pages/CoverLetter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen">
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/resume" element={
                  <SignedIn>
                    <Resume />
                  </SignedIn>
                } />
                <Route path="/jobs" element={
                  <SignedIn>
                    <Jobs />
                  </SignedIn>
                } />
                <Route path="/portfolio" element={
                  <SignedIn>
                    <Portfolio />
                  </SignedIn>
                } />
                <Route path="/cover-letter" element={
                  <SignedIn>
                    <CoverLetter />
                  </SignedIn>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
