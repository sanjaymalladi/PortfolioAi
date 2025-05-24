import React from 'react';
import AIInterviewBot from '@/components/AIInterviewBot';
import PageLayout from '@/components/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InterviewChat from '@/components/InterviewChat';
import { MessageSquare, VideoIcon } from 'lucide-react';

const Interview = () => {
  const handleRestartInterview = () => {
    // Reloads the current page to restart the interview
    window.location.reload();
  };

  return (
    <PageLayout
      title="AI Interview Practice"
      description="Practice your interview skills with our AI-powered mock interview tools"
    >
      <Tabs defaultValue="mock-interview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="mock-interview">Video Interview</TabsTrigger>
          <TabsTrigger value="chat-interview">Chat Interview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mock-interview">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <VideoIcon className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Video Interview Practice</h2>
            </div>
            <p className="text-muted-foreground">
              Practice for technical and behavioral interviews with our video-based AI interview coach
            </p>
          </div>
          <AIInterviewBot />
        </TabsContent>
        
        <TabsContent value="chat-interview">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Chat Interview Practice</h2>
            </div>
            <p className="text-muted-foreground">
              Practice answering interview questions in a chat-based format with detailed feedback
            </p>
          </div>
          <InterviewChat onRestart={handleRestartInterview} />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Interview; 