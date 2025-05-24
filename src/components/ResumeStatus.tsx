import React from 'react';
import { useResume } from '@/context/ResumeContext';
import { FileText, Check, Upload } from 'lucide-react';
import { Button } from './ui/button';

interface ResumeStatusProps {
  onUploadClick?: () => void;
}

const ResumeStatus = ({
  onUploadClick
}: ResumeStatusProps) => {
  const {
    resumeData,
    isLoading
  } = useResume();

  if (isLoading) {
    return <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
        <FileText className="h-4 w-4" />
        Loading resume information...
      </div>;
  }

  if (resumeData) {
    return <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 p-3 rounded-md">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Check className="h-5 w-5" />
          <span className="font-medium">Resume already uploaded</span>
        </div>
        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
          {resumeData.fileName} • Uploaded {new Date(resumeData.uploadDate).toLocaleDateString()}
        </p>
      </div>;
  }

  return null;
};

export default ResumeStatus; 