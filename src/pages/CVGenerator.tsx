import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowRight, ArrowLeft, Download, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { askGemini } from '../services/geminiService';
import { jsPDF } from 'jspdf';

const CVGenerator = () => {
  const [step, setStep] = useState<'qna'|'preview'>('qna');
  const [workHistory, setWorkHistory] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [summary, setSummary] = useState('');
  const [cvText, setCvText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleQnASubmit = async () => {
    if (!workHistory || !education || !skills || !summary) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before generating your CV.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Generate an ATS-friendly CV in plain text format for the following candidate. Include sections for Summary, Work Experience, Education, and Skills. Format it professionally with clear section headers.\n\nSummary: ${summary}\nWork History: ${workHistory}\nEducation: ${education}\nSkills: ${skills}`;
      const cv = await askGemini(prompt);
      setCvText(cv);
      setStep('preview');
      toast({
        title: "CV Generated",
        description: "Your CV has been created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate CV. Please try again.",
        variant: "destructive"
      });
    }
    setIsGenerating(false);
  };

  const downloadCV = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Curriculum Vitae', 10, 20);
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(cvText, 180);
    doc.text(lines, 10, 35);
    doc.save('cv.pdf');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cvText);
    setCopied(true);
    toast({
      title: "Copied to Clipboard",
      description: "Your CV has been copied",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <header className="max-w-4xl mx-auto mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          ← Back to Home
        </Button>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">AI CV Generator</h1>
        <p className="text-gray-600 dark:text-gray-400">Create a professional CV in minutes</p>
      </header>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create Your CV</CardTitle>
            <CardDescription>
              {step === 'qna' && "Fill in your details to generate a professional CV"}
              {step === 'preview' && "Preview and customize your CV"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'qna' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    placeholder="Write a brief professional summary..."
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work-history">Work History</Label>
                  <Textarea
                    id="work-history"
                    placeholder="List your work experience, including company names, positions, and key achievements..."
                    rows={5}
                    value={workHistory}
                    onChange={(e) => setWorkHistory(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Textarea
                    id="education"
                    placeholder="List your educational background, including degrees, institutions, and graduation dates..."
                    rows={3}
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Input
                    id="skills"
                    placeholder="e.g., Project Management, Data Analysis, Team Leadership"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleQnASubmit}
                  disabled={isGenerating || !workHistory || !education || !skills || !summary}
                  className="w-full bg-interview-blue hover:bg-interview-blue/90"
                >
                  {isGenerating ? 'Generating...' : 'Generate CV'}
                </Button>
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-6">
                <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                  <pre className="whitespace-pre-wrap font-sans">{cvText}</pre>
                </div>
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('qna')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Edit
                  </Button>
                  <div className="space-x-4">
                    <Button variant="outline" className="flex items-center" onClick={handleCopy}>
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button 
                      className="bg-interview-green hover:bg-interview-green/90 flex items-center"
                      onClick={downloadCV}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CVGenerator; 