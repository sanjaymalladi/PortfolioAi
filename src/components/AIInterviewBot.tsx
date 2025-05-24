import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  MessageSquare,
  Mic,
  StopCircle,
  PlayCircle,
  RotateCcw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getInterviewQuestions, getInterviewFeedback, Question, Feedback } from '@/services/interviewService';

// Interview stages enum
enum InterviewStage {
  NotStarted = 'NOT_STARTED',
  AskingQuestion = 'ASKING_QUESTION',
  UserAnswering = 'USER_ANSWERING',
  GeneratingFeedback = 'GENERATING_FEEDBACK',
  ShowingFeedback = 'SHOWING_FEEDBACK',
}

interface UserAnswer {
  question: string;
  answer: string;
}

// Component for displaying the avatar/interviewer
const AvatarPanel: React.FC<{ question: string; isSpeaking: boolean }> = ({ question, isSpeaking }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`w-24 h-24 mb-4 rounded-full overflow-hidden shadow-lg border-4 ${isSpeaking ? 'border-primary animate-pulse' : 'border-muted'}`}>
        <div className="w-full h-full bg-gradient-to-br from-primary/70 to-primary flex items-center justify-center">
          <MessageSquare className="h-10 w-10 text-white" />
        </div>
      </div>
      <h3 className="text-xl font-medium text-primary mb-2">Interviewer</h3>
      <div className="bg-muted/50 p-4 rounded-lg shadow-sm min-h-[100px] flex items-center justify-center w-full">
        <p className="text-lg">{question}</p>
      </div>
    </div>
  );
};

// Component for displaying user responses
const UserPanel: React.FC<{ isRecording: boolean; transcript: string }> = ({ isRecording, transcript }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError(null);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Could not access camera. Please check permissions.");
      }
    };
    
    startCamera();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-video bg-muted/70 rounded-lg overflow-hidden shadow-inner relative">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <AlertCircle className="w-12 h-12 mb-2 text-destructive/70" />
            <p className="text-center text-muted-foreground">{cameraError}</p>
          </div>
        ) : !mediaStream ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
        )}
        {isRecording && (
          <div className="absolute top-2 right-2 bg-destructive text-white px-2 py-1 rounded-full text-xs flex items-center animate-pulse">
            <Mic className="w-3 h-3 mr-1" /> REC
          </div>
        )}
      </div>
      
      <div className="w-full min-h-[100px] bg-muted/50 p-4 rounded-lg shadow-sm">
        <p className="text-sm text-muted-foreground mb-2">Your Answer (Live Transcript):</p>
        <p className="text-foreground leading-relaxed">{transcript || (isRecording ? "Listening..." : "Ready to record.")}</p>
      </div>
    </div>
  );
};

// Component for displaying feedback
const FeedbackPanel: React.FC<{ feedback: string }> = ({ feedback }) => {
  // Format feedback with basic markdown
  const formattedFeedback = feedback
    .split('\n')
    .map((line, index) => {
      // Heading detection
      const isHeading = /^[A-Za-z\s\d]+:$/.test(line.trim()) || /^#+\s/.test(line.trim());
      const isListItem = /^\d+\.\s/.test(line.trim()) || /^-\s/.test(line.trim());
      
      let className = "mb-2 text-muted-foreground";
      if (line.trim() === "") return <br key={index} />;
      if (isHeading) {
        className = "text-lg font-semibold text-primary mt-4 mb-2";
      } else if (isListItem) {
        className = "ml-4 mb-2 text-foreground";
      }
      
      return <p key={index} className={className}>{line}</p>;
    });

  return (
    <div className="p-6 bg-card rounded-lg shadow-sm border">
      <div className="flex items-center mb-4">
        <CheckCircle className="w-6 h-6 text-primary mr-2" />
        <h2 className="text-2xl font-bold text-primary">Interview Feedback</h2>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        {formattedFeedback}
      </div>
    </div>
  );
};

