import { AssemblyAI } from 'assemblyai';

// Get API key from environment variables
const ASSEMBLYAI_API_KEY = import.meta.env.VITE_ASSEMBLYAI_API_KEY;

export interface AssemblyAISpeechResult {
  success: boolean;
  text: string;
  confidence?: number;
  isFinal?: boolean;
}

export interface AssemblyAISpeechOptions {
  language?: string;
  sampleRate?: number;
  wordBoost?: string[];
}

export class AssemblyAISpeechRecognition {
  private assemblyAI: AssemblyAI;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private onResultCallback?: (result: AssemblyAISpeechResult) => void;
  private onErrorCallback?: (error: string) => void;
  private onEndCallback?: () => void;
  private options: AssemblyAISpeechOptions;

  constructor(options: AssemblyAISpeechOptions = {}) {
    if (!ASSEMBLYAI_API_KEY) {
      throw new Error('AssemblyAI API key not found in environment variables');
    }
    
    this.assemblyAI = new AssemblyAI({
      apiKey: ASSEMBLYAI_API_KEY
    });
    
    this.options = {
      language: 'en',
      sampleRate: 16000,
      ...options
    };
  }

  async initialize(): Promise<void> {
    try {
      // Test API connection
      const response = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'GET',
        headers: {
          'Authorization': ASSEMBLYAI_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect to AssemblyAI API');
      }
      
      console.log('AssemblyAI service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AssemblyAI:', error);
      throw error;
    }
  }

  onResult(callback: (result: AssemblyAISpeechResult) => void): void {
    this.onResultCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  async start(): Promise<void> {
    try {
      if (this.isRecording) {
        throw new Error('Already recording');
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: this.options.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Set up MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        try {
          await this.processAudioChunks();
        } catch (error) {
          console.error('Error processing audio:', error);
          this.onErrorCallback?.('Failed to process audio recording');
        }
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        this.isRecording = false;
        this.onEndCallback?.();
      };

      // Start recording with time slices for real-time processing
      this.mediaRecorder.start(3000); // Record in 3-second chunks
      
      console.log('AssemblyAI recording started');

    } catch (error) {
      console.error('Error starting AssemblyAI recording:', error);
      this.isRecording = false;
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          this.onErrorCallback?.('Microphone access denied. Please allow microphone access and try again.');
        } else if (error.name === 'NotFoundError') {
          this.onErrorCallback?.('No microphone found. Please check your microphone connection.');
        } else {
          this.onErrorCallback?.(error.message);
        }
      } else {
        this.onErrorCallback?.('Unknown error occurred while starting recording');
      }
      
      throw error;
    }
  }

  stop(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
  }

  private async processAudioChunks(): Promise<void> {
    if (this.audioChunks.length === 0) {
      this.onResultCallback?.({
        success: false,
        text: '',
        confidence: 0
      });
      return;
    }

    try {
      // Combine audio chunks into a single blob
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      
      // Convert to ArrayBuffer for AssemblyAI
      const audioData = await audioBlob.arrayBuffer();
      
      // Upload audio to AssemblyAI
      const uploadUrl = await this.assemblyAI.files.upload(audioData);
      
      // Create transcription request
      const transcriptRequest = {
        audio_url: uploadUrl,
        language_code: this.options.language,
        word_boost: this.options.wordBoost,
        punctuate: true,
        format_text: true,
        auto_highlights: false
      };

      // Start transcription
      const transcript = await this.assemblyAI.transcripts.transcribe(transcriptRequest);
      
      if (transcript.status === 'error') {
        throw new Error(transcript.error || 'Transcription failed');
      }

      // Process result
      if (transcript.text && transcript.text.trim().length > 0) {
        this.onResultCallback?.({
          success: true,
          text: transcript.text.trim(),
          confidence: transcript.confidence || 0.9,
          isFinal: true
        });
      } else {
        this.onResultCallback?.({
          success: false,
          text: '',
          confidence: 0
        });
      }

    } catch (error) {
      console.error('AssemblyAI transcription error:', error);
      
      if (error instanceof Error) {
        this.onErrorCallback?.(error.message);
      } else {
        this.onErrorCallback?.('Failed to transcribe audio');
      }
      
      this.onResultCallback?.({
        success: false,
        text: '',
        confidence: 0
      });
    }
  }

  cleanup(): void {
    if (this.isRecording) {
      this.stop();
    }
    this.audioChunks = [];
    this.onResultCallback = undefined;
    this.onErrorCallback = undefined;
    this.onEndCallback = undefined;
  }
}

// Factory function to create AssemblyAI speech recognition instance
export function getAssemblyAISpeechRecognition(options?: AssemblyAISpeechOptions): AssemblyAISpeechRecognition {
  return new AssemblyAISpeechRecognition(options);
}

// Support check function
export async function checkAssemblyAISupport(): Promise<{
  isSupported: boolean;
  supportInfo: string;
  recommendations: string[];
}> {
  const recommendations: string[] = [];
  let supportInfo = '';
  let isSupported = true;

  // Check API key
  if (!ASSEMBLYAI_API_KEY) {
    isSupported = false;
    supportInfo = 'AssemblyAI API key not configured';
    recommendations.push('Add VITE_ASSEMBLYAI_API_KEY to your .env file');
    return { isSupported, supportInfo, recommendations };
  }

  // Check MediaRecorder support
  if (!window.MediaRecorder) {
    isSupported = false;
    supportInfo = 'MediaRecorder not supported in this browser';
    recommendations.push('Use Chrome, Firefox, or Edge browser');
    return { isSupported, supportInfo, recommendations };
  }

  // Check getUserMedia support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    isSupported = false;
    supportInfo = 'Microphone access not supported';
    recommendations.push('Use HTTPS connection', 'Enable microphone permissions');
    return { isSupported, supportInfo, recommendations };
  }

  supportInfo = 'AssemblyAI speech recognition ready';
  return { isSupported, supportInfo, recommendations };
} 