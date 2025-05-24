import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileText, ArrowRight, ArrowLeft, Briefcase, GraduationCap, Award, User, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { askGemini } from '../services/geminiService';
import PageLayout from '@/components/PageLayout';
import { CVData } from '@/components/ATSCVTemplate';
import LaTeXRenderer from '@/components/LaTeXRenderer';

const CVGenerator = () => {
  const [step, setStep] = useState<'form'|'preview'>('form');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Form data state
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    },
    professionalSummary: '',
    workExperience: [
      {
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        achievements: ['']
      }
    ],
    education: [
      {
        degree: '',
        institution: '',
        location: '',
        graduationDate: '',
        gpa: ''
      }
    ],
    skills: {
      technical: [],
      soft: []
    },
    certifications: [],
    projects: []
  });

  // AI Enhancement state
  const [enhancementData, setEnhancementData] = useState({
    rawExperience: '',
    targetRole: '',
    industry: ''
  });

  const [showAIEnhancement, setShowAIEnhancement] = useState(false);

  const addWorkExperience = () => {
    setCvData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, {
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        achievements: ['']
      }]
    }));
  };

  const removeWorkExperience = (index: number) => {
    setCvData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  const updateWorkExperience = (index: number, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addAchievement = (expIndex: number) => {
    setCvData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) => 
        i === expIndex ? { ...exp, achievements: [...exp.achievements, ''] } : exp
      )
    }));
  };

  const updateAchievement = (expIndex: number, achIndex: number, value: string) => {
    setCvData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) => 
        i === expIndex ? {
          ...exp,
          achievements: exp.achievements.map((ach, j) => j === achIndex ? value : ach)
        } : exp
      )
    }));
  };

  const removeAchievement = (expIndex: number, achIndex: number) => {
    setCvData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) => 
        i === expIndex ? {
          ...exp,
          achievements: exp.achievements.filter((_, j) => j !== achIndex)
        } : exp
      )
    }));
  };

  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        institution: '',
        location: '',
        graduationDate: '',
        gpa: ''
      }]
    }));
  };

  const removeEducation = (index: number) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addCertification = () => {
    setCvData(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), {
        name: '',
        issuer: '',
        date: ''
      }]
    }));
  };

  const addProject = () => {
    setCvData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), {
        name: '',
        description: '',
        technologies: []
      }]
    }));
  };

  const enhanceWithAI = async () => {
    if (!enhancementData.rawExperience || !enhancementData.targetRole) {
      toast({
        title: "Missing Information",
        description: "Please provide your experience and target role for AI enhancement.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Help create an ATS-optimized CV based on the following information:

Target Role: ${enhancementData.targetRole}
Industry: ${enhancementData.industry}
Raw Experience: ${enhancementData.rawExperience}

Please provide a structured response in JSON format with the following structure:
{
  "professionalSummary": "2-3 sentence professional summary",
  "workExperience": [
    {
      "jobTitle": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "achievements": [
        "Achievement 1 with quantifiable results",
        "Achievement 2 with quantifiable results"
      ]
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2", "skill3"],
    "soft": ["skill1", "skill2", "skill3"]
  }
}

Focus on:
- ATS-friendly keywords for ${enhancementData.targetRole}
- Quantifiable achievements and results
- Action verbs and impact statements
- Industry-relevant technical skills
- Professional formatting

Extract and enhance the experience information to create compelling CV content.`;

      const result = await askGemini(prompt);
      
      // Parse the JSON response
      let parsedData;
      try {
        // Extract JSON from the response
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        throw new Error("Failed to parse AI response");
      }

      // Update CV data with AI-enhanced content
      setCvData(prev => ({
        ...prev,
        professionalSummary: parsedData.professionalSummary || prev.professionalSummary,
        workExperience: parsedData.workExperience && parsedData.workExperience.length > 0 
          ? parsedData.workExperience 
          : prev.workExperience,
        skills: {
          technical: parsedData.skills?.technical || prev.skills.technical,
          soft: parsedData.skills?.soft || prev.skills.soft
        }
      }));

      setShowAIEnhancement(false);
      toast({
        title: "CV Enhanced with AI",
        description: "Your CV has been optimized with AI-generated content!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enhance CV with AI. Please try again.",
        variant: "destructive"
      });
    }
    setIsGenerating(false);
  };

  const generateLatexCode = () => {
    const {
      personalInfo,
      professionalSummary,
      workExperience,
      education,
      skills,
      certifications,
      projects
    } = cvData;

    return `\\documentclass[letterpaper,10pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{multicol}
\\input{glyphtounicode}

\\usepackage[default]{sourcesanspro}
\\usepackage[T1]{fontenc}

\\pagestyle{fancy}
\\fancyhf{} 
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\centering
}{}{0em}{}[\\color{black}\\titlerule\\vspace{-5pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{center}
    {\\LARGE ${personalInfo.fullName || 'Your Name'}} \\\\ \\vspace{2pt}
    \\begin{multicols}{2}
    \\begin{flushleft}
    ${personalInfo.linkedin ? `\\href{${personalInfo.linkedin}}{LinkedIn}\\\\` : ''}
    ${personalInfo.website ? `\\href{${personalInfo.website}}{Personal Website}` : ''}
    \\end{flushleft}
    
    \\begin{flushright}
    \\href{mailto:${personalInfo.email || 'your@email.com'}}{${personalInfo.email || 'your@email.com'}}\\\\
    ${personalInfo.phone || 'Your Phone Number'}\\\\
    ${personalInfo.location || 'Your Location'}
    \\end{flushright}
    \\end{multicols}
\\end{center}

%-----------PROFESSIONAL SUMMARY-----------
${professionalSummary ? `\\vspace{-2pt}
\\section{Professional Summary}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
    ${professionalSummary.replace(/[&%$#_{}~^\\]/g, '\\$&')}
    }}
\\end{itemize}

` : ''}%-----------EDUCATION-----------
\\vspace{-2pt}
\\section{Education}
  \\resumeSubHeadingListStart
${education.map(edu => `      \\resumeSubheading
      {${edu.degree || 'Degree'}}{${edu.graduationDate || 'Graduation Date'}}
      {${edu.institution || 'Institution'}}{${edu.location || 'Location'}}${edu.gpa ? `
      \\resumeItemListStart
        \\resumeItem{GPA: ${edu.gpa}}
      \\resumeItemListEnd` : ''}`).join('\n\n')}
  \\resumeSubHeadingListEnd

%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
${workExperience.map(exp => `    \\resumeSubheading
      {${exp.jobTitle || 'Job Title'}}{${exp.startDate || 'Start Date'} -- ${exp.endDate || 'End Date'}}
      {${exp.company || 'Company Name'}}{${exp.location || 'Location'}}
      \\resumeItemListStart
${exp.achievements.filter(achievement => achievement.trim()).map(achievement => 
  `        \\resumeItem{${achievement.replace(/[&%$#_{}~^\\]/g, '\\$&')}}`
).join('\n')}
      \\resumeItemListEnd`).join('\n\n')}
  \\resumeSubHeadingListEnd

${projects && projects.length > 0 ? `%-----------PROJECTS-----------
\\section{Projects}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${projects.map(project => 
  `    \\textbf{${project.name}}{: ${project.description}} \\\\
    \\textit{Technologies: ${project.technologies.join(', ')}}`
).join(' \\\\\n    ')}
    }}
 \\end{itemize}

` : ''}%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills, Language Skills, and Interests}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
    \\textbf{Technical Skills}{: ${skills.technical.join(', ') || 'Your technical skills'}} \\\\
    \\textbf{Soft Skills}{: ${skills.soft.join(', ') || 'Your soft skills'}} \\\\
    \\textbf{Languages}{: English (fluent)} \\\\
    \\textbf{Interests}{: Technology, Innovation, Problem Solving}
    }}
 \\end{itemize}

${certifications && certifications.length > 0 ? `%-----------CERTIFICATIONS-----------
\\section{Certifications}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${certifications.map(cert => 
  `     \\textbf{${cert.name}}{: \\href{#}{${cert.issuer}} (${cert.date})}`
).join(' \\\\\n')}
    }}
 \\end{itemize}

` : ''}\\end{document}`;
  };

  const isFormValid = () => {
    return cvData.personalInfo.fullName && 
           cvData.personalInfo.email && 
           cvData.personalInfo.phone && 
           cvData.workExperience.some(exp => exp.jobTitle && exp.company);
  };

  return (
    <PageLayout
      title="ATS-Optimized CV Generator"
      description="Create a professional, ATS-friendly CV that gets past applicant tracking systems"
    >
      <Card className="overflow-hidden border-border/40">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {step === 'form' ? "Build Your CV" : "Your Professional CV"}
          </CardTitle>
          <CardDescription>
            {step === 'form' && "Fill in your details to create an ATS-optimized CV"}
            {step === 'preview' && "Preview and download your professional CV"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {step === 'form' && (
            <div className="space-y-8">
              {/* AI Enhancement Section */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    AI-Powered CV Enhancement
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAIEnhancement(!showAIEnhancement)}
                  >
                    {showAIEnhancement ? 'Hide' : 'Use AI'}
                  </Button>
                </div>
                
                {showAIEnhancement && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="target-role">Target Role</Label>
                        <Input
                          id="target-role"
                          placeholder="e.g., Software Engineer, Marketing Manager"
                          value={enhancementData.targetRole}
                          onChange={(e) => setEnhancementData(prev => ({...prev, targetRole: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="industry">Industry (Optional)</Label>
                        <Input
                          id="industry"
                          placeholder="e.g., Technology, Healthcare, Finance"
                          value={enhancementData.industry}
                          onChange={(e) => setEnhancementData(prev => ({...prev, industry: e.target.value}))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="raw-experience">Your Experience (Raw Text)</Label>
                      <Textarea
                        id="raw-experience"
                        rows={4}
                        placeholder="Paste your work experience, achievements, or resume text here. AI will help structure and optimize it..."
                        value={enhancementData.rawExperience}
                        onChange={(e) => setEnhancementData(prev => ({...prev, rawExperience: e.target.value}))}
                      />
                    </div>
                    <Button 
                      onClick={enhanceWithAI}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? 'Enhancing with AI...' : 'Enhance with AI'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={cvData.personalInfo.fullName}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                      }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={cvData.personalInfo.email}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, email: e.target.value }
                      }))}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={cvData.personalInfo.phone}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, phone: e.target.value }
                      }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={cvData.personalInfo.location}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, location: e.target.value }
                      }))}
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn (Optional)</Label>
                    <Input
                      id="linkedin"
                      value={cvData.personalInfo.linkedin}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                      }))}
                      placeholder="linkedin.com/in/johndoe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      value={cvData.personalInfo.website}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, website: e.target.value }
                      }))}
                      placeholder="www.johndoe.com"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Summary</h3>
                <Textarea
                  rows={3}
                  value={cvData.professionalSummary}
                  onChange={(e) => setCvData(prev => ({ ...prev, professionalSummary: e.target.value }))}
                  placeholder="Write a compelling 2-3 sentence professional summary highlighting your expertise and career goals..."
                />
              </div>

              {/* Work Experience */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Experience
                  </h3>
                  <Button onClick={addWorkExperience} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Experience
                  </Button>
                </div>
                
                {cvData.workExperience.map((exp, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">Experience {index + 1}</span>
                      {cvData.workExperience.length > 1 && (
                        <Button
                          onClick={() => removeWorkExperience(index)}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Job Title</Label>
                        <Input
                          value={exp.jobTitle}
                          onChange={(e) => updateWorkExperience(index, 'jobTitle', e.target.value)}
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                          placeholder="Acme Inc."
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={exp.location}
                          onChange={(e) => updateWorkExperience(index, 'location', e.target.value)}
                          placeholder="San Francisco, CA"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            value={exp.startDate}
                            onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                            placeholder="01/2022"
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            value={exp.endDate}
                            onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                            placeholder="Present"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Key Achievements</Label>
                        <Button
                          onClick={() => addAchievement(index)}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      {exp.achievements.map((achievement, achIndex) => (
                        <div key={achIndex} className="flex gap-2 mb-2">
                <Textarea
                            rows={2}
                            value={achievement}
                            onChange={(e) => updateAchievement(index, achIndex, e.target.value)}
                            placeholder="Led a team of 5 developers and increased productivity by 30%..."
                            className="flex-1"
                          />
                          {exp.achievements.length > 1 && (
                            <Button
                              onClick={() => removeAchievement(index, achIndex)}
                              size="sm"
                              variant="ghost"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                  Education
                  </h3>
                  <Button onClick={addEducation} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Education
                  </Button>
                </div>
                
                {cvData.education.map((edu, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">Education {index + 1}</span>
                      {cvData.education.length > 1 && (
                        <Button
                          onClick={() => removeEducation(index)}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          placeholder="Bachelor of Science in Computer Science"
                        />
                      </div>
                      <div>
                        <Label>Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          placeholder="University of California"
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={edu.location}
                          onChange={(e) => updateEducation(index, 'location', e.target.value)}
                          placeholder="Berkeley, CA"
                        />
                      </div>
                      <div>
                        <Label>Graduation Date</Label>
                        <Input
                          value={edu.graduationDate}
                          onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                          placeholder="05/2020"
                        />
                      </div>
                      <div>
                        <Label>GPA (Optional)</Label>
                        <Input
                          value={edu.gpa}
                          onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                          placeholder="3.8/4.0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Technical Skills</Label>
                    <Textarea
                      rows={3}
                      value={cvData.skills.technical.join(', ')}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        skills: {
                          ...prev.skills,
                          technical: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        }
                      }))}
                      placeholder="JavaScript, Python, React, Node.js, AWS, Docker..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
                  </div>
                  <div>
                    <Label>Soft Skills</Label>
                <Textarea
                  rows={3}
                      value={cvData.skills.soft.join(', ')}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        skills: {
                          ...prev.skills,
                          soft: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        }
                      }))}
                      placeholder="Leadership, Communication, Problem Solving, Team Collaboration..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setStep('preview')}
                disabled={!isFormValid()}
                className="w-full"
              >
                Generate CV Preview
                    <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-between gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('form')}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Edit
                </Button>
              </div>

              {/* LaTeX Renderer - Renders visual CV + provides controls */}
              <LaTeXRenderer
                latexCode={generateLatexCode()}
                title={`${cvData.personalInfo.fullName || 'CV'} - Professional Resume`}
                enableDownload={true}
                enableCopy={true}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default CVGenerator;
