import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Upload, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { askGemini } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import pdfParse from 'pdf-parse-new';

const Resume = () => {
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{strengths: string[], improvements: string[]} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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
          const { text } = await pdfParse(typedarray);
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
      const prompt = `Based on the following resume analysis, provide actionable AI suggestions to improve the resume.\nScore: ${score}\nStrengths: ${feedback?.strengths.join(', ')}\nImprovements: ${feedback?.improvements.join(', ')}`;
      const result = await askGemini(prompt);
      setAiSuggestions(result.trim());
    } catch (e) {
      setAiSuggestions('Failed to get AI suggestions.');
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="max-w-3xl mx-auto mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          ← Back to Home
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">Resume Analysis</h1>
        <p className="text-gray-600">Upload your resume for instant scoring and improvement tips</p>
      </header>

      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>
                Upload your resume as a document or paste the text directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <Input 
                  id="resume-upload" 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                />
                <Label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
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
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-interview-green" 
                disabled={(!resumeText && !resumeFile) || isAnalyzing}
                onClick={analyzeResume}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            </CardFooter>
          </Card>

          {score !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Resume Score</CardTitle>
                <CardDescription>
                  Based on industry standards and hiring trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative h-36 w-36">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <circle 
                        className="text-gray-200 stroke-current" 
                        strokeWidth="10"
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent"
                      ></circle>
                      <circle 
                        className="text-interview-green stroke-current" 
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
                        <div className="text-4xl font-bold text-interview-green">{score}%</div>
                        <div className="text-sm text-gray-500">Overall Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-interview-green mb-2">Strengths</h3>
                    <ul className="space-y-1">
                      {feedback?.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <Check className="h-4 w-4 text-interview-green mr-2 mt-0.5 shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-interview-orange mb-2">Areas for Improvement</h3>
                    <ul className="space-y-1">
                      {feedback?.improvements.map((improvement, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <X className="h-4 w-4 text-interview-orange mr-2 mt-0.5 shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={downloadReport}>Download Report</Button>
                <Button className="bg-interview-blue" onClick={getAiSuggestions} disabled={isAnalyzing}>Get AI Suggestions</Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      {aiSuggestions && (
        <Card className="mt-4">
          <CardHeader><CardTitle>AI Suggestions</CardTitle></CardHeader>
          <CardContent><div className="whitespace-pre-line">{aiSuggestions}</div></CardContent>
        </Card>
      )}
    </div>
  );
};

export default Resume;
