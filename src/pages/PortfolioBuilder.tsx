import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileEdit, Upload, ArrowRight, ArrowLeft, Download, ExternalLink, Code, Laptop, Layers, Loader2, CheckCircle, Clock, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { askGemini } from '../services/geminiService';
import pdfParse from 'pdf-parse-new';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import PageLayout from '@/components/PageLayout';
import PortfolioTemplates from '@/components/PortfolioTemplates';
import { Progress } from '@/components/ui/progress';

// Generation stages for progress tracking
interface GenerationStage {
  id: string;
  name: string;
  description: string;
  duration: number; // in milliseconds
  icon: React.ReactNode;
}

const generationStages: GenerationStage[] = [
  {
    id: 'analyzing',
    name: 'Analyzing Information',
    description: 'Processing your resume and personal information...',
    duration: 2000,
    icon: <Loader2 className="h-5 w-5 animate-spin" />
  },
  {
    id: 'designing',
    name: 'Designing Layout',
    description: 'Creating the perfect layout for your portfolio...',
    duration: 3000,
    icon: <Laptop className="h-5 w-5" />
  },
  {
    id: 'generating',
    name: 'Generating Content',
    description: 'Crafting personalized content with AI...',
    duration: 4000,
    icon: <Zap className="h-5 w-5" />
  },
  {
    id: 'styling',
    name: 'Applying Style',
    description: 'Adding beautiful styling and animations...',
    duration: 2500,
    icon: <Code className="h-5 w-5" />
  },
  {
    id: 'finalizing',
    name: 'Finalizing Portfolio',
    description: 'Putting the finishing touches...',
    duration: 1500,
    icon: <CheckCircle className="h-5 w-5" />
  }
];

