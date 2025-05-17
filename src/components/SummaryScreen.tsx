
import React from 'react';
import { Button } from '@/components/ui/button';

interface SummaryScreenProps {
  strengths: string[];
  improvements: string[];
  overallScore: number;
  onRestart: () => void;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ 
  strengths, 
  improvements, 
  overallScore,
  onRestart
}) => {
  return (
    <div className="flex flex-col space-y-6 p-4 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-interview-blue">Interview Complete! 🎉</h2>
        <p className="text-gray-600 mt-2">
          Here's a summary of your performance
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-center mb-4">
          <div className="relative h-32 w-32">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle 
                className="text-gray-200 stroke-current" 
                strokeWidth="10"
                cx="50" 
                cy="50" 
                r="40" 
                fill="transparent"
              ></circle>
              <circle 
                className="text-interview-blue stroke-current" 
                strokeWidth="10"
                strokeLinecap="round"
                cx="50" 
                cy="50" 
                r="40" 
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (overallScore / 100) * 251.2}
                transform="rotate(-90 50 50)"
              ></circle>
            </svg>
            <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center">
              <span className="text-3xl font-bold text-interview-blue">{overallScore}%</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-interview-green mb-3">
              Your Strengths
            </h3>
            <ul className="space-y-2">
              {strengths.map((strength, index) => (
                <li key={`strength-${index}`} className="flex items-start">
                  <span className="text-interview-green mr-2">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-interview-orange mb-3">
              Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {improvements.map((improvement, index) => (
                <li key={`improvement-${index}`} className="flex items-start">
                  <span className="text-interview-orange mr-2">•</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold mb-3">Next Steps</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="text-interview-blue mr-2">•</span>
            <span>Review your answers and the feedback provided</span>
          </li>
          <li className="flex items-start">
            <span className="text-interview-blue mr-2">•</span>
            <span>Practice addressing the improvement areas</span>
          </li>
          <li className="flex items-start">
            <span className="text-interview-blue mr-2">•</span>
            <span>Try another interview session with different questions</span>
          </li>
        </ul>
      </div>
      
      <div className="flex justify-center pt-4">
        <Button 
          onClick={onRestart} 
          className="bg-interview-blue hover:bg-interview-blue/90 text-white px-8 py-6 text-lg rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          Start New Interview
        </Button>
      </div>
    </div>
  );
};

export default SummaryScreen;
