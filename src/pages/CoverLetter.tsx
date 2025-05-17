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

const CoverLetter = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tone, setTone] = useState('professional');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      const prompt = `Write a ${tone} cover letter for the following job at ${companyName}. Use the job description below.\nJob Description:\n${jobDescription}`;
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
                <Button className="flex items-center bg-interview-green">
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
