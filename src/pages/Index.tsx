import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WelcomeScreen from '../components/WelcomeScreen';
import InterviewChat from '../components/InterviewChat';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  MessageSquare, 
  FileText, 
  Bell, 
  Folder, 
  FileEdit, 
  User, 
  Menu,
  Sparkles,
  CheckCircle,
  Award,
  ArrowRight
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { Badge } from "@/components/ui/badge";

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

  // Prevent theme flicker on page load
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 transition-colors duration-200">
      {/* Modern Glassmorphic Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/10 dark:border-gray-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="bg-gradient-to-br from-interview-blue to-interview-green p-2 rounded-xl shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-interview-blue to-interview-green bg-clip-text text-transparent transition-all">
              PortfolioAI
            </h1>
              <Badge variant="outline" className="ml-1 bg-interview-blue/10 text-interview-blue dark:bg-interview-blue/20 dark:text-interview-blue/90 px-1.5 py-0 text-xs">
              Beta
            </Badge>
          </div>
          
            
            <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {/* Mobile Menu Button */}
            <Button 
                variant="ghost"
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Auth Buttons */}
            <SignedOut>
                <div className="hidden md:flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button 
                    variant="outline" 
                    size="sm" 
                      className="rounded-full border-interview-blue/30 text-interview-blue hover:border-interview-blue"
                  >
                      <User className="h-4 w-4 mr-1" />
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button 
                      variant="default"
                    size="sm" 
                      className="rounded-full bg-interview-blue hover:bg-interview-blue/90"
                  >
                    Get Started
                  </Button>
                </SignUpButton>
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu - Glass Effect */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 shadow-lg animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link to="/resume" className="flex items-center gap-2 px-3 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <FileText className="h-5 w-5" />
                <span>Resume</span>
              </Link>
              <Link to="/portfolio-builder" className="flex items-center gap-2 px-3 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Folder className="h-5 w-5" />
                <span>Portfolio</span>
              </Link>
              <Link to="/cover-letter" className="flex items-center gap-2 px-3 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <FileEdit className="h-5 w-5" />
                <span>Cover Letter</span>
              </Link>
              
              <SignedOut>
                <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <SignInButton mode="modal">
                    <Button 
                      variant="outline" 
                      className="w-1/2 rounded-xl border-interview-blue/30"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button 
                      variant="default"
                      className="w-1/2 rounded-xl bg-interview-blue hover:bg-interview-blue/90"
                    >
                      Get Started
                    </Button>
                  </SignUpButton>
                </div>
              </SignedOut>
            </div>
          </div>
        )}
      </header>
      
      <main className="pt-16">
        {interviewStarted ? (
          <div className="mt-20 max-w-3xl mx-auto px-4">
            <InterviewChat onRestart={handleRestartInterview} />
          </div>
        ) : (
          <>
            {/* Modern Hero Section with Glassmorphism */}
            <div className="relative min-h-[80vh] flex items-center overflow-hidden px-4 py-16 md:py-32">
              <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-interview-blue/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-interview-green/20 rounded-full blur-3xl"></div>
              </div>
              
              <div className="max-w-6xl mx-auto z-10 relative px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                  <div className="flex-1 text-center lg:text-left">
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-interview-blue via-interview-blue/90 to-interview-green bg-clip-text text-transparent">
                      Your Path to Career Success
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                      Prepare for interviews, build your portfolio, and land your dream job with our AI-powered career tools.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    onClick={handleStartInterview}
                        size="lg"
                        className="bg-interview-blue hover:bg-interview-blue/90 rounded-full px-8 py-7 text-lg font-medium group"
                  >
                        <Sparkles className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                    Try AI Interview
                        <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <SignUpButton mode="modal">
                    <Button
                      variant="outline"
                          size="lg"
                          className="rounded-full px-8 py-7 text-lg border-2 border-gray-300 dark:border-gray-700 group"
                    >
                      Create Free Account
                    </Button>
                  </SignUpButton>
                    </div>
                  </div>
                  <div className="flex-1 w-full max-w-md mx-auto">
                    <div className="relative w-full aspect-square">
                      <div className="absolute inset-0 bg-gradient-to-br from-interview-blue/10 to-interview-green/10 rounded-3xl blur-2xl animate-pulse-glow"></div>
                      <div className="relative bg-white/50 dark:bg-black/30 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-gray-800/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-3 w-3 rounded-full bg-red-500"></div>
                          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <div className="ml-auto text-sm text-gray-500">AI Interview</div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-interview-blue rounded-full flex items-center justify-center flex-shrink-0">
                              <MessageSquare className="h-4 w-4 text-white" />
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                Tell me about a challenging project you worked on.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 justify-end">
                            <div className="bg-interview-blue/10 dark:bg-interview-blue/20 text-interview-blue dark:text-interview-blue/90 rounded-lg rounded-tr-none p-3 max-w-[80%]">
                              <p className="text-sm">
                                I led the development of a real-time analytics dashboard that...
                              </p>
                            </div>
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-interview-blue rounded-full flex items-center justify-center flex-shrink-0">
                              <MessageSquare className="h-4 w-4 text-white" />
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                Great explanation! How did you handle the technical challenges?
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 pb-20">
              <Tabs defaultValue="tools" className="w-full mb-16">
                <TabsList className="mx-auto grid w-full max-w-lg grid-cols-3 mb-10 rounded-full p-1 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <TabsTrigger value="tools" className="rounded-full py-3 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-sm">Tools</TabsTrigger>
                  <TabsTrigger value="interview" className="rounded-full py-3 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-sm">AI Interview</TabsTrigger>
                  <TabsTrigger value="about" className="rounded-full py-3 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-sm">About</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tools" className="animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {[{
                        icon: <FileEdit className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
                        title: "AI Cover Letter",
                        description: "Generate personalized, professional cover letters tailored to specific job descriptions and companies.",
                        buttonText: "Generate Cover Letter",
                        path: "/cover-letter",
                        className: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md",
                        variant: "default",
                        requiresAuth: true
                      },
                      {
                        icon: <FileText className="h-6 w-6 text-interview-green dark:text-interview-green/90" />,
                        title: "Resume Analysis",
                        description: "Get instant feedback on your resume with AI-powered scoring and improvement suggestions.",
                        buttonText: "Analyze Resume",
                        path: "/resume",
                        className: "bg-interview-green hover:bg-interview-green/90 text-white shadow-md",
                        variant: "default",
                        requiresAuth: true
                      },
                      {
                        icon: <Bell className="h-6 w-6 text-interview-orange dark:text-interview-orange/90" />,
                        title: "Job Search",
                        description: "Search for jobs and find the perfect fit with personalized recommendations.",
                        buttonText: "Search Jobs",
                        path: "/jobs",
                        className: "bg-interview-orange hover:bg-interview-orange/90 text-white shadow-md",
                        variant: "default",
                        requiresAuth: true
                      },
                      {
                        icon: <Folder className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
                        title: "AI Portfolio Builder",
                        description: "Generate a beautiful, host-ready portfolio site from your resume or by answering a few questions.",
                        buttonText: "Build Portfolio",
                        path: "/portfolio-builder",
                        className: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md",
                        variant: "default",
                        requiresAuth: true
                      },
                      {
                        icon: <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />,
                        title: "AI CV Generator",
                        description: "Answer a few questions and get an ATS-friendly CV in PDF or DOCX format.",
                        buttonText: "Generate CV",
                        path: "/cv-generator",
                        className: "bg-interview-green hover:bg-interview-green/90 text-white shadow-md",
                        variant: "default",
                        requiresAuth: true
                      },
                      {
                        icon: <User className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />,
                        title: "AI Career Coach",
                        description: "Get personalized career coaching and skill gap analysis based on your resume or Q&A responses.",
                        buttonText: "Get Coaching",
                        path: "/career-coach",
                        className: "bg-interview-orange hover:bg-interview-orange/90 text-white shadow-md",
                        variant: "default",
                        requiresAuth: true
                      }
                    ].map((feature, index) => (
                      <div key={index} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Card className="overflow-hidden border-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1">
                          <CardContent className="p-8 flex flex-col h-full">
                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-3 inline-flex items-center justify-center mb-5 shadow-inner">
                              {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                              {feature.title}
                              {feature.requiresAuth && (
                                <SignedOut>
                                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                    Sign in required
                                  </Badge>
                                </SignedOut>
                              )}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">{feature.description}</p>
                            
                            <SignedIn>
                              <Link to={feature.path} className="w-full">
                                <Button 
                                  variant={feature.variant as "default" | "outline"}
                                  className={`w-full rounded-xl ${feature.className}`}
                                >
                                  {feature.buttonText}
                                </Button>
                              </Link>
                            </SignedIn>
                            
                            <SignedOut>
                              <SignInButton mode="modal">
                                <Button 
                                  variant="outline"
                                  className="w-full rounded-xl border-primary/30 text-primary hover:bg-primary/10"
                                >
                                  <User className="h-4 w-4 mr-2" />
                                  Sign in to access
                                </Button>
                              </SignInButton>
                            </SignedOut>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="interview" className="animate-fade-in">
                  <div className="bg-white/50 dark:bg-gray-900/50 rounded-3xl shadow-xl border border-white/30 dark:border-gray-800/30 backdrop-blur-md overflow-hidden">
                    <WelcomeScreen onStart={handleStartInterview} />
                  </div>
                </TabsContent>
                
                <TabsContent value="about" className="animate-fade-in">
                  <Card className="bg-white/50 dark:bg-gray-900/50 border-0 backdrop-blur-md shadow-xl overflow-hidden rounded-3xl">
                    <CardContent className="p-8 md:p-10">
                      <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-interview-blue to-interview-green bg-clip-text text-transparent">About PortfolioAI</h2>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
                          PortfolioAI is designed to help early-career engineers and career-switchers prepare for their job search journey. 
                          Our AI-powered tools simulate real interview experiences, provide resume feedback, and help you showcase your skills effectively.
                        </p>
                        
                        <h3 className="text-2xl font-semibold mb-5 text-gray-800 dark:text-gray-200">Our Features</h3>
                        <ul className="space-y-4 mb-10">
                          <li className="flex items-start bg-white/30 dark:bg-gray-800/30 p-4 rounded-xl">
                            <CheckCircle className="h-5 w-5 text-interview-green mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-400">AI Mock Interviewer with real-time feedback</span>
                          </li>
                          <li className="flex items-start bg-white/30 dark:bg-gray-800/30 p-4 rounded-xl">
                            <CheckCircle className="h-5 w-5 text-interview-green mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-400">Resume analysis and improvement suggestions</span>
                          </li>
                          <li className="flex items-start bg-white/30 dark:bg-gray-800/30 p-4 rounded-xl">
                            <CheckCircle className="h-5 w-5 text-interview-green mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-400">Custom job alerts tailored to your skills</span>
                          </li>
                          <li className="flex items-start bg-white/30 dark:bg-gray-800/30 p-4 rounded-xl">
                            <CheckCircle className="h-5 w-5 text-interview-green mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-400">Portfolio builder to showcase your projects</span>
                          </li>
                          <li className="flex items-start bg-white/30 dark:bg-gray-800/30 p-4 rounded-xl">
                            <CheckCircle className="h-5 w-5 text-interview-green mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-400">AI-powered cover letter generation</span>
                          </li>
                        </ul>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gradient-to-br from-white/70 to-white/30 dark:from-gray-800/70 dark:to-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg">
                            <Award className="h-10 w-10 text-interview-blue mb-4" />
                            <h4 className="text-xl font-semibold mb-3">Our Mission</h4>
                            <p className="text-gray-600 dark:text-gray-400">
                              To empower job seekers with AI tools that help them present their best selves to potential employers.
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-white/70 to-white/30 dark:from-gray-800/70 dark:to-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg">
                            <Sparkles className="h-10 w-10 text-interview-green mb-4" />
                            <h4 className="text-xl font-semibold mb-3">Our Technology</h4>
                            <p className="text-gray-600 dark:text-gray-400">
                              Powered by cutting-edge AI models to provide personalized, effective guidance for your career journey.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-10">
                        <Button 
                          onClick={handleStartInterview} 
                          className="bg-interview-blue hover:bg-interview-blue/90 text-white rounded-xl px-8 py-6 text-lg"
                        >
                          <Sparkles className="mr-2 h-5 w-5" />
                          Try the AI Interviewer Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              {/* CTA Section with Glassmorphism */}
              <div className="mt-16">
                <div className="relative bg-gradient-to-br from-interview-blue/5 to-interview-green/5 rounded-3xl p-10 md:p-16 shadow-xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-interview-blue/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-interview-green/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
                  
                  <div className="relative max-w-2xl mx-auto text-center z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-interview-blue to-interview-green bg-clip-text text-transparent">Ready to Accelerate Your Job Search?</h2>
                    <p className="text-xl mb-10 text-gray-700 dark:text-gray-300">
                      Join thousands of candidates who have improved their job-search materials and interview skills with PortfolioAI.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                      <Button
                        onClick={handleStartInterview}
                        size="lg"
                        className="bg-interview-blue hover:bg-interview-blue/90 rounded-full px-8 text-lg font-medium"
                      >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Try AI Interview
                      </Button>
                      <SignUpButton mode="modal">
                        <Button
                          variant="outline"
                          size="lg"
                          className="rounded-full px-8 text-lg border-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                        >
                          Create Free Account
                        </Button>
                      </SignUpButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      
      <footer className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-8 md:mb-0">
            <div className="bg-gradient-to-br from-interview-blue to-interview-green p-2 rounded-xl shadow-md mr-3">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-interview-blue to-interview-green bg-clip-text text-transparent">
              PortfolioAI
            </span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-8">
            <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-interview-blue dark:hover:text-interview-blue/90 transition-colors">Privacy Policy</Link>
            <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-interview-blue dark:hover:text-interview-blue/90 transition-colors">Terms of Service</Link>
            <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-interview-blue dark:hover:text-interview-blue/90 transition-colors">Contact Us</Link>
            <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-interview-blue dark:hover:text-interview-blue/90 transition-colors">FAQ</Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 md:mt-0">
            © {new Date().getFullYear()} PortfolioAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
