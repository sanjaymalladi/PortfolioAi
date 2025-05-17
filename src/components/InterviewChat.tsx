
import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ProgressBar from './ProgressBar';
import TypingIndicator from './TypingIndicator';
import SummaryScreen from './SummaryScreen';
import { getInterviewQuestions, generateFeedback, generateSummary } from '../services/interviewService';
import type { Feedback } from '../services/interviewService';

interface Message {
  text: string;
  isUser: boolean;
  feedback?: Feedback;
}

interface InterviewChatProps {
  onRestart: () => void;
}

const InterviewChat: React.FC<InterviewChatProps> = ({ onRestart }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const questions = getInterviewQuestions();

  // Initial question after component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        { text: "Hello! I'm your AI interviewer today. I'll ask you 5 questions about your experience and skills. Let's get started!", isUser: false }
      ]);
      setIsTyping(true);
      
      // Ask first question after introduction
      setTimeout(() => {
        setMessages(prev => [...prev, { text: questions[0].text, isUser: false }]);
        setIsTyping(false);
        setCurrentQuestion(1);
      }, 2000);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (message: string) => {
    // Add user message
    setMessages(prev => [...prev, { text: message, isUser: true }]);
    setIsTyping(true);
    
    // Generate feedback
    setTimeout(() => {
      const feedback = generateFeedback(currentQuestion, message);
      setAllFeedback(prev => [...prev, feedback]);
      
      // Update user message with feedback
      setMessages(prev => {
        const updatedMessages = [...prev];
        const lastUserMessageIndex = updatedMessages.findIndex(
          msg => msg.isUser && msg.text === message
        );
        if (lastUserMessageIndex !== -1) {
          updatedMessages[lastUserMessageIndex] = {
            ...updatedMessages[lastUserMessageIndex],
            feedback
          };
        }
        return updatedMessages;
      });
      
      // Check if we've reached the end of questions
      if (currentQuestion >= questions.length) {
        setIsTyping(false);
        setShowSummary(true);
        return;
      }
      
      // Add next question after a delay
      setTimeout(() => {
        setMessages(prev => [
          ...prev, 
          { text: questions[currentQuestion].text, isUser: false }
        ]);
        setIsTyping(false);
        setCurrentQuestion(curr => curr + 1);
      }, 1000);
    }, 1500);
  };

  if (showSummary) {
    const summary = generateSummary(allFeedback);
    return (
      <SummaryScreen 
        strengths={summary.strengths}
        improvements={summary.improvements}
        overallScore={summary.overallScore}
        onRestart={onRestart}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      <div className="bg-white shadow-sm border-b p-4">
        <ProgressBar currentQuestion={currentQuestion} totalQuestions={questions.length} />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage 
            key={index} 
            message={message.text} 
            isUser={message.isUser} 
            feedback={message.feedback}
          />
        ))}
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isTyping || currentQuestion === 0 || currentQuestion > questions.length}
        />
      </div>
    </div>
  );
};

export default InterviewChat;
