import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileEdit, Upload, ArrowRight, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { askGemini } from '../services/geminiService';
import pdfParse from 'pdf-parse-new';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const PortfolioBuilder = () => {
  const [step, setStep] = useState<'upload'|'qna'|'preview'>('upload');
  const [resumeText, setResumeText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [about, setAbout] = useState('');
  const [skills, setSkills] = useState('');
  const [projects, setProjects] = useState('');
  const [parsing, setParsing] = useState(false);
  const [siteHtml, setSiteHtml] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [inputMode, setInputMode] = useState<'resume'|'qna'|null>(null);

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
                description: "Successfully parsed your resume. Generating portfolio...",
              });
              setInputMode('resume');
              setStep('preview');
              await generatePortfolio({ resume: text });
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

  const generatePortfolio = async ({ resume }: { resume?: string } = {}) => {
    setIsGenerating(true);
    try {
      let prompt = '';
      if (inputMode === 'resume' && resume) {
        prompt = `Generate a modern, responsive HTML portfolio site for the following candidate. Return ONLY a complete, valid HTML file. Do NOT include explanations, markdown, or comments. Only output the HTML.\n\nResume: ${resume}`;
      } else {
        prompt = `Generate a modern, responsive HTML portfolio site for the following candidate. Return ONLY a complete, valid HTML file. Do NOT include explanations, markdown, or comments. Only output the HTML.\n\nJob Title: ${jobTitle}\nAbout: ${about}\nSkills: ${skills}\nProjects: ${projects}`;
      }
      let html = await askGemini(prompt);
      html = cleanHtml(html);
      setSiteHtml(html);
      setStep('preview');
      toast({
        title: "Portfolio Generated",
        description: "Your portfolio has been created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate portfolio. Please try again.",
        variant: "destructive"
      });
    }
    setIsGenerating(false);
  };

  const handleQnASubmit = async () => {
    if (!jobTitle || !about || !skills || !projects) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before generating your portfolio.",
        variant: "destructive"
      });
      return;
    }
    setInputMode('qna');
    await generatePortfolio();
  };

  const handleRetry = async () => {
    if (inputMode === 'resume') {
      await generatePortfolio({ resume: resumeText });
    } else {
      await generatePortfolio();
    }
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
    preview.document.write(siteHtml);
    preview.document.close();
  };

  const handleDeployClick = () => setShowDeployModal(true);
  const handleCloseModal = () => setShowDeployModal(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <header className="max-w-4xl mx-auto mb-6">
        <Button 
          onClick={() => navigate('/')}
          className="mb-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          ← Back to Home
        </Button>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">AI Portfolio Builder</h1>
        <p className="text-gray-600 dark:text-gray-400">Create a professional portfolio site in minutes</p>
      </header>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Build Your Portfolio</CardTitle>
            <CardDescription>
              {step === 'upload' && "Start by uploading your resume or answering a few questions"}
              {step === 'qna' && "Tell us more about yourself and your work"}
              {step === 'preview' && "Preview and customize your portfolio"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'upload' && inputMode === null && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <Button className="flex-1 border border-gray-300 dark:border-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-semibold py-4" onClick={() => setInputMode('resume')}>
                    Upload Resume
                  </Button>
                  <Button className="flex-1 border border-gray-300 dark:border-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-semibold py-4" onClick={() => setInputMode('qna')}>
                    Answer Q&A
                  </Button>
                </div>
              </div>
            )}

            {step === 'upload' && inputMode === 'resume' && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                  <Input 
                    id="resume-upload" 
                    type="file" 
                    className="hidden" 
                    onChange={handleResumeFileUpload}
                    accept=".pdf"
                  />
                  <Label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Upload your resume (PDF)</span>
                  </Label>
                </div>
                <Button onClick={() => setStep('upload')} className="w-full border border-gray-300 dark:border-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100">Back</Button>
              </div>
            )}

            {step === 'upload' && inputMode === 'qna' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input
                      id="job-title"
                      placeholder="e.g., Frontend Developer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma separated)</Label>
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

                <div className="flex justify-between">
                  <Button onClick={() => { setInputMode(null); setStep('upload'); }} className="border border-gray-300 dark:border-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100">Back</Button>
                  <Button onClick={handleQnASubmit} className="bg-interview-blue hover:bg-interview-blue/90 text-white font-semibold" disabled={isGenerating || !jobTitle || !about || !skills || !projects}>
                    {isGenerating ? 'Generating...' : 'Generate Portfolio'}
                  </Button>
                </div>
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-6">
                <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                  <div dangerouslySetInnerHTML={{ __html: siteHtml }} />
                </div>
                <div className="flex flex-wrap gap-2 justify-between items-center">
                  <Button onClick={() => { setInputMode(null); setStep('upload'); }} className="border border-gray-300 dark:border-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <div className="flex gap-2 flex-wrap">
                    <Button className="flex items-center border border-gray-300 dark:border-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100" onClick={exportHtml} disabled={!siteHtml}>
                      <Download className="mr-2 h-4 w-4" />
                      Export HTML
                    </Button>
                    <Button className="flex items-center border border-gray-300 dark:border-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100" onClick={livePreview} disabled={!siteHtml}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Live Preview
                    </Button>
                    <Button className="bg-interview-green hover:bg-interview-green/90 flex items-center text-white" onClick={handleDeployClick} disabled={!siteHtml}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Deploy Site
                    </Button>
                    <Button className="bg-interview-blue hover:bg-interview-blue/90 flex items-center text-white" onClick={handleRetry} disabled={isGenerating}>
                      &#x21bb; Retry
                    </Button>
                  </div>
                </div>
                <Dialog open={showDeployModal} onOpenChange={setShowDeployModal}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Manual Deployment Instructions</DialogTitle>
                      <DialogDescription>
                        <ol className="list-decimal pl-5 space-y-2 mt-2">
                          <li>
                            <b>Export your portfolio:</b> Click <span className="font-semibold">Export HTML</span> to download <code>portfolio.html</code>.
                          </li>
                          <li>
                            <b>Deploy to Netlify:</b> Go to <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Netlify Drop</a> and drag & drop your <code>portfolio.html</code> file.
                          </li>
                          <li>
                            <b>Or deploy to Vercel:</b> Go to <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Vercel Import</a> and follow the instructions to deploy your site.
                          </li>
                          <li>
                            <b>Or use GitHub Pages:</b> Create a new repository, upload <code>portfolio.html</code>, and enable GitHub Pages in the repo settings.
                          </li>
                        </ol>
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button onClick={handleCloseModal} className="w-full text-gray-800 dark:text-gray-100">Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioBuilder; 