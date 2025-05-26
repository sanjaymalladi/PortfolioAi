import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ProgressBar from './ProgressBar';
import TypingIndicator from './TypingIndicator';
import SummaryScreen from './SummaryScreen';
import { getInterviewQuestions, getInterviewQuestion, getInterviewFeedback, generateSummary } from '../services/interviewService';
import type { Feedback, Question } from '../services/interviewService';
import pdfParse from 'pdf-parse-new';
import { Buffer } from 'buffer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Mic, StopCircle, PlayCircle, RotateCcw, AlertCircle, CheckCircle, VideoIcon, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FormattedContent from './FormattedContent';
import MarkdownRenderer from './MarkdownRenderer';
import { getHybridSpeechRecognition, checkHybridSpeechSupport, type HybridSpeechResult } from '../services/hybridSpeechService';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Message {
  text: string;
  isUser: boolean;
  feedback?: Feedback;
}

interface InterviewChatProps {
  onRestart: () => void;
}

interface AvatarPanelProps {
  question: string;
  isSpeaking: boolean;
}

interface UserPanelProps {
  isRecording: boolean;
  transcript: string;
  onTranscriptChange: (value: string) => void;
}

interface FeedbackPanelProps {
  feedback: string;
}

interface UserAnswer {
  question: string;
  answer: string;
}

// Use environment variables from .env file
const DID_API_KEY = import.meta.env.VITE_DID_API_KEY;
const DID_API_URL = 'https://api.d-id.com';
const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVEN_LABS_API_KEY;
const ELEVEN_LABS_API_BASE_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const ELEVEN_LABS_VOICE_ID = import.meta.env.VITE_ELEVEN_LABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Rachel's voice
const ELEVEN_LABS_MODEL_ID = 'eleven_multilingual_v2';
const AVATAR_IMAGE_URL = 'https://ibb.co/zhfXd6Sb';

// Interview stages enum for video interview
enum InterviewStage {
  NotStarted = 'NOT_STARTED',
  AskingQuestion = 'ASKING_QUESTION',
  UserAnswering = 'USER_ANSWERING',
  GeneratingFeedback = 'GENERATING_FEEDBACK',
  ShowingFeedback = 'SHOWING_FEEDBACK',
}

