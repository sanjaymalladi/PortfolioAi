
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentQuestion, totalQuestions }) => {
  const progress = (currentQuestion / totalQuestions) * 100;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <p className="text-sm text-gray-700 dark:text-gray-300 mr-2 font-medium">Question {currentQuestion} of {totalQuestions}</p>
          {currentQuestion > 0 && 
            <span className="text-xs bg-interview-green/20 dark:bg-interview-green/30 text-interview-green dark:text-interview-green/90 py-0.5 px-2 rounded-full flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" /> In progress
            </span>
          }
        </div>
        <p className="text-sm font-medium text-interview-blue dark:text-interview-blue/90">{Math.round(progress)}%</p>
      </div>
      <div className="progress-bar bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="progress-fill bg-gradient-to-r from-interview-blue to-interview-green dark:from-interview-blue/80 dark:to-interview-green/80 transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
