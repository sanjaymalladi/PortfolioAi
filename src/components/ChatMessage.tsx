
import React from 'react';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  feedback?: {
    score: number;
    positive: string;
    improvement: string;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, feedback }) => {
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-4`}>
      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
        <p>{message}</p>
        
        {feedback && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center mb-2">
              <span className="text-sm font-semibold mr-2">Response Score:</span>
              <div className="flex-1 bg-white/30 h-2 rounded-full">
                <div 
                  className="h-full rounded-full bg-white" 
                  style={{ width: `${feedback.score}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-bold">{feedback.score}%</span>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-semibold">Strength:</span> {feedback.positive}
              </p>
              <p className="text-sm">
                <span className="font-semibold">For improvement:</span> {feedback.improvement}
              </p>
            </div>
          </div>
        )}
      </div>
      <span className="text-xs text-gray-500 mt-1">
        {isUser ? 'You' : 'AI Interviewer'}
      </span>
    </div>
  );
};

export default ChatMessage;
