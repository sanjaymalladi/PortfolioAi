import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Upload, Check, X, Download, RefreshCw, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { askGemini } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import pdfParse from 'pdf-parse-new';
import PageLayout from '@/components/PageLayout';
import MarkdownRenderer from '@/components/MarkdownRenderer';

const Resume = () => {
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{strengths: string[], improvements: string[]} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          const typedarray = new Uint8Array(this.result as ArrayBuffer);
          const buffer = Buffer.from(typedarray);
          const { text } = await pdfParse(buffer);
          setResumeText(text);
        };
        reader.readAsArrayBuffer(file);
      }
    }
  };

  const analyzeResume = async () => {
    setIsAnalyzing(true);
    try {
      let text = resumeText;
      if (!text && resumeFile) {
        // Optionally, add file reading logic here
        setIsAnalyzing(false);
        toast({ title: 'Error', description: 'Please paste your resume text for analysis.' });
        return;
      }
      const prompt = `Analyze the following resume. Give a score out of 100, a list of strengths, and a list of areas for improvement. Respond in JSON with keys: score, strengths, improvements.\nResume:\n${text}`;
      const result = await askGemini(prompt);
      // Try to parse JSON from Gemini's response
      let parsed;
      try {
        parsed = JSON.parse(result);
      } catch {
        // Fallback: try to extract JSON from text
        const match = result.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : null;
      }
      if (parsed && parsed.score && parsed.strengths && parsed.improvements) {
        setScore(parsed.score);
        setFeedback({ strengths: parsed.strengths, improvements: parsed.improvements });
      } else {
        setScore(null);
        setFeedback(null);
        toast({ title: 'Analysis failed', description: 'Could not parse Gemini response.' });
      }
    } catch (e) {
      setScore(null);
      setFeedback(null);
      toast({ title: 'Error', description: 'Failed to analyze resume.' });
    }
    setIsAnalyzing(false);
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Resume Analysis Report', 10, 20);
    doc.setFontSize(12);
    doc.text(`Score: ${score ?? ''}`, 10, 35);
    doc.text('Strengths:', 10, 45);
    feedback?.strengths.forEach((s, i) => doc.text(`- ${s}`, 15, 55 + i * 8));
    doc.text('Areas for Improvement:', 10, 65 + (feedback?.strengths.length ?? 0) * 8);
    feedback?.improvements.forEach((s, i) => doc.text(`- ${s}`, 15, 75 + (feedback?.strengths.length ?? 0) * 8 + i * 8));
    doc.save('resume-analysis.pdf');
  };

  const getAiSuggestions = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `Based on the following resume analysis, provide detailed AI suggestions to improve the resume in **proper Markdown format**. Use the following structure:

# Resume Improvement Suggestions

## Content Enhancement
Provide specific suggestions to improve resume content:
- Use bullet points for each suggestion
- **Bold** the specific areas to focus on
- Include actionable details

## Skills & Keywords Optimization
Suggest skills and keywords to add:
- **Technical Skills**: List missing technical skills
- **Soft Skills**: Highlight important soft skills
- **Industry Keywords**: Include relevant keywords for ATS optimization

## Formatting & Structure Improvements
Recommend formatting and structure changes:
1. **Section Organization**: Specific reorganization suggestions
2. **Content Flow**: How to improve readability
3. **Visual Appeal**: Formatting improvements

## Experience Section Enhancement
Provide specific suggestions for work experience:
- **Action Verbs**: Better action verbs to use
- **Quantifiable Results**: How to add metrics and numbers
- **Achievement Focus**: Converting duties to achievements

## Education & Certifications
Suggest improvements for education section:
- **Relevant Coursework**: What to highlight
- **Certifications**: Missing certifications to consider
- **Projects**: Academic or personal projects to include

## Next Steps
Provide immediate actionable steps:
1. **Priority 1**: Most important change to make first
2. **Priority 2**: Second most important improvement
3. **Priority 3**: Additional enhancements

Resume Analysis Details:
- Score: ${score}/100
- Strengths: ${feedback?.strengths.join(', ')}
- Areas for Improvement: ${feedback?.improvements.join(', ')}

Please format your response in clean Markdown with proper headers (##), bullet points (-), numbered lists (1.), and **bold text** for emphasis. Keep suggestions specific, actionable, and professional.`;
      
      const result = await askGemini(prompt);
      setAiSuggestions(result.trim());
    } catch (e) {
      setAiSuggestions('Failed to get AI suggestions.');
    }
    setIsAnalyzing(false);
  };

  return (
    <PageLayout
      title="Resume Analysis"
      description="Get your resume analyzed by AI for instant feedback and improvement suggestions"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="overflow-hidden border-border/40">
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload Resume
            </CardTitle>
            <CardDescription>
              Upload your resume or paste the text for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/10 transition-colors cursor-pointer">
              <Input 
                id="resume-upload" 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
              />
              <Label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm font-medium text-foreground">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, DOCX, or TXT (max 5MB)
                </span>
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume-text">Or paste your resume text</Label>
              <Textarea 
                id="resume-text" 
                placeholder="Copy and paste your resume content here..."
                className="min-h-[200px]"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full" 
              disabled={(!resumeText && !resumeFile) || isAnalyzing}
              onClick={analyzeResume}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Resume'
              )}
            </Button>
          </CardContent>
        </Card>

        {score !== null && (
          <Card>
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex justify-between items-center">
                <span>Resume Score</span>
                <span className={`text-lg px-3 py-1 rounded-full ${
                  score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                  score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {score}%
                </span>
              </CardTitle>
              <CardDescription>
                Based on industry standards and hiring trends
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-center">
                <div className="relative h-36 w-36">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle 
                      className="text-muted stroke-current" 
                      strokeWidth="10"
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent"
                    ></circle>
                    <circle 
                      className={`stroke-current ${
                        score >= 80 ? 'text-green-500' : 
                        score >= 60 ? 'text-yellow-500' : 
                        'text-red-500'
                      }`}
                      strokeWidth="10"
                      strokeLinecap="round"
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (score / 100) * 251.2}
                      transform="rotate(-90 50 50)"
                    ></circle>
                  </svg>
                  <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${
                        score >= 80 ? 'text-green-500' : 
                        score >= 60 ? 'text-yellow-500' : 
                        'text-red-500'
                      }`}>{score}%</div>
                      <div className="text-sm text-muted-foreground">Overall Score</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="font-medium text-green-600 dark:text-green-400 flex items-center gap-1 mb-2">
                    <Check className="h-4 w-4" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {feedback?.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-2">
                    <X className="h-4 w-4" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {feedback?.improvements.map((improvement, i) => (
                      <li key={i} className="flex items-start text-sm bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                        <X className="h-4 w-4 text-amber-500 mr-2 mt-0.5 shrink-0" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="outline" onClick={downloadReport} className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
                <Button onClick={getAiSuggestions} disabled={isAnalyzing} className="flex items-center gap-1">
                  <Lightbulb className="h-4 w-4" />
                  Get AI Suggestions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {aiSuggestions && (
        <Card className="mt-8 overflow-hidden border-border/40 shadow-lg">
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 p-1.5 rounded-full">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-lg">AI Resume Improvement Suggestions</h3>
            </div>
            <div className="text-sm text-primary/70 bg-primary/10 px-3 py-1 rounded-full">
              Score: {score}%
            </div>
          </div>
          <CardContent className="p-6 overflow-auto max-h-[600px]">
            <MarkdownRenderer content={aiSuggestions} />
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
};

export default Resume;
