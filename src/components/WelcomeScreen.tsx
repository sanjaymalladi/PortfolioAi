
import React from 'react';
import { Button } from '@/components/ui/button';
import { Smile, MessageSquare, CheckCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-6 text-center max-w-2xl mx-auto">
      <div className="flex items-center justify-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-interview-blue to-interview-green">
          Meet Your AI Interviewer
        </h1>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-interview-blue/20 to-interview-green/20 rounded-full blur-xl"></div>
        <div className="relative rounded-full bg-white dark:bg-gray-800 p-6 shadow-md border border-gray-100 dark:border-gray-700">
          <MessageSquare className="w-14 h-14 text-interview-blue dark:text-interview-blue/90" />
        </div>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        Hi! Ready to practice your interview skills?
      </h2>
      
      <p className="text-gray-600 dark:text-gray-300 text-lg">
        I'm your AI interviewer, designed to help early-career engineers prepare for technical interviews. 
        I'll ask you 5 questions and provide feedback on your answers.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border-gray-100 dark:border-gray-700">
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
              <Smile className="w-5 h-5 mr-2 text-interview-blue" />
              What to expect:
            </h3>
            <ul className="text-sm text-left text-gray-600 dark:text-gray-300 space-y-2">
              {[
                '5 interview questions',
                'Immediate feedback after each answer',
                'Performance summary at the end',
                'Supportive coaching throughout'
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-interview-green mr-2 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border-gray-100 dark:border-gray-700">
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
              <Smile className="w-5 h-5 mr-2 text-interview-green" />
              Tips for success:
            </h3>
            <ul className="text-sm text-left text-gray-600 dark:text-gray-300 space-y-2">
              {[
                'Answer as you would in a real interview',
                'Take time to think before responding',
                'Be concise but thorough',
                'Focus on clarity in your responses'
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <ChevronRight className="w-4 h-4 text-interview-blue mr-2 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Button 
        onClick={onStart} 
        className="relative overflow-hidden group bg-gradient-to-r from-interview-blue to-interview-green hover:from-interview-blue/90 hover:to-interview-green/90 text-white px-10 py-6 text-lg rounded-xl shadow-md"
      >
        <div className="absolute inset-0 w-full h-full transition-all duration-300 scale-x-0 translate-x-0 group-hover:scale-x-100 group-hover:translate-x-0 left-0 bg-white/20"></div>
        <span className="relative flex items-center">
          Start Interview
          <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
        </span>
      </Button>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
        Your answers will help generate personalized feedback to improve your interview skills.
      </p>
    </div>
  );
};

export default WelcomeScreen;
