
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileEdit, Download, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const CoverLetter = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tone, setTone] = useState('professional');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const generateCoverLetter = () => {
    if (!jobDescription || !companyName) {
      toast({
        title: "Missing Information",
        description: "Please provide both a job description and company name",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const sampleLetters = {
        professional: `Dear Hiring Manager,

I am writing to express my interest in the Software Developer position at ${companyName}. With my background in computer science and experience in building web applications using modern frameworks, I believe I would be a valuable addition to your team.

The job description mentions a need for someone with strong problem-solving skills and experience with React, which align perfectly with my skill set. In my previous role at Tech Solutions Inc., I developed and maintained multiple React-based applications that improved internal workflow efficiency by 35%.

I am particularly drawn to ${companyName}'s mission to create innovative solutions that make a difference in people's lives. I am excited about the opportunity to contribute to your team and help build the next generation of your products.

Thank you for considering my application. I look forward to the possibility of discussing how my skills and experiences align with your needs.

Sincerely,
[Your Name]`,
        friendly: `Hi there!

I'm super excited about the Software Developer role at ${companyName}! When I read through the job description, I couldn't help but think how well my experience matches what you're looking for.

I've spent the last few years building really cool web apps using React and other modern tools. One of my favorite projects was creating a dashboard that helped my team at Tech Solutions track their work more easily – it actually saved everyone about 5 hours a week!

What really draws me to ${companyName} is how you're using technology to solve real problems for people. That's exactly the kind of work I want to be doing!

I'd love to chat more about how I could bring my enthusiasm and skills to your team. Thanks for reading, and I hope to hear from you soon!

Cheers,
[Your Name]`,
        confident: `To the ${companyName} Hiring Team:

I am the Software Developer you've been searching for. With my track record of delivering high-performance web applications and expertise in React development, I am positioned to make an immediate impact at ${companyName}.

Based on your job description, you need someone who can hit the ground running with minimal guidance. At Tech Solutions Inc., I independently led the development of a mission-critical application that increased customer engagement by 45% within three months of launch.

${companyName}'s reputation for innovation and excellence resonates with my professional approach. I don't just meet expectations—I exceed them, consistently.

I look forward to demonstrating how my proven abilities will contribute to your continued success.

Regards,
[Your Name]`
      };
      
      setCoverLetter(sampleLetters[tone as keyof typeof sampleLetters]);
      setIsGenerating(false);
      
      toast({
        title: "Cover Letter Generated",
        description: "Your personalized cover letter is ready",
      });
    }, 2000);
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
