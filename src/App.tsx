import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ResumeProvider } from "./context/ResumeContext";
import Index from "./pages/Index";
import Resume from "./pages/Resume";
import Jobs from "./pages/Jobs";
import Portfolio from "./pages/Portfolio";
import CoverLetter from "./pages/CoverLetter";
import PortfolioBuilder from "./pages/PortfolioBuilder";
import CVGenerator from "./pages/CVGenerator";
import CareerCoach from "./pages/CareerCoach";
import LaTeXDemo from "./pages/LaTeXDemo";
import NotFound from "./pages/NotFound";
import InterviewChat from './components/InterviewChat';
import SpeechTestDemo from './components/SpeechTestDemo';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(false);

  const handleRestart = () => {
    setShowWelcome(true);
  };

  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <ResumeProvider>
          <Toaster />
          <Sonner />
            <Router>
            <div className="min-h-screen">
              <main>
                <Routes>
                  <Route path="/" element={<Index />} />
                    
                    {/* Protected Routes - Require Authentication */}
                    <Route 
                      path="/resume" 
                      element={
                        <ProtectedRoute>
                          <Resume />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/jobs" 
                      element={
                        <ProtectedRoute>
                          <Jobs />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/portfolio" 
                      element={
                        <ProtectedRoute>
                          <Portfolio />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/cover-letter" 
                      element={
                        <ProtectedRoute>
                          <CoverLetter />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/portfolio-builder" 
                      element={
                        <ProtectedRoute>
                          <PortfolioBuilder />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/cv-generator" 
                      element={
                        <ProtectedRoute>
                          <CVGenerator />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/career-coach" 
                      element={
                        <ProtectedRoute>
                          <CareerCoach />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/interview-practice" 
                      element={
                        <ProtectedRoute>
                          <InterviewChat onRestart={handleRestart} />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/speech-test" 
                      element={
                        <ProtectedRoute>
                          <SpeechTestDemo />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/latex-demo" 
                      element={
                        <ProtectedRoute>
                          <LaTeXDemo />
                        </ProtectedRoute>
                      } 
                    />
                    
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
            </Router>
        </ResumeProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
};

export default App;
