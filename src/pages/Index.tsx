import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeScreen from '../components/WelcomeScreen';
import InterviewChat from '../components/InterviewChat';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Home, 
  MessageSquare, 
  FileText, 
  Bell, 
  Folder, 
  FileEdit, 
  User, 
  Menu,
  ChevronRight
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";

const Index = () => {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Used to fix hydration issues with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartInterview = () => {
    setInterviewStarted(true);
  };
  
  const handleRestartInterview = () => {
    setInterviewStarted(false);
  };

  // Function to navigate to different pages
  const navigateTo = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Prevent theme flicker on page load
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('/')}>
              <div className="bg-gradient-to-r from-interview-blue to-interview-green p-1.5 rounded-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-interview-blue dark:text-interview-blue/90">
                PortfolioAI
              </h1>
            </div>
            <span className="ml-2 text-sm bg-interview-blue/10 dark:bg-interview-blue/20 px-2 py-0.5 rounded-full text-interview-blue dark:text-interview-blue/90">AI Mock Interviewer</span>
          </div>
          
          {!interviewStarted && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigateTo('/')}
                  className="nav-link rounded-full px-4"
                >
                  <Home className="w-4 h-4 mr-1" />
                  <span>Home</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigateTo('/resume')}
                  className="nav-link rounded-full px-4"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  <span>Resume</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigateTo('/jobs')}
                  className="nav-link rounded-full px-4"
                >
                  <Bell className="w-4 h-4 mr-1" />
                  <span>Jobs</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigateTo('/portfolio')}
                  className="nav-link rounded-full px-4"
                >
                  <Folder className="w-4 h-4 mr-1" />
                  <span>Portfolio</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigateTo('/cover-letter')}
                  className="nav-link rounded-full px-4"
                >
                  <FileEdit className="w-4 h-4 mr-1" />
                  <span>Cover Letter</span>
                </Button>
              </div>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </>
          )}
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <SignedOut>
              <SignInButton mode="modal">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1.5 border-interview-blue dark:border-interview-blue/70 text-interview-blue dark:text-interview-blue/90 hover:bg-interview-blue hover:text-white dark:hover:bg-interview-blue/90 rounded-full"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1.5 border-interview-blue dark:border-interview-blue/70 text-interview-blue dark:text-interview-blue/90 hover:bg-interview-blue hover:text-white dark:hover:bg-interview-blue/90 rounded-full"
                >
                  <span>Sign Up</span>
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && !interviewStarted && (
          <div className="md:hidden mt-4 py-3 px-2 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg animate-fade-in">
            <nav className="flex flex-col space-y-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateTo('/')}
                className="justify-start"
              >
                <Home className="w-4 h-4 mr-2" />
                <span>Home</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateTo('/resume')}
                className="justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                <span>Resume</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateTo('/jobs')}
                className="justify-start"
              >
                <Bell className="w-4 h-4 mr-2" />
                <span>Jobs</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateTo('/portfolio')}
                className="justify-start"
              >
                <Folder className="w-4 h-4 mr-2" />
                <span>Portfolio</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateTo('/cover-letter')}
                className="justify-start"
              >
                <FileEdit className="w-4 h-4 mr-2" />
                <span>Cover Letter</span>
              </Button>
            </nav>
          </div>
        )}
      </header>
      
      <main className="max-w-7xl mx-auto p-4">
        {interviewStarted ? (
          <InterviewChat onRestart={handleRestartInterview} />
        ) : (
          <>
            {/* Hero Section */}
            <div className="mb-10 mt-8 text-center">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-interview-blue to-interview-green">
                Your Personal Job-Readiness Suite
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Prepare for interviews, improve your resume, and showcase your skills — all in one place.
              </p>
            </div>
            
            <Tabs defaultValue="tools" className="w-full mb-8">
              <TabsList className="mx-auto grid w-full max-w-lg grid-cols-3 mb-8">
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="interview">Interview</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tools" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center mb-4">
                        <div className="rounded-full bg-interview-blue/10 dark:bg-interview-blue/20 p-3 mr-3">
                          <FileEdit className="h-6 w-6 text-interview-blue dark:text-interview-blue/90" />
                        </div>
                        <h2 className="text-lg font-semibold dark:text-white">AI Cover Letter Maker</h2>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">Generate personalized, professional cover letters instantly with our AI-powered tool.</p>
                      <Button 
                        onClick={() => navigateTo('/cover-letter')} 
                        className="w-full bg-interview-blue hover:bg-interview-blue/90 text-white"
                      >
                        Create Cover Letter
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center mb-4">
                        <div className="rounded-full bg-interview-green/10 dark:bg-interview-green/20 p-3 mr-3">
                          <FileText className="h-6 w-6 text-interview-green dark:text-interview-green/90" />
                        </div>
                        <h2 className="text-lg font-semibold dark:text-white">Resume Scoring</h2>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">Upload your resume to get an instant score and actionable recommendations for improvement.</p>
                      <Button 
                        onClick={() => navigateTo('/resume')} 
                        className="w-full bg-interview-green hover:bg-interview-green/90 text-white"
                      >
                        Check Resume
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center mb-4">
                        <div className="rounded-full bg-interview-orange/10 dark:bg-interview-orange/20 p-3 mr-3">
                          <Bell className="h-6 w-6 text-interview-orange dark:text-interview-orange/90" />
                        </div>
                        <h2 className="text-lg font-semibold dark:text-white">Job Alerts</h2>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">Set up custom job alerts and get notified when matching positions are available.</p>
                      <Button 
                        onClick={() => navigateTo('/jobs')} 
                        variant="outline"
                        className="w-full border-interview-orange text-interview-orange hover:bg-interview-orange hover:text-white dark:border-interview-orange/70 dark:text-interview-orange/90 dark:hover:bg-interview-orange/90"
                      >
                        Set Up Alerts
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="interview" className="animate-fade-in">
                <WelcomeScreen onStart={handleStartInterview} />
              </TabsContent>
              
              <TabsContent value="about" className="animate-fade-in">
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold mb-4 text-interview-blue dark:text-interview-blue/90">About PortfolioAI</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                      PortfolioAI is designed to help early-career engineers and career-switchers prepare for their job search journey. 
                      Our AI-powered tools simulate real interview experiences, provide resume feedback, and help you showcase your skills effectively.
                    </p>
                    
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Our Features</h3>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-interview-green mr-2 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">AI Mock Interviewer with real-time feedback</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-interview-green mr-2 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">Resume analysis and improvement suggestions</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-interview-green mr-2 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">Custom job alerts tailored to your skills</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-interview-green mr-2 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">Portfolio builder to showcase your projects</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 text-interview-green mr-2 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">AI-powered cover letter generation</span>
                      </li>
                    </ul>
                    
                    <Button 
                      onClick={handleStartInterview} 
                      className="bg-interview-blue hover:bg-interview-blue/90 text-white"
                    >
                      Try the AI Interviewer Now
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
      
      <footer className="py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} PortfolioAI. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">Privacy</Button>
              <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">Terms</Button>
              <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">Support</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
