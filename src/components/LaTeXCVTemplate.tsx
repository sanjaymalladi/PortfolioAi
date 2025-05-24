import React from 'react';
import { CVData } from './ATSCVTemplate';

interface LaTeXCVTemplateProps {
  data: CVData;
}

const LaTeXCVTemplate: React.FC<LaTeXCVTemplateProps> = ({ data }) => {
  const generateLaTeXCode = () => {
    const {
      personalInfo,
      professionalSummary,
      workExperience,
      education,
      skills,
      certifications,
      projects
    } = data;

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

  const latexCode = generateLaTeXCode();

  return (
    <div className="bg-white p-8 font-mono text-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">LaTeX CV Source Code</h3>
        <div className="text-xs text-gray-500">
          Copy this code to compile with LaTeX
        </div>
      </div>
      <div className="bg-gray-50 border rounded-lg p-6 overflow-x-auto">
        <pre className="whitespace-pre-wrap text-xs leading-relaxed">
          {latexCode}
        </pre>
      </div>
    </div>
  );
};

export default LaTeXCVTemplate; 