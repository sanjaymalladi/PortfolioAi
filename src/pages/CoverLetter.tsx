import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileEdit, Download, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { askGemini } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import pdfParse from 'pdf-parse-new';

const CoverLetter = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tone, setTone] = useState('professional');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      toast({
        title: "Resume uploaded",
        description: `File \"${file.name}\" has been uploaded.`,
      });
      if (file.type === 'application/pdf') {
        // Parse PDF and extract text using pdf-parse-new
        const reader = new FileReader();
        reader.onload = async function() {
          const typedarray = Buffer.from(this.result as ArrayBuffer);
          const { text } = await pdfParse(typedarray);
          setResumeText(text);
        };
        reader.readAsArrayBuffer(file);
      }
    }
  };

  const downloadCoverLetter = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Cover Letter', 10, 20);
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(coverLetter, 180);
    doc.text(lines, 10, 35);
    doc.save('cover-letter.pdf');
  };

  const generateCoverLetter = async () => {
    if (!jobDescription || !companyName) {
      toast({
        title: "Missing Information",
        description: "Please provide both a job description and company name",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    try {
      const prompt = `Write a ${tone} cover letter for the following job at ${companyName}. Use the job description and resume below.\nJob Description:\n${jobDescription}\nResume:\n${resumeText}`;
      const result = await askGemini(prompt);
      setCoverLetter(result.trim());
      toast({
        title: "Cover Letter Generated",
        description: "Your personalized cover letter is ready",
      });
    } catch (e) {
      setCoverLetter('');
      toast({
        title: "Error",
        description: "Failed to generate cover letter.",
        variant: "destructive"
      });
    }
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    toast({
      title: "Copied to Clipboard",
      description: "Your cover letter has been copied",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="max-w-4xl mx-auto mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          ← Back to Home
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">Cover Letter Generator</h1>
        <p className="text-gray-600">Create a tailored cover letter in seconds based on the job description</p>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>
                Enter information about the position you're applying for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  placeholder="e.g., Acme Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-description">Job Description</Label>
                <Textarea
                  id="job-description"
                  placeholder="Paste the job description here..."
                  rows={10}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  The more details you provide, the more tailored your cover letter will be
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={tone === 'professional' ? "default" : "outline"}
                    className={tone === 'professional' ? "bg-interview-blue" : ""}
                    onClick={() => setTone('professional')}
                  >
                    Professional
                  </Button>
                  <Button
                    type="button"
                    variant={tone === 'friendly' ? "default" : "outline"}
                    className={tone === 'friendly' ? "bg-interview-blue" : ""}
                    onClick={() => setTone('friendly')}
                  >
                    Friendly
                  </Button>
                  <Button
                    type="button"
                    variant={tone === 'confident' ? "default" : "outline"}
                    className={tone === 'confident' ? "bg-interview-blue" : ""}
                    onClick={() => setTone('confident')}
                  >
                    Confident
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume-upload">Resume (optional, PDF or paste text)</Label>
                <Input 
                  id="resume-upload" 
                  type="file" 
                  className="hidden" 
                  onChange={handleResumeFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                />
                <Label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                  <FileEdit className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Click to upload PDF</span>
                </Label>
                <Textarea
                  placeholder="Paste your resume here (optional)"
                  rows={5}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={generateCoverLetter} 
                disabled={isGenerating || !jobDescription || !companyName}
                className="w-full bg-interview-blue"
              >
                <FileEdit className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
              </Button>
            </CardFooter>
          </Card>

          <Card className={coverLetter ? '' : 'opacity-75'}>
            <CardHeader>
              <CardTitle>Your Cover Letter</CardTitle>
              <CardDescription>
                {coverLetter ? 'Edit as needed before sending' : 'Your generated cover letter will appear here'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Generate a cover letter using the form on the left..."
                rows={20}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="font-serif"
                disabled={!coverLetter}
              />
            </CardContent>
            {coverLetter && (
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="flex items-center" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="mr-1 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button className="flex items-center bg-interview-green" onClick={downloadCoverLetter}>
                  <Download className="mr-1 h-4 w-4" />
                  Download as PDF
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoverLetter;
