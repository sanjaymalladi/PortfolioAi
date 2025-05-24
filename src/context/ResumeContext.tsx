import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ResumeData, getStoredResume, storeResume } from "../services/resumeService";

interface ResumeContextProps {
  resumeData: ResumeData | null;
  setResumeData: (data: ResumeData | null) => void;
  isLoading: boolean;
  uploadResume: (text: string, fileName?: string) => void;
  clearResume: () => void;
}

const ResumeContext = createContext<ResumeContextProps | undefined>(undefined);

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return context;
};

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId } = useAuth();
  const { user } = useUser();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load resume data when user ID changes
  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      const storedResume = getStoredResume(userId);
      setResumeData(storedResume);
      setIsLoading(false);
    } else {
      setResumeData(null);
      setIsLoading(false);
    }
  }, [userId]);

  const uploadResume = (text: string, fileName: string = 'resume.pdf') => {
    if (!userId) return;
    
    const data = storeResume(userId, text, fileName);
    setResumeData(data);
  };

  const clearResume = () => {
    if (!userId) return;
    localStorage.removeItem(`user_resume_${userId}`);
    setResumeData(null);
  };

  return (
    <ResumeContext.Provider 
      value={{ 
        resumeData, 
        setResumeData, 
        isLoading,
        uploadResume,
        clearResume
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}; 