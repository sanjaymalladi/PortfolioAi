
import React from 'react';
import { MessageCircle } from 'lucide-react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start mb-4">
      <div className="chat-bubble-ai flex items-center gap-2 animate-pulse">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-interview-blue/20 dark:bg-interview-blue/30">
          <MessageCircle className="text-interview-blue dark:text-interview-blue/90 h-3.5 w-3.5" />
        </div>
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">AI Interviewer</span>
    </div>
  );
};

export default TypingIndicator;