const AIInterviewBot: React.FC = () => {
  const [interviewStage, setInterviewStage] = useState<InterviewStage>(InterviewStage.NotStarted);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTTSSpeaking, setIsTTSSpeaking] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Load questions on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      const questionsData = await getInterviewQuestions('', '', 5);
      setQuestions(questionsData);
    };
    loadQuestions();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognitionAPI();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      speechRecognitionRef.current.lang = 'en-US';

      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.onresult = (event: any) => {
          let newTranscript = '';
          for (let i = 0; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              newTranscript += event.results[i][0].transcript + ' ';
            } else {
              newTranscript += event.results[i][0].transcript;
            }
          }
          setCurrentTranscript(newTranscript.trim());
        };
        
        speechRecognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setError(`Speech recognition error: ${event.error}. Please check your microphone settings.`);
          setIsRecording(false);
        };
      }
    } else {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    }

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }
    };
  }, []);

  // TTS function
  const speakQuestion = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      setIsTTSSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onend = () => {
        setIsTTSSpeaking(false);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Text-to-speech not supported",
        description: "Your browser doesn't support text-to-speech. Questions will be displayed only.",
      });
    }
  }, [toast]);

  const resetInterview = useCallback(() => {
    window.speechSynthesis?.cancel();
    setInterviewStage(InterviewStage.NotStarted);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setCurrentTranscript('');
    setFeedback(null);
    setError(null);
    setIsRecording(false);
    setIsTTSSpeaking(false);
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.abort();
    }
  }, []);

  const handleStartInterview = () => {
    resetInterview();
    setInterviewStage(InterviewStage.AskingQuestion);
    if (questions.length > 0) {
      speakQuestion(questions[0].text);
    }
  };

  const handleStartRecording = () => {
    if (!speechRecognitionRef.current) {
      toast({
        title: "Error",
        description: "Speech recognition not initialized.",
        variant: "destructive"
      });
      return;
    }
    
    window.speechSynthesis?.cancel();
    setCurrentTranscript('');
    setIsRecording(true);
    setInterviewStage(InterviewStage.UserAnswering);
    setError(null);
    
    try {
      speechRecognitionRef.current.start();
    } catch (e) {
      console.error("Error starting speech recognition:", e);
      toast({
        title: "Microphone Error",
        description: "Failed to start microphone. Please check permissions.",
        variant: "destructive"
      });
      setIsRecording(false);
      setInterviewStage(InterviewStage.AskingQuestion);
    }
  };

  const handleStopRecording = () => {
    if (!speechRecognitionRef.current || !isRecording) return;
    
    speechRecognitionRef.current.stop();
    setIsRecording(false);

    setTimeout(() => {
      const finalAnswer = currentTranscript.trim();
      const currentQuestion = questions[currentQuestionIndex]?.text || "Unknown question";
      const newAnswer: UserAnswer = {
        question: currentQuestion,
        answer: finalAnswer || "No answer provided."
      };
      setUserAnswers(prev => [...prev, newAnswer]);

      if (currentQuestionIndex < questions.length - 1) {
        const nextQuestionIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextQuestionIndex);
        setInterviewStage(InterviewStage.AskingQuestion);
        speakQuestion(questions[nextQuestionIndex].text);
      } else {
        setInterviewStage(InterviewStage.GeneratingFeedback);
        generateFeedback();
      }
    }, 200);
  };

  // Call the service to generate feedback
  const generateFeedback = async () => {
    setError(null);
    
    try {
      if (userAnswers.length === 0) {
        throw new Error("No answers to generate feedback for.");
      }
      
      const lastAnswer = userAnswers[userAnswers.length - 1];
      const feedbackResult = await getInterviewFeedback(
        lastAnswer.question,
        lastAnswer.answer
      );
      
      // Format feedback text
      const feedbackText = `
Interview Feedback:

Score: ${feedbackResult.score}/100

Strengths:
${feedbackResult.positive}

Areas for Improvement:
${feedbackResult.improvement}

${feedbackResult.score >= 75 ? 
  "Overall, excellent job! Your response was clear and effective." : 
  feedbackResult.score >= 50 ? 
  "Good effort! With some refinement, your responses will be even stronger." : 
  "Keep practicing! Consider the improvement suggestions to strengthen your interview skills."}
`;
      
      setFeedback(feedbackText);
      setInterviewStage(InterviewStage.ShowingFeedback);
      
    } catch (err: any) {
      console.error('Error generating feedback:', err);
      setError(err.message || 'Failed to generate feedback. Please try again.');
      toast({
        title: "Error",
        description: err.message || "Failed to generate interview feedback.",
        variant: "destructive"
      });
    }
  };

  const currentQuestionText = questions[currentQuestionIndex]?.text || "Interview Complete";

  // Render controls based on current interview stage
  const renderControls = () => {
    switch (interviewStage) {
      case InterviewStage.NotStarted:
        return (
          <Button
            onClick={handleStartInterview}
            className="flex items-center gap-2"
          >
            <PlayCircle className="w-5 h-5" /> Start Interview
          </Button>
        );
      case InterviewStage.AskingQuestion:
        return (
          <Button
            onClick={handleStartRecording}
            disabled={isTTSSpeaking || isRecording}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Mic className="w-5 h-5" /> Record Answer
          </Button>
        );
      case InterviewStage.UserAnswering:
        return (
          <Button
            onClick={handleStopRecording}
            disabled={!isRecording}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <StopCircle className="w-5 h-5" /> Stop Recording
          </Button>
        );
      case InterviewStage.GeneratingFeedback:
        return (
          <Button disabled className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
            Generating Feedback...
          </Button>
        );
      case InterviewStage.ShowingFeedback:
        return (
          <Button
            onClick={resetInterview}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> Restart Interview
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden border-border/40">
      <CardHeader className="bg-muted/50">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          AI Interview Practice
        </CardTitle>
        <CardDescription>
          Practice your interview skills with an AI interviewer
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {interviewStage !== InterviewStage.ShowingFeedback && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="order-2 md:order-1">
              <AvatarPanel
                question={
                  interviewStage === InterviewStage.NotStarted 
                    ? "Welcome! Click 'Start Interview' when ready." 
                    : currentQuestionText
                }
                isSpeaking={isTTSSpeaking || (interviewStage === InterviewStage.AskingQuestion && !isRecording)}
              />
            </div>
            
            <div className="order-1 md:order-2">
              {interviewStage !== InterviewStage.NotStarted ? (
                <UserPanel isRecording={isRecording} transcript={currentTranscript} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <MessageSquare className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Ready for your practice interview?</h3>
                  <p className="text-muted-foreground">
                    Click the "Start Interview" button to begin. You'll be asked 5 common interview questions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {interviewStage === InterviewStage.ShowingFeedback && feedback && (
          <div className="space-y-6">
            <FeedbackPanel feedback={feedback} />
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Your Interview Answers:</h3>
              <div className="space-y-4">
                {userAnswers.map((ua, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg">
                    <p className="font-medium text-sm">Q: {ua.question}</p>
                    <p className="text-muted-foreground mt-1">A: {ua.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center mt-6">
          {renderControls()}
        </div>
        
        {userAnswers.length > 0 && interviewStage !== InterviewStage.NotStarted && interviewStage !== InterviewStage.ShowingFeedback && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            Question {Math.min(currentQuestionIndex + 1, questions.length)} of {questions.length}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInterviewBot;

// Add Speech Recognition types needed for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
} 