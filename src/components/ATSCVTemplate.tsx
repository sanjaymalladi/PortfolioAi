import React from 'react';
import { cn } from '@/lib/utils';

interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  professionalSummary: string;
  workExperience: Array<{
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    achievements: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

interface ATSCVTemplateProps {
  data: CVData;
  className?: string;
}

const ATSCVTemplate: React.FC<ATSCVTemplateProps> = ({ data, className }) => {
  return (
    <div className={cn("ats-cv-template bg-white text-black p-8 max-w-4xl mx-auto", className)}>
      {/* Header Section */}
      <header className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {data.personalInfo.fullName}
        </h1>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-700">
          <span>{data.personalInfo.email}</span>
          <span>|</span>
          <span>{data.personalInfo.phone}</span>
          <span>|</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.linkedin && (
            <>
              <span>|</span>
              <span>{data.personalInfo.linkedin}</span>
            </>
          )}
          {data.personalInfo.website && (
            <>
              <span>|</span>
              <span>{data.personalInfo.website}</span>
            </>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-400 pb-1">
          PROFESSIONAL SUMMARY
        </h2>
        <p className="text-gray-800 leading-relaxed">
          {data.professionalSummary}
        </p>
      </section>

      {/* Work Experience */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-400 pb-1">
          PROFESSIONAL EXPERIENCE
        </h2>
        {data.workExperience.map((job, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-start mb-1">
              <div>
                <h3 className="font-bold text-gray-900">{job.jobTitle}</h3>
                <h4 className="font-semibold text-gray-800">{job.company}</h4>
              </div>
              <div className="text-right text-gray-700">
                <div>{job.location}</div>
                <div>{job.startDate} - {job.endDate}</div>
              </div>
            </div>
            <ul className="ml-4 space-y-1">
              {job.achievements.map((achievement, achIndex) => (
                <li key={achIndex} className="text-gray-800 leading-relaxed">
                  • {achievement}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-400 pb-1">
          EDUCATION
        </h2>
        {data.education.map((edu, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                <h4 className="font-semibold text-gray-800">{edu.institution}</h4>
              </div>
              <div className="text-right text-gray-700">
                <div>{edu.location}</div>
                <div>{edu.graduationDate}</div>
                {edu.gpa && <div>GPA: {edu.gpa}</div>}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-400 pb-1">
          TECHNICAL SKILLS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Technical Skills:</h4>
            <p className="text-gray-800">{data.skills.technical.join(', ')}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Soft Skills:</h4>
            <p className="text-gray-800">{data.skills.soft.join(', ')}</p>
          </div>
        </div>
      </section>

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-400 pb-1">
            CERTIFICATIONS
          </h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">{cert.name}</span>
                <span className="text-gray-700">{cert.date}</span>
              </div>
              <div className="text-gray-800">{cert.issuer}</div>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-400 pb-1">
            PROJECTS
          </h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-3">
              <h3 className="font-bold text-gray-900">{project.name}</h3>
              <p className="text-gray-800 mb-1">{project.description}</p>
              <p className="text-gray-700 text-sm">
                <strong>Technologies:</strong> {project.technologies.join(', ')}
              </p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ATSCVTemplate;
export type { CVData }; 