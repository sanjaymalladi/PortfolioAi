
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, Upload, ExternalLink, Download, User, Code, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '@/components/PageLayout';

const Portfolio = () => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [links, setLinks] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Portfolio Saved",
      description: "Your portfolio has been created successfully.",
    });
  };

  const publishPortfolio = () => {
    toast({
      title: "Portfolio Published",
      description: "Your portfolio is now live at your-name.portfolioai.app",
    });
  };

  return (
    <PageLayout
      title="Portfolio Builder"
      description="Create a professional online portfolio to showcase your skills and projects"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card className="overflow-hidden border-border/40">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Add your details to personalize your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., John Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Professional Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Frontend Developer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / About Me</Label>
                  <Textarea
                    id="bio"
                    placeholder="A brief description about yourself and your professional experience..."
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills" className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Skills (comma separated)
                  </Label>
                  <Input
                    id="skills"
                    placeholder="e.g., HTML, CSS, JavaScript, React, Node.js"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="links" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Important Links
                  </Label>
                  <Textarea
                    id="links"
                    placeholder="GitHub: https://github.com/yourusername&#10;LinkedIn: https://linkedin.com/in/yourprofile&#10;Personal Website: https://yourwebsite.com"
                    rows={3}
                    value={links}
                    onChange={(e) => setLinks(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    One link per line with a label
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-image">Profile Image</Label>
                  <div className="flex items-center gap-4">
                    {previewUrl ? (
                      <div className="h-20 w-20 rounded-full overflow-hidden bg-muted flex-shrink-0 ring-2 ring-muted">
                        <img 
                          src={previewUrl} 
                          alt="Profile preview" 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground/60" />
                      </div>
                    )}
                    <div className="flex-grow">
                      <div className="relative">
                        <Input 
                          id="profile-image" 
                          type="file" 
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="pl-10"
                        />
                        <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended: Square image, at least 400x400px
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-6 py-4 border-t bg-muted/30 flex justify-between">
                <Button variant="outline" type="button">
                  Reset Form
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader className="bg-muted/50">
              <CardTitle>Portfolio Preview</CardTitle>
              <CardDescription>
                How your portfolio will appear to visitors
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-muted/30 h-[400px] flex items-center justify-center overflow-hidden">
                {!name && !title ? (
                  <div className="text-center p-6">
                    <Folder className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" />
                    <p className="text-muted-foreground">
                      Fill out the form to see your portfolio preview
                    </p>
                  </div>
                ) : (
                  <div className="w-full h-full bg-background p-4 overflow-auto">
                    <div className="text-center mb-4">
                      {previewUrl ? (
                        <div className="h-20 w-20 rounded-full overflow-hidden mx-auto mb-2">
                          <img 
                            src={previewUrl} 
                            alt={name} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
                          <span className="text-muted-foreground text-xl">
                            {name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <h2 className="font-bold text-xl">{name}</h2>
                      <p className="text-muted-foreground">{title}</p>
                    </div>
                    
                    {bio && (
                      <div className="mb-4">
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">ABOUT ME</h3>
                        <p className="text-sm">{bio}</p>
                      </div>
                    )}
                    
                    {skills && (
                      <div className="mb-4">
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">SKILLS</h3>
                        <div className="flex flex-wrap gap-1">
                          {skills.split(',').map((skill, index) => (
                            <span 
                              key={index} 
                              className="bg-muted text-foreground text-xs px-2 py-0.5 rounded"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="px-6 py-4 border-t bg-muted/30 flex justify-between">
              <Button variant="outline" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button 
                disabled={!name || !title} 
                onClick={publishPortfolio} 
                variant="default"
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                Publish
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Portfolio;
