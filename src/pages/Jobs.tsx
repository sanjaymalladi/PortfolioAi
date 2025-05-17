import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface JobResult {
  job_id: string;
  employer_name: string;
  job_title: string;
  job_city?: string;
  job_country?: string;
  job_description: string;
  job_apply_link?: string;
}

const Jobs = () => {
  const [keywords, setKeywords] = useState('');
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID;
  const ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY;

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="max-w-3xl mx-auto mb-6">
        <Button 
          onClick={() => navigate('/')} 
          className="mb-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          ← Back to Home
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">Job Search</h1>
        <p className="text-gray-600">Find real jobs from top job boards</p>
      </header>

      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Jobs</CardTitle>
            <CardDescription>
              Enter keywords to find jobs (e.g., React Developer, UX Designer, Google)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                placeholder="e.g., React Developer, Frontend Engineer, Google"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') fetchJobs(); }}
              />
            </div>
            <Button onClick={fetchJobs} className="w-full bg-interview-blue text-white" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search Jobs'}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Job Results</h2>
          {jobs.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              <p>No jobs to show. Enter keywords and search above.</p>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.job_id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{job.job_title}</CardTitle>
                      <CardDescription>
                        {job.employer_name} {job.job_city && `- ${job.job_city}`}{job.job_country && `, ${job.job_country}`}
                      </CardDescription>
                    </div>
                    {job.job_apply_link && (
                      <Button asChild className="bg-interview-blue text-white flex items-center">
                        <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-1 h-4 w-4" /> Apply
                        </a>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-600 mb-1 line-clamp-3">{job.job_description}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
