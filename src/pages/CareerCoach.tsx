import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileText, Upload, Download, ArrowLeft, ArrowRight, Loader2, Brain, Sparkles, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { askGemini } from '../services/geminiService';
import pdfParse from 'pdf-parse-new';
import { generateMarkdownPDF } from '../utils/markdownPdfGenerator';
import PageLayout from '@/components/PageLayout';
import MarkdownRenderer from '@/components/MarkdownRenderer';

const CareerCoach = () => {
  const [step, setStep] = useState<'upload'|'analysis'>('upload');
  const [resumeText, setResumeText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setParsing(true);
      try {
        if (file.type === 'application/pdf') {
          const reader = new FileReader();
          reader.onload = async function() {
            const typedarray = Buffer.from(this.result as ArrayBuffer);
            const { text } = await pdfParse(typedarray);
            setResumeText(text);
            toast({
              title: "Resume uploaded",
              description: `PDF has been parsed successfully.`,
            });
          };
          reader.readAsArrayBuffer(file);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse PDF. Please try pasting the text instead.",
          variant: "destructive"
        });
      }
      setParsing(false);
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
      const prompt = `Please analyze this career profile and provide detailed feedback in **proper Markdown format**. Use the following structure:

# Career Analysis Report

## Career Strengths
Identify and highlight key strengths and unique selling points. Use **bold text** for important keywords.

## Areas for Improvement  
Highlight skills or experiences that could be enhanced. Use bullet points and **bold text** for key areas.

## Skill Gaps
Identify missing skills for career advancement:
- Use bullet points for each gap
- **Bold** the specific skills needed
- Provide context for each gap

## Actionable Recommendations
Provide specific, actionable steps:
1. **Step 1**: Detailed recommendation
2. **Step 2**: Detailed recommendation  
3. **Step 3**: Detailed recommendation

## Industry Alignment
Suggest industries or roles that match the profile:
- **Industry 1**: Explanation of fit
- **Industry 2**: Explanation of fit

Resume Content: ${resumeText}

Please format your response in clean Markdown with proper headers (##), bullet points (-), numbered lists (1.), and **bold text** for emphasis. Keep the analysis professional and actionable.`;
      
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
    if (!analysis) {
      toast({
        title: "No Analysis",
        description: "Please generate an analysis first.",
        variant: "destructive"
      });
      return;
    }

    generateMarkdownPDF(analysis, {
      title: 'Career Analysis Report',
      filename: 'career-analysis.pdf',
      subject: 'Professional career guidance and recommendations'
    });
    
    toast({
      title: "PDF Downloaded",
      description: "Your career analysis report has been saved.",
    });
  };

  return (
    <PageLayout
      title="AI Career Coach"
      description="Get personalized career guidance, skill gap analysis and growth recommendations"
    >
      <Card className="overflow-hidden border-border/40">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {step === 'upload' ? "Upload Resume" : "Career Analysis"}
          </CardTitle>
          <CardDescription>
            {step === 'upload' && "Upload your resume or paste your experience for personalized career coaching"}
            {step === 'analysis' && "Review your professional assessment and growth recommendations"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-10 text-center">
                <Input 
                  id="resume-upload" 
                  type="file" 
                  className="hidden" 
                  onChange={handleResumeFileUpload}
                  accept=".pdf"
                  disabled={parsing}
                />
                <Label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="p-5 rounded-full bg-muted mb-4">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <span className="text-lg font-medium text-foreground mb-2">
                    {parsing ? "Parsing PDF..." : "Upload your resume"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    PDF format, max 5MB
                  </span>
                  <span className="text-sm text-muted-foreground mt-3">- or -</span>
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
                  disabled={parsing}
                />
              </div>

              <Button 
                onClick={() => setStep('analysis')}
                disabled={!resumeText || parsing}
                className="w-full"
              >
                Continue to Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 'analysis' && (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-between gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('upload')}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Resume
                </Button>
                <Button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !resumeText}
                  className="flex items-center gap-1"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze Career
                    </>
                  )}
                </Button>
              </div>

              {analysis && (
                <div className="space-y-6">
                  <div className="border rounded-xl overflow-hidden bg-background shadow-lg">
                    <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/20 p-1.5 rounded-full">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-medium text-lg">Career Analysis Report</h3>
                      </div>
                      <Button 
                        variant="ghost"
                        size="sm" 
                        onClick={downloadAnalysis}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="p-6 overflow-auto max-h-[500px]">
                      <MarkdownRenderer content={analysis} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={downloadAnalysis}
                      className="flex items-center gap-2"
                      variant="default"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF Report
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default CareerCoach;
