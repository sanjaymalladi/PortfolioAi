import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ProgressBar from './ProgressBar';
import TypingIndicator from './TypingIndicator';
import SummaryScreen from './SummaryScreen';
import { getInterviewQuestion, getInterviewFeedback, generateSummary } from '../services/interviewService';
import type { Feedback } from '../services/interviewService';

interface Message {
  text: string;
  isUser: boolean;
  feedback?: Feedback;
}

interface InterviewChatProps {
  onRestart: () => void;
}

const DID_API_KEY = import.meta.env.VITE_DID_API_KEY || 'YOUR_DID_API_KEY';
const DID_API_URL = 'https://api.d-id.com';
const AVATAR_IMAGE_URL = 'https://d-id-public-bucket.s3.amazonaws.com/or-roman.jpg';

const InterviewChat: React.FC<InterviewChatProps> = ({ onRestart }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial question after component mount
  useEffect(() => {
    const startInterview = async () => {
      setMessages([
        { text: "Hello! I'm your AI interviewer today. I'll ask you 5 questions about your experience and skills. Let's get started!", isUser: false }
      ]);
      setIsTyping(true);
      // Get first question from Gemini
      const firstQuestion = await getInterviewQuestion();
      setMessages(prev => [...prev, { text: firstQuestion, isUser: false }]);
      setIsTyping(false);
      setCurrentQuestion(1);
      speak(firstQuestion);
    };
    startInterview();
    // eslint-disable-next-line
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Helper to call D-ID API and get video URL for a message
  const generateDIDVideo = async (text: string) => {
    setAvatarLoading(true);
    setAvatarVideoUrl(null);
    try {
      const response = await fetch(`${DID_API_URL}/talks/streams`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${DID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_url: AVATAR_IMAGE_URL,
          script: { type: 'text', input: text },
        }),
      });
      const data = await response.json();
      if (data && data.result_url) {
        setAvatarVideoUrl(data.result_url);
      } else if (data && data.url) {
        setAvatarVideoUrl(data.url);
      }
    } catch (e) {
      setAvatarVideoUrl(null);
    }
    setAvatarLoading(false);
  };

  // When a new AI message is added, generate a D-ID video for it
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg.isUser) {
        generateDIDVideo(lastMsg.text);
      }
    }
    // eslint-disable-next-line
  }, [messages]);

  // TTS for AI messages
  function speak(text: string) {
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }

  const handleSendMessage = async (message: string) => {
    setMessages(prev => [...prev, { text: message, isUser: true }]);
    setIsTyping(true);
    // Get feedback from Gemini
    const lastQuestion = messages.filter(m => !m.isUser).slice(-1)[0]?.text || '';
    const feedback = await getInterviewFeedback(lastQuestion, message);
    setAllFeedback(prev => [...prev, feedback]);
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
    // End after 5 questions
    if (currentQuestion >= 5) {
      setIsTyping(false);
      setShowSummary(true);
      return;
    }
    // Get next question from Gemini
    const previousQA = messages.map(m => m.text);
    const nextQuestion = await getInterviewQuestion(previousQA);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { text: nextQuestion, isUser: false }
      ]);
      setIsTyping(false);
      setCurrentQuestion(curr => curr + 1);
      speak(nextQuestion);
    }, 1000);
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
        <ProgressBar currentQuestion={currentQuestion} totalQuestions={5} />
      </div>
      {/* D-ID Avatar Video */}
      <div className="flex justify-center items-center bg-gray-50 py-4">
        {avatarLoading ? (
          <div className="w-32 h-32 flex items-center justify-center bg-gray-200 rounded-full animate-pulse">Loading...</div>
        ) : avatarVideoUrl ? (
          <video
            key={avatarVideoUrl}
            src={avatarVideoUrl}
            autoPlay
            controls={false}
            loop
            playsInline
            className="w-32 h-32 rounded-full object-cover border"
          />
        ) : (
          <img
            src={AVATAR_IMAGE_URL}
            alt="AI Avatar"
            className="w-32 h-32 rounded-full object-cover border"
          />
        )}
      </div>
      {/* Chat messages */}
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
          disabled={isTyping || currentQuestion === 0 || currentQuestion > 5}
        />
      </div>
    </div>
  );
};

export default InterviewChat;
