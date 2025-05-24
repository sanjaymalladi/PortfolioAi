import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Search, Briefcase, MapPin, AlertCircle, UploadCloud, FileText, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface JobResult {
  job_id: string;
  employer_name: string;
  job_title: string;
  job_city?: string;
  job_country?: string;
  job_description: string;
  job_apply_link?: string;
}

interface AIJobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  applyLink?: string;
  category?: string;
  contractType?: string;
}

const Jobs = () => {
  const [keywords, setKeywords] = useState('');
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [aiJobs, setAiJobs] = useState<AIJobResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedKeywords, setExtractedKeywords] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID;
  const ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY;
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const fetchJobs = async () => {
    if (!keywords.trim()) {
      toast({
        title: 'Missing Keywords',
        description: 'Please enter keywords to search for jobs.',
        variant: 'destructive',
      });
      return;
    }
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
      toast({
        title: 'API Key Error',
        description: 'Adzuna App ID or Key is not set. Please check your .env file.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=10&what=${encodeURIComponent(keywords)}`
      );
      const data = await response.json();
      const jobs = (data.results || []).map((job: any) => ({
        job_id: job.id?.toString() || job.redirect_url,
        employer_name: job.company?.display_name || '',
        job_title: job.title,
        job_city: job.location?.area?.[1] || '',
        job_country: job.location?.area?.[0] || '',
        job_description: job.description,
        job_apply_link: job.redirect_url,
      }));
      setJobs(jobs);
      if (!jobs.length) {
        toast({
          title: 'No Jobs Found',
          description: 'No jobs matched your search. Try different keywords.',
        });
      }
    } catch (error) {
      toast({
        title: 'Job Fetch Error',
        description: 'Could not fetch jobs from Adzuna.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const extractKeywordsFromResume = async (file: File): Promise<string | null> => {
    if (!API_KEY) {
      toast({
        title: 'API Key Error',
        description: 'Gemini API Key is not configured. Cannot process resume.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // Create base64 representation of file
      const base64EncodedData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      
      const prompt = `Analyze the following resume content. Identify and extract key skills, technologies, programming languages, certifications, and potential job titles or roles the candidate is suitable for. 
      Return these as a single comma-separated string of keywords. 
      For example: 'React, TypeScript, Node.js, Software Engineer, Frontend Developer, Project Management, Agile Methodologies, AWS Certified Developer'. 
      Focus on concrete terms that would be effective for a job search query. Do not use any markdown formatting, just the comma-separated list.`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=' + API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { 
                  inlineData: {
                    mimeType: file.type,
                    data: base64EncodedData
                  }
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
        throw new Error('Invalid response format from Gemini API');
      }

      const keywords = data.candidates[0].content.parts[0].text.trim();
      if (!keywords) {
        toast({
          title: 'Resume Analysis',
          description: 'Could not extract any keywords from the resume. Try another file format.',
          variant: 'destructive',
        });
        return null;
      }
      return keywords;

    } catch (error) {
      console.error("Error processing resume with Gemini:", error);
      toast({
        title: 'Resume Analysis Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred while processing the resume.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const fetchJobsWithAI = async (keywords: string): Promise<AIJobResult[]> => {
    if (!API_KEY) {
      toast({
        title: 'API Key Error',
        description: 'Gemini API Key is not configured. Cannot search for jobs.',
        variant: 'destructive',
      });
      return [];
    }

    try {
      const prompt = `
        You are an expert job search assistant. Based on the following keywords, please find relevant job openings using Google Search.
        Keywords: "${keywords}"

        Return a list of up to 10 job opportunities.
        For each job, provide the following information in a JSON array format:
        - id: A unique identifier for the job (if not available, use the applyLink).
        - title: The job title.
        - company: The name of the company.
        - location: The location of the job (city, state/country).
        - description: A brief summary of the job description (1-2 sentences).
        - applyLink: The direct URL to the job application page or job posting.
        - category: (Optional) The job category or industry.
        - contractType: (Optional) The type of contract (e.g., full-time, contract).

        Example JSON format:
        [
          {
            "id": "some-unique-id-or-apply-link-123",
            "title": "Software Engineer, Frontend",
            "company": "Innovatech Solutions",
            "location": "San Francisco, CA",
            "description": "Develop and maintain user-facing features using React and TypeScript. Collaborate with backend teams to integrate APIs.",
            "applyLink": "https://jobs.example.com/frontend-engineer",
            "category": "Software Development",
            "contractType": "Full-time"
          }
        ]

        Ensure the output is only the JSON array, without any surrounding text or markdown.
        If no jobs are found, return an empty array [].
      `;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=' + API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} }]
        })
      });

      const data = await response.json();
      if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
        throw new Error('Invalid response format from Gemini API');
      }

      let jsonStr = data.candidates[0].content.parts[0].text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      let parsedJobs = JSON.parse(jsonStr);
      if (!Array.isArray(parsedJobs)) {
        if (typeof parsedJobs === 'object' && parsedJobs !== null) {
          const jobsKey = Object.keys(parsedJobs).find(key => Array.isArray(parsedJobs[key]));
          if (jobsKey) {
            parsedJobs = parsedJobs[jobsKey];
          } else {
            throw new Error('Job data received from AI is not in the expected array format.');
          }
        } else {
          throw new Error('Job data received from AI is not in the expected array format.');
        }
      }

      return parsedJobs.map((job: any, index: number): AIJobResult => ({
        id: job.id || job.applyLink || `job-${Date.now()}-${index}`,
        title: job.title || 'N/A',
        company: job.company || 'N/A',
        location: job.location || 'N/A',
        description: job.description || 'No description available.',
        applyLink: job.applyLink,
        category: job.category,
        contractType: job.contractType,
      }));

    } catch (error) {
      console.error("Error fetching jobs using Gemini:", error);
      toast({
        title: 'AI Job Search Error',
        description: error instanceof Error ? error.message : 'Could not fetch jobs using AI.',
        variant: 'destructive',
      });
      return [];
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const supportedTypes = [
        'text/plain', 
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif' // If resume is an image
      ];
      if (!supportedTypes.includes(file.type)) {
        toast({
          title: 'Unsupported File',
          description: `Unsupported file type: ${file.type}. Please upload a TXT, PDF, DOCX, PNG, JPG, or WEBP file.`,
          variant: 'destructive',
        });
        setSelectedFile(null);
        event.target.value = '';
        return;
      }
      if (file.size > 4 * 1024 * 1024) { // Gemini API limit for inline data is 4MB
        toast({
          title: 'File Too Large',
          description: 'File is too large. Maximum size is 4MB.',
          variant: 'destructive',
        });
        setSelectedFile(null);
        event.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleResumeUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Missing File',
        description: 'Please select a resume file first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingAI(true);
    setAiJobs([]);
    setExtractedKeywords(null);

    toast({
      title: 'Processing Resume',
      description: `Analyzing ${selectedFile.name}...`,
    });

    const keywords = await extractKeywordsFromResume(selectedFile);
    
    if (keywords) {
      setExtractedKeywords(keywords);
      toast({
        title: 'Resume Analyzed',
        description: 'Resume analyzed successfully! Now fetching jobs...',
      });
      
      const fetchedJobs = await fetchJobsWithAI(keywords);
      setAiJobs(fetchedJobs);
      
      if(fetchedJobs.length > 0) {
        toast({
          title: 'Jobs Found',
          description: `Found ${fetchedJobs.length} jobs matching your profile!`,
        });
      } else {
        toast({
          title: 'No Jobs Found',
          description: 'No jobs found matching your skills. Try a different resume or manual search.',
        });
      }
    }
    
    setIsLoadingAI(false);
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      const supportedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/webp'];
      if (!supportedTypes.includes(file.type)) {
        toast({
          title: 'Unsupported File',
          description: `Unsupported file type: ${file.type}. Please upload a TXT, PDF, DOCX, PNG, JPG, or WEBP file.`,
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 4 * 1024 * 1024) { 
        toast({
          title: 'File Too Large',
          description: 'File is too large. Maximum size is 4MB.',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  }, [toast]);

  const renderJobCard = (job: AIJobResult) => (
    <Card key={job.id} className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2">{job.title}</h3>
              <p className="text-muted-foreground text-sm">{job.company}</p>
              {job.location && (
                <div className="flex items-center mt-1 text-sm text-muted-foreground/80">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {job.location}
                </div>
              )}
              {(job.category || job.contractType) && (
                <div className="flex items-center mt-1 text-sm text-muted-foreground/80">
                  <Briefcase className="h-3.5 w-3.5 mr-1" />
                  {job.category && <span>{job.category}</span>}
                  {job.category && job.contractType && <span className="mx-1">&bull;</span>}
                  {job.contractType && <span>{job.contractType}</span>}
                </div>
              )}
            </div>
            {job.applyLink && (
              <Button asChild className="shrink-0" size="sm">
                <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1 h-4 w-4" /> Apply
                </a>
              </Button>
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout
      title="Job Search"
      description="Search and discover relevant job opportunities across multiple industries"
    >
      <div className="space-y-8">
        <Tabs defaultValue="keyword" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="keyword">Manual Search</TabsTrigger>
            <TabsTrigger value="resume">AI-Powered Resume Search</TabsTrigger>
          </TabsList>
          
          <TabsContent value="keyword" className="space-y-6">
            <Card className="overflow-hidden border-border/40">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Parameters
                </CardTitle>
                <CardDescription>
                  Enter keywords to find jobs matching your skills and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords</Label>
                    <div className="flex gap-2">
                      <Input
                        id="keywords"
                        placeholder="e.g., React Developer, Frontend Engineer"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') fetchJobs(); }}
                        className="flex-1"
                      />
                      <Button 
                        onClick={fetchJobs} 
                        className="min-w-[100px]"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Searching...' : 'Search'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Search Results</h2>
              
              {jobs.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-background">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/60" />
                  <p className="mt-4 text-muted-foreground">No jobs to display. Enter keywords and search above.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <Card key={job.job_id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-lg line-clamp-2">{job.job_title}</h3>
                              <p className="text-muted-foreground text-sm">{job.employer_name}</p>
                              {(job.job_city || job.job_country) && (
                                <div className="flex items-center mt-1 text-sm text-muted-foreground/80">
                                  <MapPin className="h-3.5 w-3.5 mr-1" />
                                  {job.job_city && `${job.job_city}`}{job.job_country && `, ${job.job_country}`}
                                </div>
                              )}
                            </div>
                            {job.job_apply_link && (
                              <Button asChild className="shrink-0" size="sm">
                                <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="mr-1 h-4 w-4" /> Apply
                                </a>
                              </Button>
                            )}
                          </div>
                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground line-clamp-3">{job.job_description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="resume" className="space-y-6">
            <Card className="overflow-hidden border-border/40">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <UploadCloud className="h-5 w-5" />
                  Resume Analyzer
                </CardTitle>
                <CardDescription>
                  Upload your resume and let AI find the best jobs matching your skills and experience
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors duration-200 bg-muted/30"
                  onDrop={onDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => document.getElementById('resume-input')?.click()}
                >
                  <input
                    type="file"
                    id="resume-input"
                    className="hidden"
                    accept=".txt,.pdf,.docx,image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    disabled={isLoadingAI}
                  />
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  {selectedFile ? (
                    <div className="text-foreground">
                      <FileText className="inline-block h-5 w-5 mr-2 align-text-bottom" />
                      <span>{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Drag & drop your resume here, or click to select file</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Supports .txt, .pdf, .docx, .png, .jpg files (max 4MB)</p>
                </div>

                {selectedFile && !isLoadingAI && (
                  <Button
                    onClick={handleResumeUpload}
                    disabled={isLoadingAI || !selectedFile}
                    className="mt-6 w-full"
                  >
                    Analyze Resume & Find Jobs
                  </Button>
                )}
                
                {isLoadingAI && (
                  <div className="mt-6 w-full text-center text-primary">
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {extractedKeywords ? 'Finding jobs...' : 'Analyzing resume...'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {extractedKeywords && !isLoadingAI && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-medium text-primary flex items-center mb-2">
                    <ChevronRight className="h-5 w-5 mr-1" />
                    Keywords Extracted from Your Resume:
                  </h3>
                  <p className="text-sm text-primary/80 italic">{extractedKeywords}</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Personalized Job Matches</h2>
              
              {aiJobs.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-background">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/60" />
                  <p className="mt-4 text-muted-foreground">
                    {extractedKeywords 
                      ? "No jobs found matching your skills. Try uploading a different resume."
                      : "Upload your resume to see AI-recommended jobs based on your skills and experience."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {aiJobs.map(renderJobCard)}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Jobs;
