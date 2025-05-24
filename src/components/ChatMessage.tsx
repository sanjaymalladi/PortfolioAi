import React from 'react';
import type { Feedback } from '../services/interviewService';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  feedback?: Feedback;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, feedback }) => {
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-4`}>
      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
        <p>{message}</p>
        
        {feedback && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center mb-3">
              <span className="text-sm font-semibold mr-2">Response Score:</span>
              <div className="flex-1 bg-white/30 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    feedback.score >= 75 ? 'bg-green-400' :
                    feedback.score >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${feedback.score}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-bold">{feedback.score}%</span>
            </div>
            
            <div className="space-y-2">
              {feedback.positive && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                  <p className="text-sm">
                    <span className="font-semibold text-green-300 flex items-center gap-1 mb-1">
                      ✓ Strengths:
                    </span>
                    <span className="text-green-100">{feedback.positive}</span>
                  </p>
                </div>
              )}
              
              {feedback.improvement && (
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-sm">
                    <span className="font-semibold text-blue-300 flex items-center gap-1 mb-1">
                      💡 For improvement:
                    </span>
                    <span className="text-blue-100">{feedback.improvement}</span>
                  </p>
                </div>
              )}
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
