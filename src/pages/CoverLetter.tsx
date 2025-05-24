import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileEdit, Download, Copy, Check, Upload, FileText, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { askGemini } from '../services/geminiService';
import { generateMarkdownPDF } from '../utils/markdownPdfGenerator';
import pdfParse from 'pdf-parse-new';
import PageLayout from '@/components/PageLayout';
import MarkdownRenderer from '@/components/MarkdownRenderer';

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

  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      toast({
        title: "Resume uploaded",
        description: `File "${file.name}" has been uploaded.`,
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
    if (!coverLetter) {
      toast({
        title: "No Cover Letter",
        description: "Please generate a cover letter first.",
        variant: "destructive"
      });
      return;
    }

    generateMarkdownPDF(coverLetter, {
      title: 'Cover Letter',
      filename: 'cover-letter.pdf',
      subject: `Cover Letter for ${companyName}`
    });

    toast({
      title: "PDF Downloaded",
      description: "Your cover letter has been saved as a PDF.",
    });
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
      const prompt = `Write a ${tone} cover letter in **proper Markdown format** for the position at **${companyName}**. 

# Cover Letter

**[Your Name]**  
**[Your Address]**  
**[Your Email]**  
**[Your Phone]**  
**[Date]**

**Hiring Manager**  
**${companyName}**  
**[Company Address]**

## Dear Hiring Manager,

Write an engaging opening paragraph that mentions the specific position and shows enthusiasm for **${companyName}**.

## Why I'm a Perfect Fit

In this section, highlight relevant experience and skills that match the job requirements. Use **bold text** for key achievements and qualifications:

- **Relevant Experience**: Specific examples from resume
- **Key Skills**: Match skills to job requirements  
- **Achievements**: Quantifiable results and accomplishments

## Why ${companyName}

Show knowledge of the company and explain why you want to work there specifically. Mention **company values**, recent achievements, or projects that excite you.

## Closing

Professional closing paragraph requesting an interview and thanking them for their consideration.

Sincerely,  
**[Your Name]**

---

**Context:**
- Job Description: ${jobDescription}
- Candidate Resume: ${resumeText}
- Tone: ${tone}

Please create a compelling, professional cover letter using proper Markdown formatting. Use **bold text** for emphasis on key points, company name, and achievements. Make it specific to the role and company, incorporating relevant details from the resume when available.`;

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
    // Convert markdown to plain text for copying
    const plainText = coverLetter
      .replace(/^#+ /gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .replace(/^- /gm, '• ') // Convert bullets
      .replace(/^\d+\. /gm, ''); // Remove numbered lists formatting
    
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    toast({
      title: "Copied to Clipboard",
      description: "Your cover letter has been copied as plain text",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageLayout
      title="Cover Letter Generator"
      description="Create a tailored cover letter in seconds based on your resume and the job description"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="overflow-hidden border-border/40">
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Job Details
            </CardTitle>
            <CardDescription>
              Enter information about the position you're applying for
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
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
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The more details you provide, the more tailored your cover letter will be
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <select 
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="professional">Professional</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="confident">Confident</option>
                <option value="conversational">Conversational</option>
              </select>
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <Label htmlFor="resume-upload" className="cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium">Upload Resume (Optional)</span>
                  <span className="text-xs text-muted-foreground">PDF format for better personalization</span>
                </div>
              </Label>
              <Input 
                id="resume-upload" 
                type="file" 
                className="hidden" 
                onChange={handleResumeFileUpload}
                accept=".pdf"
              />
              {resumeFile && (
                <p className="text-xs text-green-600 mt-2">✓ {resumeFile.name}</p>
              )}
            </div>

            <Button 
              onClick={generateCoverLetter} 
              disabled={isGenerating || !jobDescription || !companyName}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <FileEdit className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className={`overflow-hidden border-border/40 ${coverLetter ? '' : 'opacity-80'}`}>
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Cover Letter
            </CardTitle>
            <CardDescription>
              {coverLetter ? 'Edit as needed before sending' : 'Your generated cover letter will appear here'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {coverLetter ? (
              <div className="space-y-4">
                <div className="border rounded-xl overflow-hidden bg-background">
                  <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/20 p-1.5 rounded-full">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium text-lg">Generated Cover Letter</h3>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost"
                        size="sm" 
                        onClick={handleCopy}
                        className="flex items-center gap-1"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="ghost"
                        size="sm" 
                        onClick={downloadCoverLetter}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-6 overflow-auto max-h-[500px]">
                    <MarkdownRenderer content={coverLetter} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileEdit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generate a cover letter using the form on the left...</p>
              </div>
            )}
          </CardContent>
          {coverLetter && (
            <CardFooter className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleCopy} className="flex items-center gap-1">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Text
                  </>
                )}
              </Button>
              <Button onClick={downloadCoverLetter} className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </PageLayout>
  );
};

export default CoverLetter;