// Component for displaying the avatar/interviewer
const AvatarPanel: React.FC<AvatarPanelProps> = ({ question, isSpeaking }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 mb-4 rounded-full overflow-hidden shadow-lg border-4 ${isSpeaking ? 'border-primary animate-pulse' : 'border-muted'}`}>
        <img 
          src={AVATAR_IMAGE_URL} 
          alt="AI Interviewer" 
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-xl font-medium text-primary mb-2">Interviewer</h3>
      <div className="bg-muted/50 p-4 rounded-lg shadow-sm min-h-[100px] flex items-center justify-center w-full">
        <p className="text-lg">{question}</p>
      </div>
    </div>
  );
};

// Component for displaying user responses in video interview
const UserPanel: React.FC<UserPanelProps> = ({ isRecording, transcript, onTranscriptChange }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState<boolean>(true);

  // Debug logging for transcript changes
  console.log('🐛 UserPanel Debug:', {
    transcript: transcript,
    transcriptLength: transcript?.length || 0,
    isRecording
  });

  useEffect(() => {
    let mounted = true;
    
    const startCamera = async () => {
      setCameraLoading(true);
      setCameraError(null);
      
      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access not supported in this browser');
        }

        // Try to get camera with basic constraints first
        const basicConstraints = { 
          video: { 
            facingMode: "user"
          }
        };
        
        console.log('Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
        
        if (mounted) {
          console.log('Camera access granted, setting up video stream...');
          setMediaStream(stream);
          
          // Wait for video element to be ready
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            
            // Ensure video plays
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current && mounted) {
                videoRef.current.play().catch(e => {
                  console.error('Error playing video:', e);
                });
              }
            };
          }
          
          setCameraError(null);
          setCameraLoading(false);
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        
            if (mounted) {
          let errorMessage = "Could not access camera. ";
          
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorMessage += "Camera access was denied. Please click the camera icon in your browser's address bar and allow camera access, then refresh the page.";
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errorMessage += "No camera was found on your device.";
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            errorMessage += "Your camera is being used by another application. Please close other applications and refresh the page.";
          } else if (err.name === 'SecurityError') {
            errorMessage += "Security error when accessing camera. Make sure you're using HTTPS.";
          } else {
            errorMessage += `Error: ${err.message || err.name || 'Unknown error'}`;
          }
          
          setCameraError(errorMessage);
          setCameraLoading(false);
        }
      }
    };
    
    startCamera();

    return () => {
      mounted = false;
      if (mediaStream) {
        console.log('Cleaning up camera stream...');
        mediaStream.getTracks().forEach(track => {
          track.stop();
          console.log('Camera track stopped');
        });
      }
    };
  }, []);

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  return (
    <div className="flex flex-col gap-4">
      {/* Your Video */}
      <div className="aspect-video bg-muted/70 rounded-lg overflow-hidden shadow-inner relative border-2 border-dashed border-muted-foreground/20">
        {cameraLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
            <p className="text-center text-muted-foreground">Starting camera...</p>
          </div>
        ) : cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <AlertCircle className="w-12 h-12 mb-2 text-destructive/70" />
            <p className="text-center text-muted-foreground text-sm">{cameraError}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-2" 
              size="sm"
            >
              Retry Camera
            </Button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            REC
          </div>
        )}
      </div>
      
      {/* Your Answer Text Area */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Your Answer:</label>
        <Textarea
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder="Type your answer here or use speech recognition..."
          className="min-h-[120px] resize-none border-2 focus:border-primary"
          disabled={isRecording}
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{transcript.length} characters</span>
          {isRecording && (
            <span className="text-red-600 font-medium">🎤 Recording... speak clearly</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Component for displaying feedback
const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback }) => {
  return (
    <div className="border rounded-xl overflow-hidden bg-background shadow-lg">
      <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-1.5 rounded-full">
            <CheckCircle className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Interview Feedback</h2>
        </div>
      </div>
      <div className="p-6">
        <MarkdownRenderer content={feedback} />
      </div>
    </div>
  );
};

// Component for checking system requirements
const SystemRequirementsCheck: React.FC = () => {
  const [supportInfo, setSupportInfo] = useState<any>(null);
  
  useEffect(() => {
    const checkSupport = async () => {
      const supportInfo = await checkHybridSpeechSupport();
      setSupportInfo(supportInfo);
    };
    checkSupport();
  }, []);
  
  const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  if (supportInfo && (!supportInfo.isSupported || !hasCamera)) {
  return (
      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800">System Requirements:</p>
            <ul className="mt-1 text-yellow-700 space-y-1">
              {!supportInfo.isSupported && (
                <li>• Speech recognition: {supportInfo.supportInfo}</li>
              )}
              {!hasCamera && (
                <li>• Camera access not supported</li>
              )}
            </ul>
            {supportInfo.recommendations.length > 0 && (
              <p className="mt-2 text-yellow-700">
                <strong>Setup:</strong> {supportInfo.recommendations.join(', ')}
              </p>
            )}
            
            {/* Provider availability display */}
            {supportInfo && (
              <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="font-medium text-blue-800 mb-1">Available Speech Recognition:</p>
                <div className="flex flex-wrap gap-2">
                  {supportInfo.providers.gemini && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Gemini Audio ✓
                    </Badge>
                  )}
                  {!supportInfo.providers.gemini && (
                    <Badge variant="destructive">
                      Gemini Audio Unavailable ✗
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                    AssemblyAI (Disabled)
                  </Badge>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                    Web Speech (Disabled)
                  </Badge>
                </div>
              </div>
            )}
      </div>
      </div>
    </div>
  );
  }
  return null;
};

const InterviewChat: React.FC<InterviewChatProps> = ({ onRestart }) => {
  // Chat interview state
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [pdfParsing, setPdfParsing] = useState(false);
  
  // Video interview state
  const [interviewMode, setInterviewMode] = useState<'chat' | 'video'>('chat');
  const [interviewStage, setInterviewStage] = useState<InterviewStage>(InterviewStage.NotStarted);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [videoUserAnswers, setVideoUserAnswers] = useState<UserAnswer[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [manualAnswer, setManualAnswer] = useState<string>('');
  const [videoFeedback, setVideoFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTTSSpeaking, setIsTTSSpeaking] = useState<boolean>(false);
  const [currentVideoQuestion, setCurrentVideoQuestion] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [speechProvider, setSpeechProvider] = useState<'auto' | 'assemblyai' | 'webspeech' | 'gemini'>('gemini');
  const [speechProviderInfo, setSpeechProviderInfo] = useState<any>(null);
  const [questionHistory, setQuestionHistory] = useState<string[]>([]); // Track previous Q&A
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Initialize speech recognition for video interview
  useEffect(() => {
    if (interviewMode !== 'video') return;
    
    const initializeSpeechRecognition = async () => {
      try {
        const speechRecognition = getHybridSpeechRecognition({
          language: 'en',
          preferWebSpeech: speechProvider === 'webspeech',
          fallbackToWebSpeech: speechProvider !== 'assemblyai' // No fallback if user specifically wants AssemblyAI
        });

        // Initialize the hybrid speech recognition service
        await speechRecognition.initialize();
      
        // Get provider info for display
        const providerInfo = speechRecognition.getCurrentProvider();
        setSpeechProviderInfo(providerInfo);
      
        speechRecognition.onResult((result: HybridSpeechResult) => {
          console.log('🐛 Speech result received:', result);
          if (result.success && result.text) {
            // Filter out error messages from the transcript
            const cleanText = result.text
              .replace(/No clear speech detected\..*?microphone\./gi, '')
              .replace(/Please speak more clearly.*?microphone\./gi, '')
              .replace(/Speech recognition error.*?\./gi, '')
              .replace(/No meaningful speech detected/gi, '')
              .trim();
            
            if (cleanText && cleanText.length > 0) {
              console.log('🐛 Adding clean text to transcript:', cleanText);
            setCurrentTranscript(prev => {
                const newTranscript = prev ? prev + ' ' + cleanText : cleanText;
                console.log('🐛 Updated transcript:', newTranscript);
              return newTranscript;
              });
              
              // Show success toast with provider info
              toast({
                title: `✅ Speech Detected (${result.provider})`,
                description: `Added: "${cleanText}"`,
                duration: 2000
              });
            }
          } else if (!result.success) {
            // Show helpful toast for speech detection issues
            toast({
              title: "🎤 No Clear Speech Detected",
              description: "Speak more clearly and closer to the microphone, or type your answer in the text box.",
              variant: "destructive",
              duration: 4000
            });
          }
        });
        
        speechRecognition.onError((error: string) => {
          console.error('Hybrid speech recognition error:', error);
          
          // Show specific error toast instead of setting error state
          if (error.includes("no clear speech") || error.includes("no meaningful speech")) {
            toast({
              title: "🎤 No Speech Detected",
              description: "Try speaking louder and closer to the microphone, or type your answer instead.",
              variant: "destructive",
              duration: 4000
            });
          } else {
            toast({
              title: "Speech Recognition Error",
              description: error || "Something went wrong with speech recognition. You can type your answer instead.",
              variant: "destructive",
              duration: 5000
            });
          }
          
          setIsRecording(false);
        });

        speechRecognition.onEnd(() => {
          setIsRecording(false);
        });

        // Store reference for cleanup
        speechRecognitionRef.current = speechRecognition;

      } catch (error) {
        console.error('Failed to initialize hybrid speech recognition:', error);
        setError('Hybrid speech recognition not available. Please check your API key in .env file.');
    }
    };

    initializeSpeechRecognition();

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.cleanup();
      }
    };
  }, [interviewMode, speechProvider]);

  // Check speech recognition support on component mount
  useEffect(() => {
    const checkSupport = async () => {
      const supportInfo = await checkHybridSpeechSupport();
      if (!supportInfo.isSupported) {
        setError(`Hybrid speech recognition not available. ${supportInfo.supportInfo}. Recommendations: ${supportInfo.recommendations.join(', ')}`);
      }
    };
    
    checkSupport();
  }, []);

  // Initial question after component mount (for chat interview)
  useEffect(() => {
    if (showSetup || interviewMode !== 'chat') return;
    const startInterview = async () => {
      setMessages([
        { text: "Hello! I'm your AI interviewer today. I'll ask you questions about your experience and skills based on your resume and the job description. Let's get started!", isUser: false }
      ]);
      setIsTyping(true);
      // Get first question from Gemini
      const firstQuestion = await getInterviewQuestion([], resumeText, jobDescription);
      setMessages(prev => [...prev, { text: firstQuestion, isUser: false }]);
      setIsTyping(false);
      setCurrentQuestion(1);
      // Removed TTS from chat mode - no more speak(firstQuestion)
    };
    startInterview();
    // eslint-disable-next-line
  }, [showSetup, interviewMode]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // When a new AI message is added, generate a D-ID video for it
  useEffect(() => {
    if (messages.length > 0 && interviewMode === 'chat') {
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg.isUser) {
        generateDIDVideo(lastMsg.text);
      }
    }
    // eslint-disable-next-line
  }, [messages]);

  // Helper to call D-ID API and get video URL for a message
  const generateDIDVideo = async (text: string) => {
    // Only try to use D-ID if API key is available
    if (!DID_API_KEY) {
      // If no API key, just use static image
      setAvatarVideoUrl(null);
      setAvatarLoading(false);
      return;
    }
    
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
          source_url: window.location.origin + AVATAR_IMAGE_URL,
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

  // Audio reference for TTS
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);

  // Stop current TTS playback
  const stopTTS = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = ''; 
    }
    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
      currentAudioUrlRef.current = null;
    }
  }, []);

  // TTS for AI messages using Eleven Labs API or browser's speech synthesis as fallback
  async function speak(text: string) {
    // Stop any previous TTS
    stopTTS();
    window.speechSynthesis?.cancel(); // Cancel browser speech synthesis
    
    // Try to use Eleven Labs if API key is available
    if (ELEVEN_LABS_API_KEY) {
      try {
        const apiUrl = `${ELEVEN_LABS_API_BASE_URL}/${ELEVEN_LABS_VOICE_ID}`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': ELEVEN_LABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: ELEVEN_LABS_MODEL_ID,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            }
          }),
        });
        
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          currentAudioUrlRef.current = audioUrl;
          
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          
          audio.onended = () => {
            if (currentAudioUrlRef.current) {
              URL.revokeObjectURL(currentAudioUrlRef.current);
              currentAudioUrlRef.current = null;
            }
          };
          
          audio.onerror = (e) => {
            console.error("Error playing Eleven Labs TTS audio:", e);
            // Don't fallback to browser speech here to avoid double audio
            if (currentAudioUrlRef.current) {
              URL.revokeObjectURL(currentAudioUrlRef.current);
              currentAudioUrlRef.current = null;
            }
          };
          
          await audio.play();
          return; // Exit here to prevent fallback
        } else {
          console.error('Eleven Labs API error:', await response.text());
          // Only fallback if ElevenLabs fails
          fallbackSpeak(text);
        }
      } catch (err) {
        console.error('Error using Eleven Labs TTS:', err);
        // Only fallback if ElevenLabs fails
        fallbackSpeak(text);
      }
    } else {
      // Use browser's speech synthesis only if no API key
      fallbackSpeak(text);
    }
  }

  // Fallback TTS using browser's speech synthesis API
  function fallbackSpeak(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }

  // TTS function for video interview using Eleven Labs or fallback to browser speech synthesis
  const speakQuestion = useCallback(async (text: string) => {
    // Stop any previous TTS
    stopTTS();
    window.speechSynthesis?.cancel(); // Cancel any browser speech synthesis
    
    setIsTTSSpeaking(true);
    setError(null);
    
    // Try to use Eleven Labs if API key is available
    if (ELEVEN_LABS_API_KEY) {
      try {
        const apiUrl = `${ELEVEN_LABS_API_BASE_URL}/${ELEVEN_LABS_VOICE_ID}`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': ELEVEN_LABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: ELEVEN_LABS_MODEL_ID,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            }
          }),
        });
        
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          currentAudioUrlRef.current = audioUrl;
          
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          
          audio.onended = () => {
            setIsTTSSpeaking(false);
            if (currentAudioUrlRef.current) {
              URL.revokeObjectURL(currentAudioUrlRef.current);
              currentAudioUrlRef.current = null;
            }
          };
          
          audio.onerror = (e) => {
            console.error("Error playing Eleven Labs TTS audio:", e);
            setIsTTSSpeaking(false);
            setError("TTS audio playback failed. Question is displayed above.");
            if (currentAudioUrlRef.current) {
              URL.revokeObjectURL(currentAudioUrlRef.current);
              currentAudioUrlRef.current = null;
            }
          };
          
          await audio.play();
          return; // Exit here to prevent fallback
        } else {
          let errorMessage = `${response.status} ${response.statusText}`;
          try {
            const errorJson = await response.json();
            if (errorJson.detail && typeof errorJson.detail === 'string') {
              errorMessage = errorJson.detail;
            } else if (errorJson.detail && errorJson.detail.message) {
              errorMessage = errorJson.detail.message;
            }
          } catch (e) {
            console.error('Could not parse error response JSON', e);
          }
          
          console.error('Eleven Labs API error:', errorMessage);
          setError(`TTS error: ${errorMessage}. Question is displayed above.`);
          setIsTTSSpeaking(false);
          
          // Don't fallback to avoid duplicate audio - just show error
          return;
        }
      } catch (err: any) {
        console.error('Error using Eleven Labs TTS:', err);
        setError(`TTS error: ${err.message || 'Unknown error'}. Question is displayed above.`);
        setIsTTSSpeaking(false);
        return; // Don't fallback to avoid duplicate audio
      }
    } else {
      // Use browser's speech synthesis only if no API key available
      fallbackSpeakQuestion(text);
    }
  }, [stopTTS]);

  // Fallback video TTS using browser's speech synthesis API
  const fallbackSpeakQuestion = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
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
      setIsTTSSpeaking(false);
    }
  }, [toast]);

  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setPdfParsing(true);
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async function() {
          const typedarray = new Uint8Array(this.result as ArrayBuffer);
          // Convert Uint8Array to Buffer before passing to pdfParse
          const buffer = Buffer.from(typedarray);
          const { text } = await pdfParse(buffer);
          setResumeText(text);
          setPdfParsing(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        setPdfParsing(false);
      }
    }
  };

  const handleSendMessage = async (message: string) => {
    setMessages(prev => [...prev, { text: message, isUser: true }]);
    setIsTyping(true);
    
    try {
    // Get feedback from Gemini
    const lastQuestion = messages.filter(m => !m.isUser).slice(-1)[0]?.text || '';
    const feedback = await getInterviewFeedback(lastQuestion, message, resumeText, jobDescription);
    setAllFeedback(prev => [...prev, feedback]);
      
    setMessages(prev => {
      const updatedMessages = [...prev];
        // Find the last user message with the matching text
        for (let i = updatedMessages.length - 1; i >= 0; i--) {
          if (updatedMessages[i].isUser && updatedMessages[i].text === message) {
            updatedMessages[i] = {
              ...updatedMessages[i],
          feedback
        };
            break;
          }
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
    const nextQuestion = await getInterviewQuestion(previousQA, resumeText, jobDescription);
      
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { text: nextQuestion, isUser: false }
      ]);
      setIsTyping(false);
      setCurrentQuestion(curr => curr + 1);
        // Removed TTS from chat mode - no more speak(nextQuestion)
    }, 1000);
      
    } catch (error) {
      console.error('Error in chat interview:', error);
      setIsTyping(false);
      
      // Show error message
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { text: "I apologize, but I'm having trouble processing your response. Please try again or continue with the next question.", isUser: false }
        ]);
        setCurrentQuestion(curr => curr + 1);
      }, 1000);
      
      toast({
        title: "Interview Error",
        description: "There was an issue processing your response. Please try again.",
        variant: "destructive",
        duration: 4000
      });
    }
  };

  // Video interview handlers
  const resetVideoInterview = useCallback(() => {
    window.speechSynthesis?.cancel();
    setInterviewStage(InterviewStage.NotStarted);
    setCurrentQuestionIndex(0);
    setVideoUserAnswers([]);
    setCurrentTranscript('');
    setVideoFeedback(null);
    setError(null);
    setIsRecording(false);
    setIsTTSSpeaking(false);
    setCurrentVideoQuestion('');
    setQuestionHistory([]);
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.cleanup();
    }
  }, []);

  const handleStartInterview = async () => {
    console.log('Starting video interview...');
    
    resetVideoInterview();
    setInterviewStage(InterviewStage.AskingQuestion);
    
    try {
      // Generate first question dynamically based on resume and job description
      const firstQuestion = await getInterviewQuestion([], resumeText, jobDescription);
      setCurrentVideoQuestion(firstQuestion);
      setQuestionHistory([firstQuestion]);
      console.log('Generated first question:', firstQuestion);
      speakQuestion(firstQuestion);
    } catch (error) {
      console.error('Failed to generate first question:', error);
      setError('Failed to generate interview questions. Please check your setup and try again.');
    }
  };

  const handleStartRecording = async () => {
    if (!speechRecognitionRef.current) {
      toast({
        title: "Speech Recognition Unavailable",
        description: "Speech recognition not initialized. Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Stop any ongoing speech synthesis
    window.speechSynthesis?.cancel();
      
      // Reset state
    setCurrentTranscript('');
    setIsRecording(true);
    setInterviewStage(InterviewStage.AskingQuestion);
    setError(null);
    
      console.log('Starting speech recognition...');
      
      // Start speech recognition
      await speechRecognitionRef.current.start();
      
      console.log('Speech recognition started successfully');
      
      // Show helpful toast
      toast({
        title: "🎤 Recording Started",
        description: "Speak clearly into your microphone. The record button will pulse while recording.",
        duration: 3000
      });
      
    } catch (error: any) {
      console.error("Error starting speech recognition:", error);
      
      let errorMessage = "Failed to start microphone. ";
      let toastDescription = "";
      
      if (error.message?.includes('not-allowed') || error.name === 'NotAllowedError') {
        errorMessage = "Microphone Access Denied";
        toastDescription = "Please allow microphone access in your browser settings and try again. Look for the microphone icon in your address bar.";
      } else if (error.message?.includes('audio-capture')) {
        errorMessage = "Microphone Not Available";
        toastDescription = "Could not access your microphone. Please check that it's connected and not being used by another application.";
      } else if (error.message?.includes('service-not-allowed')) {
        errorMessage = "Speech Service Blocked";
        toastDescription = "Speech recognition is blocked. Please check your browser settings and ensure you're using HTTPS.";
      } else if (error.message?.includes('network')) {
        errorMessage = "Network Error";
        toastDescription = "Network connection required for speech recognition. Please check your internet connection.";
      } else {
        errorMessage = "Speech Recognition Error";
        toastDescription = error.message || "Unknown error occurred. You can still type your answer in the text box.";
      }
      
      setIsRecording(false);
      setInterviewStage(InterviewStage.AskingQuestion);
      
      toast({
        title: errorMessage,
        description: toastDescription,
        variant: "destructive",
        duration: 6000
      });
    }
  };

  const handleStopRecording = () => {
    if (!speechRecognitionRef.current || !isRecording) return;
    
    try {
    speechRecognitionRef.current.stop();
    setIsRecording(false);
      setInterviewStage(InterviewStage.AskingQuestion); // Go back to asking question stage to show both buttons
      
      // Don't auto-submit - let user decide when to submit
      console.log('Recording stopped, user can now review and submit');
      
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      setIsRecording(false);
      setError('Failed to stop recording. Please try again.');
      setInterviewStage(InterviewStage.AskingQuestion);
    }
  };

  const submitAnswer = async () => {
      const finalAnswer = currentTranscript.trim();
    const currentQuestion = currentVideoQuestion || "Unknown question";
      const newAnswer: UserAnswer = {
        question: currentQuestion,
        answer: finalAnswer || "No answer provided."
      };
      setVideoUserAnswers(prev => [...prev, newAnswer]);

    // Add Q&A to history for context
    const updatedHistory = [...questionHistory, finalAnswer];
    setQuestionHistory(updatedHistory);

    // Decide whether to continue or end interview
    const shouldContinue = videoUserAnswers.length < 7; // Allow up to 8 questions total
    
    if (shouldContinue) {
      try {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentTranscript(''); // Clear transcript for next question
        setInterviewStage(InterviewStage.AskingQuestion);
        
        // Generate next question based on previous Q&A, resume, and job description
        const nextQuestion = await getInterviewQuestion(updatedHistory, resumeText, jobDescription);
        setCurrentVideoQuestion(nextQuestion);
        setQuestionHistory(prev => [...prev, nextQuestion]);
        
        console.log('Generated next question:', nextQuestion);
        speakQuestion(nextQuestion);
      } catch (error) {
        console.error('Failed to generate next question:', error);
        // End interview if we can't generate more questions
        setInterviewStage(InterviewStage.GeneratingFeedback);
        generateVideoFeedback();
      }
      } else {
      // End interview after 8 questions
        setInterviewStage(InterviewStage.GeneratingFeedback);
        generateVideoFeedback();
      }
  };

  const handleManualSubmit = () => {
    // Clean the transcript of any error messages before submitting
    const cleanTranscript = currentTranscript
      .replace(/No clear speech detected\..*?microphone\./gi, '')
      .replace(/Please speak more clearly.*?microphone\./gi, '')
      .replace(/Speech recognition error.*?\./gi, '')
      .replace(/No meaningful speech detected/gi, '')
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    if (!cleanTranscript) {
      toast({
        title: "Empty Answer",
        description: "Please provide an answer before submitting. You can type or use speech recognition.",
        variant: "destructive"
      });
      return;
    }
    
    // Update the transcript with the cleaned version
    setCurrentTranscript(cleanTranscript);
    
    // Directly submit without changing stage to UserAnswering
    submitAnswer();
  };

  // Generate feedback for video interview
  const generateVideoFeedback = async () => {
    setError(null);
    
    try {
      if (videoUserAnswers.length === 0) {
        throw new Error("No answers to generate feedback for.");
      }
      
      // Generate comprehensive feedback for all answers
      const allFeedback: Feedback[] = [];
      let feedbackText = "# 🎯 Complete Interview Feedback Report\n\n";
      
      // Generate feedback for each answer
      for (let i = 0; i < videoUserAnswers.length; i++) {
        const answer = videoUserAnswers[i];
      const feedbackResult = await getInterviewFeedback(
          answer.question,
          answer.answer,
          resumeText,
          jobDescription
        );
        allFeedback.push(feedbackResult);
        
        feedbackText += `## Question ${i + 1}: ${answer.question}\n\n`;
        feedbackText += `**Your Answer:** "${answer.answer}"\n\n`;
        feedbackText += `**Score:** ${feedbackResult.score}/100\n\n`;
        feedbackText += `### ✅ Strengths:\n${feedbackResult.positive}\n\n`;
        feedbackText += `### ⚠️ Areas for Improvement:\n${feedbackResult.improvement}\n\n`;
        feedbackText += `---\n\n`;
      }
      
      // Calculate overall statistics
      const totalScore = allFeedback.reduce((sum, feedback) => sum + feedback.score, 0);
      const averageScore = Math.round(totalScore / allFeedback.length);
      const highestScore = Math.max(...allFeedback.map(f => f.score));
      const lowestScore = Math.min(...allFeedback.map(f => f.score));
      
      // Add comprehensive summary
      feedbackText += `# 📊 Overall Performance Summary\n\n`;
      feedbackText += `**Average Score:** ${averageScore}/100\n`;
      feedbackText += `**Highest Score:** ${highestScore}/100\n`;
      feedbackText += `**Lowest Score:** ${lowestScore}/100\n`;
      feedbackText += `**Questions Answered:** ${videoUserAnswers.length}/5\n\n`;
      
      // Performance level assessment
      let performanceLevel = "";
      if (averageScore >= 85) {
        performanceLevel = "🌟 Excellent";
      } else if (averageScore >= 70) {
        performanceLevel = "👍 Good";
      } else if (averageScore >= 55) {
        performanceLevel = "⚡ Needs Improvement";
      } else {
        performanceLevel = "🎯 Requires Practice";
      }
      
      feedbackText += `**Performance Level:** ${performanceLevel}\n\n`;
      
      // Collect all strengths and improvements
      const allStrengths = allFeedback.map(f => f.positive).join(' ');
      const allImprovements = allFeedback.map(f => f.improvement).join(' ');
      
      // Key strengths summary
      feedbackText += `## 🌟 Key Strengths Observed:\n`;
      const commonStrengths = [
        "Clear communication",
        "Relevant examples",
        "Technical knowledge",
        "Problem-solving",
        "Leadership",
        "Teamwork",
        "Adaptability",
        "Time management"
      ];
      
      const foundStrengths = commonStrengths.filter(strength => 
        allStrengths.toLowerCase().includes(strength.toLowerCase())
      );
      
      if (foundStrengths.length > 0) {
        foundStrengths.forEach(strength => {
          feedbackText += `- ${strength}\n`;
        });
      } else {
        feedbackText += `- Enthusiasm for the role\n- Willingness to learn\n- Professional demeanor\n`;
      }
      
      feedbackText += `\n## ⚠️ Key Areas to Focus On:\n`;
      const commonImprovements = [
        "Provide specific examples",
        "Be more concise",
        "Show quantifiable results",
        "Demonstrate leadership",
        "Explain technical concepts clearly",
        "Connect experience to role requirements",
        "Show problem-solving approach",
        "Discuss challenges and learnings"
      ];
      
      const foundImprovements = commonImprovements.filter(improvement => 
        allImprovements.toLowerCase().includes(improvement.toLowerCase()) ||
        allImprovements.toLowerCase().includes(improvement.split(' ')[0].toLowerCase())
      );
      
      if (foundImprovements.length > 0) {
        foundImprovements.forEach(improvement => {
          feedbackText += `- ${improvement}\n`;
        });
      } else {
        feedbackText += `- Provide more specific examples from your experience\n`;
        feedbackText += `- Quantify your achievements with numbers and metrics\n`;
        feedbackText += `- Connect your answers more directly to the job requirements\n`;
      }
      
      // Actionable recommendations
      feedbackText += `\n## 🎯 Specific Action Items:\n\n`;
      
      if (averageScore < 70) {
        feedbackText += `### Immediate Improvements Needed:\n`;
        feedbackText += `1. **Structure your answers** using the STAR method (Situation, Task, Action, Result)\n`;
        feedbackText += `2. **Prepare specific examples** for common interview questions\n`;
        feedbackText += `3. **Research the company** and connect your experience to their needs\n`;
        feedbackText += `4. **Practice speaking** more confidently and clearly\n\n`;
      }
      
      feedbackText += `### Next Steps for Improvement:\n`;
      feedbackText += `1. **Record yourself** answering these questions again and compare\n`;
      feedbackText += `2. **Research common questions** for your target role\n`;
      feedbackText += `3. **Prepare 3-5 detailed STAR stories** from your experience\n`;
      feedbackText += `4. **Practice with a friend** or use our chat interview mode\n`;
      feedbackText += `5. **Study the job description** and align your answers accordingly\n\n`;
      
      // Motivational closing
      if (averageScore >= 80) {
        feedbackText += `## 🎉 Excellent Work!\nYou're well-prepared for interviews! Keep practicing to maintain your confidence and polish your delivery.`;
      } else if (averageScore >= 65) {
        feedbackText += `## 👍 Good Progress!\nYou're on the right track! Focus on the improvement areas above and you'll be ready for success.`;
      } else {
        feedbackText += `## 💪 Keep Practicing!\nEvery expert was once a beginner. Use this feedback to improve, and you'll see significant progress with practice.`;
      }
      
      feedbackText += `\n\n---\n*Generated by PortfolioAI Interview Practice - Keep practicing to achieve your career goals!*`;
      
      setVideoFeedback(feedbackText);
      setInterviewStage(InterviewStage.ShowingFeedback);
      
    } catch (err: any) {
      console.error('Error generating feedback:', err);
      setError(err.message || 'Failed to generate feedback. Please try again.');
      toast({
        title: "Error",
        description: err.message || "Failed to generate interview feedback.",
        variant: "destructive"
      });
      
      // Set a basic feedback if the detailed generation fails
      const basicFeedback = `
# Interview Feedback

Thank you for completing the interview practice session!

## Summary
You answered ${videoUserAnswers.length} questions. Here are your responses:

${videoUserAnswers.map((ua, index) => `
**Question ${index + 1}:** ${ua.question}
**Your Answer:** ${ua.answer}
`).join('\n')}

## Next Steps
- Practice answering questions using the STAR method
- Prepare specific examples from your experience
- Research common interview questions for your field
- Try our chat interview mode for more practice

Keep practicing to improve your interview skills!
      `;
      
      setVideoFeedback(basicFeedback);
      setInterviewStage(InterviewStage.ShowingFeedback);
    }
  };

  // Get current question text for video interview
  const currentQuestionText = currentVideoQuestion || "Interview Complete";

  if (showSummary) {
    // Generate personalized feedback like video interview instead of generic summary
    let feedbackText = "# 🎯 Complete Chat Interview Feedback Report\n\n";
    
    // Get all user messages and their feedback
    const userMessages = messages.filter(m => m.isUser);
    const interviewerQuestions = messages.filter(m => !m.isUser);
    
    // Generate feedback for each answer
    for (let i = 0; i < userMessages.length; i++) {
      const userMessage = userMessages[i];
      const question = interviewerQuestions[i]?.text || `Question ${i + 1}`;
      const feedback = userMessage.feedback;
      
      feedbackText += `## Question ${i + 1}: ${question}\n\n`;
      feedbackText += `**Your Answer:** "${userMessage.text}"\n\n`;
      
      if (feedback) {
        feedbackText += `**Score:** ${feedback.score}/100\n\n`;
        feedbackText += `### ✅ Strengths:\n`;
        feedback.key_strengths?.forEach(strength => {
          feedbackText += `- ${strength}\n`;
        });
        feedbackText += `\n### ⚠️ Areas for Improvement:\n`;
        feedback.areas_for_improvement?.forEach(improvement => {
          feedbackText += `- ${improvement}\n`;
        });
        feedbackText += `\n`;
        
        // Add detailed analysis sections if available
        if (feedback.clarity_conciseness?.feedback) {
          feedbackText += `**Clarity & Conciseness (${feedback.clarity_conciseness.rating}):** ${feedback.clarity_conciseness.feedback}\n\n`;
        }
        if (feedback.relevance_focus?.feedback) {
          feedbackText += `**Relevance & Focus (${feedback.relevance_focus.rating}):** ${feedback.relevance_focus.feedback}\n\n`;
        }
        if (feedback.examples_specificity?.feedback) {
          feedbackText += `**Examples & Specificity (${feedback.examples_specificity.rating}):** ${feedback.examples_specificity.feedback}\n\n`;
        }
        if (feedback.resume_jd_alignment?.feedback && feedback.resume_jd_alignment.rating !== "Not Applicable") {
          feedbackText += `**Resume/Job Alignment (${feedback.resume_jd_alignment.rating}):** ${feedback.resume_jd_alignment.feedback}\n\n`;
        }
        if (feedback.communication_style?.feedback) {
          feedbackText += `**Communication Style (${feedback.communication_style.rating}):** ${feedback.communication_style.feedback}\n\n`;
        }
        if (feedback.suggested_answer_snippet && feedback.suggested_answer_snippet !== "N/A") {
          feedbackText += `**Suggested Improvement:** ${feedback.suggested_answer_snippet}\n\n`;
        }
      } else {
        feedbackText += `**Score:** N/A (Feedback generation error)\n\n`;
        feedbackText += `### ⚠️ Note:\nFeedback could not be generated for this answer. Please try again or check the console for errors.\n\n`;
      }
      
      feedbackText += `---\n\n`;
    }
    
    // Calculate overall statistics
    const validFeedback = allFeedback.filter(f => f && typeof f.score === 'number');
    if (validFeedback.length > 0) {
      const totalScore = validFeedback.reduce((sum, feedback) => sum + feedback.score, 0);
      const averageScore = Math.round(totalScore / validFeedback.length);
      const highestScore = Math.max(...validFeedback.map(f => f.score));
      const lowestScore = Math.min(...validFeedback.map(f => f.score));
      
      // Add comprehensive summary
      feedbackText += `# 📊 Overall Performance Summary\n\n`;
      feedbackText += `**Average Score:** ${averageScore}/100\n`;
      feedbackText += `**Highest Score:** ${highestScore}/100\n`;
      feedbackText += `**Lowest Score:** ${lowestScore}/100\n`;
      feedbackText += `**Questions Answered:** ${validFeedback.length}/5\n\n`;
      
      // Performance level assessment
      let performanceLevel = "";
      if (averageScore >= 85) {
        performanceLevel = "🌟 Excellent";
      } else if (averageScore >= 70) {
        performanceLevel = "👍 Good";
      } else if (averageScore >= 55) {
        performanceLevel = "⚡ Needs Improvement";
      } else {
        performanceLevel = "🎯 Requires Practice";
      }
      
      feedbackText += `**Performance Level:** ${performanceLevel}\n\n`;
      
      // Collect all strengths and improvements
      const allStrengths = validFeedback.flatMap(f => f.key_strengths || []).join(' ');
      const allImprovements = validFeedback.flatMap(f => f.areas_for_improvement || []).join(' ');
      
      // Key strengths summary
      feedbackText += `## 🌟 Key Strengths Observed:\n`;
      const commonStrengths = [
        "Clear communication",
        "Relevant examples",
        "Technical knowledge",
        "Problem-solving",
        "Leadership",
        "Teamwork",
        "Adaptability",
        "Time management"
      ];
      
      const foundStrengths = commonStrengths.filter(strength => 
        allStrengths.toLowerCase().includes(strength.toLowerCase())
      );
      
      if (foundStrengths.length > 0) {
        foundStrengths.forEach(strength => {
          feedbackText += `- ${strength}\n`;
        });
      } else {
        feedbackText += `- Enthusiasm for the role\n- Willingness to learn\n- Professional demeanor\n`;
      }
      
      feedbackText += `\n## ⚠️ Key Areas to Focus On:\n`;
      const commonImprovements = [
        "Provide specific examples",
        "Be more concise",
        "Show quantifiable results",
        "Demonstrate leadership",
        "Explain technical concepts clearly",
        "Connect experience to role requirements",
        "Show problem-solving approach",
        "Discuss challenges and learnings"
      ];
      
      const foundImprovements = commonImprovements.filter(improvement => 
        allImprovements.toLowerCase().includes(improvement.toLowerCase()) ||
        allImprovements.toLowerCase().includes(improvement.split(' ')[0].toLowerCase())
      );
      
      if (foundImprovements.length > 0) {
        foundImprovements.forEach(improvement => {
          feedbackText += `- ${improvement}\n`;
        });
      } else {
        feedbackText += `- Provide more specific examples from your experience\n`;
        feedbackText += `- Quantify your achievements with numbers and metrics\n`;
        feedbackText += `- Connect your answers more directly to the job requirements\n`;
      }
      
      // Actionable recommendations
      feedbackText += `\n## 🎯 Specific Action Items:\n\n`;
      
      if (averageScore < 70) {
        feedbackText += `### Immediate Improvements Needed:\n`;
        feedbackText += `1. **Structure your answers** using the STAR method (Situation, Task, Action, Result)\n`;
        feedbackText += `2. **Prepare specific examples** for common interview questions\n`;
        feedbackText += `3. **Research the company** and connect your experience to their needs\n`;
        feedbackText += `4. **Practice speaking** more confidently and clearly\n\n`;
      }
      
      feedbackText += `### Next Steps for Improvement:\n`;
      feedbackText += `1. **Record yourself** answering these questions again and compare\n`;
      feedbackText += `2. **Research common questions** for your target role\n`;
      feedbackText += `3. **Prepare 3-5 detailed STAR stories** from your experience\n`;
      feedbackText += `4. **Practice with video mode** or mock interviews\n`;
      feedbackText += `5. **Study the job description** and align your answers accordingly\n\n`;
      
      // Motivational closing
      if (averageScore >= 80) {
        feedbackText += `## 🎉 Excellent Work!\nYou're well-prepared for interviews! Keep practicing to maintain your confidence and polish your delivery.`;
      } else if (averageScore >= 65) {
        feedbackText += `## 👍 Good Progress!\nYou're on the right track! Focus on the improvement areas above and you'll be ready for success.`;
      } else {
        feedbackText += `## 💪 Keep Practicing!\nEvery expert was once a beginner. Use this feedback to improve, and you'll see significant progress with practice.`;
      }
    } else {
      feedbackText += `# ⚠️ Feedback Generation Issues\n\nThere were issues generating feedback for your answers. Please try the interview again or check the console for error details.\n\n`;
      feedbackText += `## Your Responses:\n`;
      userMessages.forEach((msg, index) => {
        feedbackText += `**Q${index + 1}:** ${interviewerQuestions[index]?.text || 'Question not found'}\n`;
        feedbackText += `**A${index + 1}:** ${msg.text}\n\n`;
      });
    }
    
    feedbackText += `\n\n---\n*Generated by PortfolioAI Interview Practice - Keep practicing to achieve your career goals!*`;
    
        return (
      <div className="w-full min-h-screen p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Chat Interview Complete! 🎉</h2>
            <p className="text-muted-foreground">Here's your personalized feedback and performance analysis</p>
          </div>
          
          <FeedbackPanel feedback={feedbackText} />
          
          <div className="mt-8 text-center">
          <Button
              onClick={onRestart} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              🔄 Start New Interview
          </Button>
          </div>
        </div>
          </div>
        );
  }

  // Main render for the component with tabs
  return (
    <div className="min-h-screen w-full">
      {showSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60">
          <div className="bg-background border rounded-lg shadow-lg p-8 w-full max-w-lg mx-4">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Interview Setup</h2>
            <div className="mb-4">
              <label className="block font-medium mb-1 text-foreground">Upload Resume (PDF or paste text)</label>
              <input 
                type="file" 
                accept=".pdf,.txt" 
                onChange={handleResumeFileUpload} 
                className="mb-2 block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" 
              />
              <textarea
                className="w-full border border-border rounded p-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={5}
                placeholder="Paste your resume here..."
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                disabled={pdfParsing}
              />
              {pdfParsing && <div className="text-primary mt-2">Parsing PDF...</div>}
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1 text-foreground">Job Description</label>
              <textarea
                className="w-full border border-border rounded p-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={5}
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-2 text-foreground">Interview Mode</label>
              <div className="flex gap-4">
                <Button 
                  variant={interviewMode === 'chat' ? "default" : "outline"}
                  onClick={() => setInterviewMode('chat')}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat Interview
                </Button>
                <Button 
                  variant={interviewMode === 'video' ? "default" : "outline"}
                  onClick={() => setInterviewMode('video')}
                  className="flex items-center gap-2"
                >
                  <VideoIcon className="h-4 w-4" />
                  Video Interview
                </Button>
              </div>
            </div>
            <Button
              className="w-full"
              disabled={!resumeText || !jobDescription || pdfParsing}
              onClick={() => setShowSetup(false)}
            >
              Start Interview
            </Button>
          </div>
        </div>
      )}

      {/* Main content based on interview mode */}
      {!showSetup && (
        <div className="w-full">
          {interviewMode === 'chat' && (
            <div className="flex flex-col min-h-screen">
              <div className="bg-background shadow-sm border-b p-4">
                <ProgressBar currentQuestion={currentQuestion} totalQuestions={5} />
              </div>
              {/* D-ID Avatar Video */}
              <div className="flex justify-center items-center bg-muted/30 py-6">
                {avatarLoading ? (
                  <div className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 flex items-center justify-center bg-muted rounded-full animate-pulse text-muted-foreground">Loading...</div>
                ) : avatarVideoUrl ? (
                  <video
                    key={avatarVideoUrl}
                    src={avatarVideoUrl}
                    autoPlay
                    controls={false}
                    loop
                    playsInline
                    className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full object-cover border shadow-lg"
                  />
                ) : (
                  <img
                    src={AVATAR_IMAGE_URL}
                    alt="AI Interviewer"
                    className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full object-cover border shadow-lg"
                  />
                )}
              </div>
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
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
              <div className="p-4 border-t bg-background">
                <ChatInput 
                  onSendMessage={handleSendMessage} 
                  disabled={isTyping || currentQuestion === 0 || currentQuestion > 5}
                />
              </div>
            </div>
          )}

          {interviewMode === 'video' && (
            <div className="w-full min-h-screen p-4">
              <Card className="w-full max-w-none mx-auto">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <VideoIcon className="h-5 w-5" />
                  AI Video Interview Practice
                </CardTitle>
                <CardDescription>
                  Practice your interview skills with an AI interviewer
                </CardDescription>
                {/* Browser compatibility info */}
                <SystemRequirementsCheck />
              </CardHeader>
              <CardContent className="p-6">
                {error && (
                  <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                  {/* Speech Recognition Tips */}
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🎙️ Speech Recognition Tips:</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Speak clearly and at a normal pace</li>
                      <li>• Ensure your microphone is close to your mouth (6-12 inches)</li>
                      <li>• Minimize background noise</li>
                      <li>• Allow microphone access when prompted by your browser</li>
                      <li>• If speech isn't detected, you can type your answer in the text box</li>
                    </ul>
                  </div>

                  {/* Speech Provider Selection */}
                  <div className="mb-6 p-4 bg-muted/50 border border-border rounded-lg">
                    <h4 className="font-semibold text-foreground mb-3">Speech Recognition:</h4>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => {
                            setSpeechProvider('gemini');
                            toast({
                              title: "🎯 Using Gemini Audio",
                              description: "High-quality speech transcription with Gemini AI",
                              duration: 2000
                            });
                          }}
                          className="px-3 py-1 rounded-full text-sm font-medium"
                        >
                          Gemini Audio (Only Available)
                        </Button>
                      </div>
                      
                      {/* Current provider info */}
                      {speechProviderInfo && (
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="default"
                            className="capitalize"
                          >
                            Gemini Audio
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {speechProviderInfo.features.join(' • ')}
                          </span>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        <p><strong>Gemini Audio:</strong> High-quality AI transcription - record, stop, then get transcription</p>
                        <p><strong>Note:</strong> Other providers (AssemblyAI, Web Speech) are temporarily unavailable</p>
                      </div>
                    </div>
                  </div>

                {interviewStage !== InterviewStage.ShowingFeedback && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                    {/* Interviewer Panel */}
                      <div className="order-1 xl:order-1">
                      <AvatarPanel
                        question={
                          interviewStage === InterviewStage.NotStarted 
                            ? "Welcome! Click 'Start Interview' when ready." 
                            : currentQuestionText
                        }
                        isSpeaking={isTTSSpeaking || (interviewStage === InterviewStage.AskingQuestion && !isRecording)}
                      />
                    </div>
                    
                    {/* Your Response Panel */}
                      <div className="order-2 xl:order-2">
                      {interviewStage !== InterviewStage.NotStarted ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-center">Your Response</h3>
                          <UserPanel 
                            isRecording={isRecording} 
                            transcript={currentTranscript} 
                            onTranscriptChange={setCurrentTranscript} 
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6">
                          <div className="p-6 bg-primary/10 rounded-full">
                            <MessageSquare className="h-12 w-12 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold">Ready for your practice interview?</h3>
                            <p className="text-muted-foreground max-w-md">
                              This AI-powered interview will ask you 5 common questions and provide personalized feedback to help you improve.
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground max-w-md">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Real-time feedback</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Speech recognition</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Video practice</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Flexible input</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {interviewStage === InterviewStage.ShowingFeedback && videoFeedback && (
                    <div className="space-y-8 mb-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-semibold mb-2">Interview Complete! 🎉</h3>
                      <p className="text-muted-foreground">Here's your personalized feedback and performance summary</p>
                    </div>
                    
                    <FeedbackPanel feedback={videoFeedback} />
                    
                    <div className="border rounded-lg p-6 bg-muted/20">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Your Interview Answers:
                      </h3>
                      <div className="space-y-4">
                        {videoUserAnswers.map((ua, index) => (
                          <div key={index} className="p-4 bg-white rounded-lg border border-muted">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <div className="flex-1 space-y-2">
                                <p className="font-medium text-sm text-primary">Q: {ua.question}</p>
                                <p className="text-muted-foreground">{ua.answer}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Controls Section */}
                  <div className="w-full">
                    {/* Simple, clean button interface */}
                    <div className="w-full max-w-2xl mx-auto space-y-4">
                      
                      {/* Start Interview button for NotStarted stage */}
                      {interviewStage === InterviewStage.NotStarted && (
                        <button 
                          onClick={handleStartInterview}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium text-base"
                        >
                          🚀 Start Interview
                        </button>
                      )}
                      
                      {/* Two main buttons for question stage */}
                      {interviewStage === InterviewStage.AskingQuestion && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Record Button - Always available */}
                          <button 
                            onClick={isRecording ? handleStopRecording : handleStartRecording}
                            className={`w-full py-3 px-4 rounded-lg font-medium text-base ${
                              isRecording 
                                ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                                : 'bg-red-500 hover:bg-red-600'
                            } text-white`}
                          >
                            {isRecording ? '⏹️ Stop Recording' : '🎤 Record Answer'}
                          </button>
                          
                          {/* Submit Button - Always available */}
                          <button 
                            onClick={handleManualSubmit}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium text-base"
                          >
                            ✅ Submit & Continue
                          </button>
                        </div>
                      )}
                      
                      {/* Loading state for feedback generation */}
                      {interviewStage === InterviewStage.GeneratingFeedback && (
                        <div className="text-center space-y-4">
                          <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-100 rounded-lg">
                            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            <span className="text-blue-800 font-medium">Analyzing Your Answers...</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Restart button after feedback */}
                      {interviewStage === InterviewStage.ShowingFeedback && (
                        <button 
                          onClick={resetVideoInterview}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium text-base"
                        >
                          🔄 Start New Interview
                        </button>
                      )}
                    </div>
                </div>
                
                {/* Progress Indicator */}
                {videoUserAnswers.length > 0 && interviewStage !== InterviewStage.NotStarted && interviewStage !== InterviewStage.ShowingFeedback && (
                  <div className="text-center mt-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm">
                      <div className="flex gap-1">
                          {Array.from({ length: Math.max(currentQuestionIndex + 2, 8) }, (_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < currentQuestionIndex 
                                ? 'bg-green-500' 
                                : i === currentQuestionIndex 
                                ? 'bg-primary' 
                                : 'bg-muted-foreground/20'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-muted-foreground">
                          Question {currentQuestionIndex + 1} • Dynamic based on your profile
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewChat;