const PortfolioBuilder = () => {
  const [step, setStep] = useState<'upload'|'qna'|'template'|'generating'|'preview'>('upload');
  const [resumeText, setResumeText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [about, setAbout] = useState('');
  const [skills, setSkills] = useState('');
  const [projects, setProjects] = useState('');
  const [parsing, setParsing] = useState(false);
  const [siteHtml, setSiteHtml] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [inputMode, setInputMode] = useState<'resume'|'qna'|null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('minimalist');
  
  // Progress tracking states
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());

  // Progress tracking effect
  useEffect(() => {
    if (step === 'generating' && isGenerating) {
      runGenerationStages();
    }
  }, [step, isGenerating]);

  // Function to run through generation stages with progress
  const runGenerationStages = async () => {
    setCurrentStageIndex(0);
    setProgress(0);
    setCompletedStages(new Set());

    for (let i = 0; i < generationStages.length; i++) {
      setCurrentStageIndex(i);
      const stage = generationStages[i];
      
      // Animate progress during this stage
      const progressIncrement = 100 / generationStages.length;
      const startProgress = i * progressIncrement;
      const endProgress = (i + 1) * progressIncrement;
      
      await animateProgress(startProgress, endProgress, stage.duration);
      
      // Mark stage as completed
      setCompletedStages(prev => new Set([...prev, stage.id]));
      
      // If this is the content generation stage, actually generate the portfolio
      if (stage.id === 'generating') {
        await generatePortfolioContent();
      }
    }
    
    // Complete and move to preview
    setProgress(100);
    setTimeout(() => {
      setStep('preview');
      setIsGenerating(false);
    }, 500);
  };

  // Function to animate progress smoothly
  const animateProgress = (start: number, end: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const progressDifference = end - start;
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        const currentProgress = start + (progressDifference * progressRatio);
        
        setProgress(currentProgress);
        
        if (progressRatio < 1) {
          requestAnimationFrame(updateProgress);
        } else {
          resolve();
        }
      };
      
      updateProgress();
    });
  };

  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setParsing(true);
      try {
        if (file.type === 'application/pdf') {
          const reader = new FileReader();
          reader.onload = async function() {
            try {
              const buffer = Buffer.from(this.result as ArrayBuffer);
              const { text } = await pdfParse(buffer);
              setResumeText(text);
              toast({
                title: "Resume uploaded",
                description: "Successfully parsed your resume.",
              });
              setInputMode('resume');
              setStep('template');
            } catch (error) {
              toast({
                title: "Error parsing PDF",
                description: "Please try uploading again.",
                variant: "destructive"
              });
            }
            setParsing(false);
          };
          reader.readAsArrayBuffer(file);
        } else {
          toast({
            title: "Unsupported file type",
            description: "Please upload a PDF file.",
            variant: "destructive"
          });
          setParsing(false);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process the file. Please try again.",
          variant: "destructive"
        });
        setParsing(false);
      }
    }
  };

  const generatePortfolio = async () => {
    setIsGenerating(true);
    setStep('generating');
  };

  const generatePortfolioContent = async () => {
    try {
      let prompt = '';
      if (inputMode === 'resume') {
        prompt = `Generate a modern, responsive HTML portfolio site using the ${selectedTemplate} template style for the following candidate. 

Template Style Guidelines:
- ${selectedTemplate === 'minimalist' ? 'Clean, simple design with plenty of white space, elegant typography, and subtle animations' : ''}
- ${selectedTemplate === 'creative' ? 'Vibrant colors, creative layouts, bold typography, and engaging visual elements' : ''}
- ${selectedTemplate === 'professional' ? 'Corporate-friendly design, structured sections, professional color scheme, and formal layout' : ''}
- ${selectedTemplate === 'modern' ? 'Contemporary design with gradient backgrounds, smooth animations, and trendy UI elements' : ''}

Return ONLY a complete, valid HTML file with embedded CSS and JavaScript. Do NOT include explanations, markdown, or comments. Only output the HTML.

Resume: ${resumeText}`;
      } else {
        prompt = `Generate a modern, responsive HTML portfolio site using the ${selectedTemplate} template style for the following candidate.

Template Style Guidelines:
- ${selectedTemplate === 'minimalist' ? 'Clean, simple design with plenty of white space, elegant typography, and subtle animations' : ''}
- ${selectedTemplate === 'creative' ? 'Vibrant colors, creative layouts, bold typography, and engaging visual elements' : ''}
- ${selectedTemplate === 'professional' ? 'Corporate-friendly design, structured sections, professional color scheme, and formal layout' : ''}
- ${selectedTemplate === 'modern' ? 'Contemporary design with gradient backgrounds, smooth animations, and trendy UI elements' : ''}

Return ONLY a complete, valid HTML file with embedded CSS and JavaScript. Do NOT include explanations, markdown, or comments. Only output the HTML.

Job Title: ${jobTitle}
About: ${about}
Skills: ${skills}
Projects: ${projects}`;
      }
      
      let html = await askGemini(prompt);
      html = cleanHtml(html);
      setSiteHtml(html);
      
      toast({
        title: "Portfolio Generated Successfully!",
        description: "Your professional portfolio has been created.",
      });
    } catch (error) {
      toast({
        title: "Generation Error",
        description: "Failed to generate portfolio. Please try again.",
        variant: "destructive"
      });
      setStep('template');
      setIsGenerating(false);
    }
  };

  const handleQnASubmit = () => {
    if (!jobTitle || !about || !skills || !projects) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before generating your portfolio.",
        variant: "destructive"
      });
      return;
    }
    setInputMode('qna');
    setStep('template');
  };

  const handleRetry = async () => {
    setCurrentStageIndex(0);
    setProgress(0);
    setCompletedStages(new Set());
    setIsGenerating(true);
    setStep('generating');
  };

  const handleTemplateNext = () => {
    generatePortfolio();
  };

  const cleanHtml = (raw: string) => {
    // Remove markdown code fences and explanations
    return raw
      .replace(/```html[\r\n]?/gi, '')
      .replace(/```[\r\n]?/g, '')
      .replace(/^[\s\S]*?<html/i, '<html') // Remove anything before <html
      .trim();
  };

  const exportHtml = () => {
    const blob = new Blob([siteHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const livePreview = () => {
    const preview = window.open('', '_blank');
    preview?.document.write(siteHtml);
    preview?.document.close();
  };

  const handleDeployClick = () => setShowDeployModal(true);
  const handleCloseModal = () => setShowDeployModal(false);

  return (
    <PageLayout
      title="AI Portfolio Builder"
      description="Create a professional portfolio website in minutes"
    >
      <Card className="overflow-hidden border-border/40">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <Laptop className="h-5 w-5" />
            {step === 'upload' && "Start Building"}
            {step === 'qna' && "Your Information"}
            {step === 'template' && "Choose Template"}
            {step === 'generating' && "Generating Portfolio"}
            {step === 'preview' && "Portfolio Preview"}
          </CardTitle>
          <CardDescription>
            {step === 'upload' && "Start by uploading your resume or answering a few questions"}
            {step === 'qna' && "Tell us more about yourself and your work"}
            {step === 'template' && "Select a template for your portfolio website"}
            {step === 'generating' && "Your portfolio is being created with AI assistance"}
            {step === 'preview' && "Preview and customize your portfolio"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {step === 'upload' && inputMode === null && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Card className="flex-1 hover:border-primary/50 transition-colors duration-200 cursor-pointer overflow-hidden" onClick={() => setInputMode('resume')}>
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-center text-lg">Upload Resume</CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    We'll generate your portfolio based on your resume
                  </p>
                </CardContent>
              </Card>

              <Card className="flex-1 hover:border-primary/50 transition-colors duration-200 cursor-pointer overflow-hidden" onClick={() => { setInputMode('qna'); setStep('qna'); }}>
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-center text-lg">Manual Entry</CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <FileEdit className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Manually enter your information to build your portfolio
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'upload' && inputMode === 'resume' && (
            <div>
              <div className="border-2 border-dashed border-border rounded-lg p-10 text-center">
                <Input 
                  id="resume-upload" 
                  type="file" 
                  className="hidden" 
                  onChange={handleResumeFileUpload}
                  accept=".pdf"
                />
                <Label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="p-5 rounded-full bg-muted mb-4">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <span className="text-lg font-medium text-foreground mb-2">Upload your resume</span>
                  <span className="text-sm text-muted-foreground">
                    PDF format, max 5MB
                  </span>
                </Label>
                {parsing && <p className="mt-4 text-sm">Parsing document...</p>}
              </div>
              <div className="mt-4 flex justify-between">
                <Button variant="outline" onClick={() => { setInputMode(null); setStep('upload'); }}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          )}

          {step === 'qna' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="job-title" className="flex items-center gap-1">
                    <Layers className="h-4 w-4" />
                    Job Title
                  </Label>
                  <Input
                    id="job-title"
                    placeholder="e.g., Frontend Developer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills" className="flex items-center gap-1">
                    <Code className="h-4 w-4" />
                    Skills (comma separated)
                  </Label>
                  <Input
                    id="skills"
                    placeholder="e.g., React, Node.js, TypeScript"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About Me</Label>
                <Textarea
                  id="about"
                  placeholder="Write a brief professional summary..."
                  rows={4}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projects">Projects</Label>
                <Textarea
                  id="projects"
                  placeholder="Describe your key projects and achievements..."
                  rows={4}
                  value={projects}
                  onChange={(e) => setProjects(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap justify-between gap-3">
                <Button variant="outline" onClick={() => { setInputMode(null); setStep('upload'); }}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleQnASubmit} 
                  disabled={!jobTitle || !about || !skills || !projects}
                >
                  Next: Choose Template
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 'template' && (
            <div className="space-y-6">
              <PortfolioTemplates
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (inputMode === 'resume') {
                      setInputMode('resume');
                      setStep('upload');
                    } else {
                      setStep('qna');
                    }
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleTemplateNext}>
                  Generate Portfolio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div className="space-y-8">
              {/* Progress Section */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Generating Your Portfolio
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    Please wait while we create your professional portfolio...
                  </p>
                </div>
                
                {/* Overall Progress */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">
                      Overall Progress
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
                
                {/* Current Stage */}
                <div className="space-y-6">
                  <div className="flex items-center justify-center space-x-4 p-6 bg-muted/30 rounded-lg border">
                    <div className="flex-shrink-0">
                      {generationStages[currentStageIndex]?.icon}
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-foreground">
                        {generationStages[currentStageIndex]?.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {generationStages[currentStageIndex]?.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Stages List */}
                  <div className="space-y-3">
                    {generationStages.map((stage, index) => (
                      <div
                        key={stage.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                          index < currentStageIndex
                            ? 'bg-primary/10 border border-primary/20'
                            : index === currentStageIndex
                            ? 'bg-primary/5 border border-primary/10'
                            : 'bg-muted/20'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {completedStages.has(stage.id) ? (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          ) : index === currentStageIndex ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${
                              completedStages.has(stage.id) || index === currentStageIndex
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }`}>
                              {stage.name}
                            </span>
                            {completedStages.has(stage.id) && (
                              <span className="text-xs text-primary font-medium">
                                Complete
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-between items-center pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setStep('template'); 
                    setCurrentStageIndex(0); 
                    setProgress(0); 
                    setCompletedStages(new Set());
                    setIsGenerating(false);
                  }}
                  disabled={isGenerating}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Templates
                </Button>
                <Button 
                  onClick={() => {
                    setCurrentStageIndex(0);
                    setProgress(0);
                    setCompletedStages(new Set());
                    generatePortfolio();
                  }}
                  disabled={isGenerating}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="border rounded-lg overflow-hidden bg-background">
                <div className="h-[500px] overflow-auto">
                  <iframe
                    srcDoc={siteHtml}
                    title="Portfolio Preview"
                    className="w-full h-full border-none"
                    sandbox="allow-scripts"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-between items-center">
                <Button variant="outline" onClick={() => setStep('template')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Change Template
                </Button>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={exportHtml} disabled={!siteHtml} className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    Export HTML
                  </Button>
                  <Button variant="outline" onClick={livePreview} disabled={!siteHtml} className="flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    Full Preview
                  </Button>
                  <Button variant="default" onClick={handleDeployClick} disabled={!siteHtml} className="flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    Deploy Site
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={handleRetry} 
                    disabled={isGenerating}
                    className="flex items-center gap-1"
                  >
                    &#x21bb; Regenerate
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDeployModal} onOpenChange={setShowDeployModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Deployment Instructions</DialogTitle>
            <DialogDescription>
              <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li>
                  <b>Export your portfolio:</b> Click <span className="font-semibold">Export HTML</span> to download <code className="bg-muted px-1.5 py-0.5 rounded text-sm">portfolio.html</code>.
                </li>
                <li>
                  <b>Deploy to Netlify:</b> Go to <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-primary underline">Netlify Drop</a> and drag & drop your <code className="bg-muted px-1.5 py-0.5 rounded text-sm">portfolio.html</code> file.
                </li>
                <li>
                  <b>Or deploy to Vercel:</b> Go to <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-primary underline">Vercel Import</a> and follow the instructions to deploy your site.
                </li>
                <li>
                  <b>Or use GitHub Pages:</b> Create a new repository, upload <code className="bg-muted px-1.5 py-0.5 rounded text-sm">portfolio.html</code>, and enable GitHub Pages in the repo settings.
                </li>
              </ol>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCloseModal}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default PortfolioBuilder;
