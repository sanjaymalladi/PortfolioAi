import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload, Download, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { askGemini } from '../services/geminiService';
import pdfParse from 'pdf-parse-new';
import { jsPDF } from 'jspdf';

const CareerCoach = () => {
  const [step, setStep] = useState<'upload'|'analysis'>('upload');
  const [resumeText, setResumeText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
                description: "Successfully parsed your resume. Ready for analysis.",
              });
              setStep('analysis');
            } catch (error) {
              toast({
                title: "Error parsing PDF",
                description: "Please try uploading again or paste your resume text manually.",
                variant: "destructive"
              });
            }
            setParsing(false);
          };
          reader.readAsArrayBuffer(file);
        } else {
          toast({
            title: "Unsupported file type",
            description: "Please upload a PDF file or paste your resume text manually.",
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

  const handleAnalyze = async () => {
    if (!resumeText) {
      toast({
        title: "Missing Information",
        description: "Please provide your resume before analysis.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const prompt = `Analyze this career profile and provide detailed feedback in the following sections:
1. Career Strengths: Identify key strengths and unique selling points
2. Areas for Improvement: Highlight skills or experiences that could be enhanced
3. Skill Gaps: Identify missing skills for career advancement
4. Actionable Recommendations: Provide specific steps for career development
5. Industry Alignment: Suggest industries or roles that match the profile

Resume: ${resumeText}`;
      const result = await askGemini(prompt);
      setAnalysis(result);
      toast({
        title: "Analysis Complete",
        description: "Your career analysis is ready!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze resume. Please try again.",
        variant: "destructive"
      });
    }
    setIsAnalyzing(false);
  };

  const downloadAnalysis = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Career Analysis Report', 10, 20);
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(analysis, 180);
    doc.text(lines, 10, 35);
    doc.save('career-analysis.pdf');
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">AI Career Coach</h1>
        <p className="text-gray-600 dark:text-gray-400">Get personalized career guidance and skill gap analysis</p>
      </header>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Career Analysis</CardTitle>
            <CardDescription>
              {step === 'upload' && "Upload your resume or paste your experience for personalized career coaching"}
              {step === 'analysis' && "Review your career analysis and recommendations"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'upload' && (
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
                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">or</span>
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume-text">Paste Resume Text</Label>
                  <Textarea
                    id="resume-text"
                    placeholder="Paste your resume or career experience here..."
                    rows={8}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={() => setStep('analysis')}
                  disabled={!resumeText}
                  className="w-full bg-interview-blue hover:bg-interview-blue/90"
                >
                  Continue to Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 'analysis' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('upload')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Resume
                  </Button>
                  <Button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !resumeText}
                    className="bg-interview-blue hover:bg-interview-blue/90"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Career'
                    )}
                  </Button>
                </div>

                {analysis && (
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                      <pre className="whitespace-pre-wrap font-sans">{analysis}</pre>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        className="bg-interview-green hover:bg-interview-green/90 flex items-center"
                        onClick={downloadAnalysis}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CareerCoach; 