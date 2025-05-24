// Service to handle resume storage and retrieval across the application

// Type for the stored resume data
export interface ResumeData {
  text: string;
  fileName: string;
  uploadDate: string;
  userId: string;
}

// Store user's resume in localStorage
export const storeResume = (userId: string, resumeText: string, fileName: string = 'resume.pdf') => {
  const resumeData: ResumeData = {
    text: resumeText,
    fileName,
    uploadDate: new Date().toISOString(),
    userId,
  };
  
  localStorage.setItem(`user_resume_${userId}`, JSON.stringify(resumeData));
  return resumeData;
};

// Get user's stored resume
export const getStoredResume = (userId: string): ResumeData | null => {
  const storedResume = localStorage.getItem(`user_resume_${userId}`);
  return storedResume ? JSON.parse(storedResume) : null;
};

// Check if user has a stored resume
export const hasStoredResume = (userId: string): boolean => {
  return localStorage.getItem(`user_resume_${userId}`) !== null;
};

// Clear stored resume
export const clearStoredResume = (userId: string): void => {
  localStorage.removeItem(`user_resume_${userId}`);
}; 