import React from 'react';
import LaTeXRenderer from '@/components/LaTeXRenderer';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent } from '@/components/ui/card';

const LaTeXDemo = () => {
  const sampleCV = `\\documentclass[letterpaper,10pt]{article}

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

\\begin{document}

\\begin{center}
    {\\LARGE John Doe} \\\\ \\vspace{2pt}
    \\begin{multicols}{2}
    \\begin{flushleft}
    \\href{https://linkedin.com/in/johndoe}{LinkedIn}\\\\
    \\href{https://johndoe.dev}{johndoe.dev}
    \\end{flushleft}
    
    \\begin{flushright}
    \\href{mailto:john@example.com}{john@example.com}\\\\
    (555) 123-4567\\\\
    San Francisco, CA
    \\end{flushright}
    \\end{multicols}
\\end{center}

%-----------PROFESSIONAL SUMMARY-----------
\\vspace{-2pt}
\\section{Professional Summary}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
    Experienced Full Stack Developer with 5+ years building scalable web applications. Expert in React, Node.js, and cloud technologies with a passion for creating user-centric solutions.
    }}
\\end{itemize}

%-----------EDUCATION-----------
\\vspace{-2pt}
\\section{Education}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\item
      \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
        \\textbf{Bachelor of Science in Computer Science} & May 2020 \\\\
        \\textit{University of California, Berkeley} & \\textit{Berkeley, CA} \\\\
      \\end{tabular*}\\vspace{-7pt}
      \\begin{itemize}
        \\item GPA: 3.8/4.0
      \\end{itemize}\\vspace{-5pt}
  \\end{itemize}

%-----------EXPERIENCE-----------
\\section{Experience}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\item
      \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
        \\textbf{Senior Full Stack Developer} & June 2022 -- Present \\\\
        \\textit{TechCorp Inc.} & \\textit{San Francisco, CA} \\\\
      \\end{tabular*}\\vspace{-7pt}
      \\begin{itemize}
        \\item Led development of customer portal serving 10,000+ users, resulting in 40\\% increase in user engagement
        \\item Architected microservices infrastructure using Node.js and AWS, improving system reliability by 99.9\\%
        \\item Mentored 3 junior developers and conducted code reviews for team of 8 engineers
      \\end{itemize}\\vspace{-5pt}
    
    \\item
      \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
        \\textbf{Full Stack Developer} & July 2020 -- May 2022 \\\\
        \\textit{StartupXYZ} & \\textit{Palo Alto, CA} \\\\
      \\end{tabular*}\\vspace{-7pt}
      \\begin{itemize}
        \\item Built responsive React applications with TypeScript, reducing development time by 30\\%
        \\item Implemented RESTful APIs using Express.js and MongoDB, supporting 1M+ daily requests
        \\item Collaborated with UX team to improve user interface, increasing conversion rates by 25\\%
      \\end{itemize}\\vspace{-5pt}
  \\end{itemize}

%-----------PROJECTS-----------
\\section{Projects}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
    \\textbf{E-commerce Platform}{: Full-stack online store with payment processing and inventory management} \\\\
    \\textit{Technologies: React, Node.js, PostgreSQL, Stripe API}
    \\\\
    \\textbf{Task Management App}{: Real-time collaborative workspace with drag-and-drop functionality} \\\\
    \\textit{Technologies: Vue.js, Socket.io, Firebase, Vuex}
    }}
 \\end{itemize}

%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills, Language Skills, and Interests}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
    \\textbf{Technical Skills}{: JavaScript, TypeScript, React, Vue.js, Node.js, Python, PostgreSQL, MongoDB, AWS, Docker} \\\\
    \\textbf{Soft Skills}{: Leadership, Problem Solving, Team Collaboration, Agile Methodologies} \\\\
    \\textbf{Languages}{: English (fluent), Spanish (conversational)} \\\\
    \\textbf{Interests}{: Open Source Contributions, Machine Learning, Rock Climbing}
    }}
 \\end{itemize}

\\end{document}`;

  return (
    <PageLayout title="Fast LaTeX CV Renderer">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">⚡ Fast LaTeX CV Renderer</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Lightning-fast LaTeX CV management with instant preview and professional PDF generation through Overleaf
          </p>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1">Lightning Fast</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Instant preview without slow rendering
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">📄</div>
              <h3 className="font-semibold mb-1">PDF Generation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                One-click PDF compilation via Overleaf
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">💯</div>
              <h3 className="font-semibold mb-1">LaTeX Only</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pure LaTeX source with full compatibility
              </p>
            </CardContent>
          </Card>
        </div>
        
        <LaTeXRenderer
          latexCode={sampleCV}
          title="Sample Professional CV"
          enableDownload={true}
          enableCopy={true}
        />
      </div>
    </PageLayout>
  );
};

export default LaTeXDemo; 