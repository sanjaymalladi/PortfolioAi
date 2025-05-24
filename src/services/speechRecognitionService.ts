// Enhanced Speech Recognition Service with multiple fallback options
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export class EnhancedSpeechRecognition {
  private recognition: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private config: SpeechRecognitionConfig;
  private onResultCallback?: (result: SpeechRecognitionResult) => void;
  private onErrorCallback?: (error: string) => void;
  private onEndCallback?: () => void;

  constructor(config: SpeechRecognitionConfig = {}) {
    this.config = {
      language: 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 1,
      ...config
    };
  }

  // Check if any speech recognition is available
  public isSupported(): boolean {
    return this.isWebSpeechSupported() || this.isMediaRecorderSupported();
  }

  // Check Web Speech API support
  private isWebSpeechSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  // Check MediaRecorder API support
  private isMediaRecorderSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  }

  // Initialize the best available recognition method
  public async initialize(): Promise<void> {
    if (this.isWebSpeechSupported()) {
      this.initializeWebSpeech();
    } else if (this.isMediaRecorderSupported()) {
      await this.initializeMediaRecorder();
    } else {
      throw new Error('No speech recognition method is supported in this browser');
    }
  }

  // Initialize Web Speech API
  private initializeWebSpeech(): void {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.lang = this.config.language;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    this.recognition.onresult = (event: any) => {
      console.log('Speech recognition results received:', event.results.length);
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0.5;
        
        console.log('Transcript:', transcript, 'isFinal:', result.isFinal);
        
        if (this.onResultCallback) {
          this.onResultCallback({
            transcript,
            confidence,
            isFinal: result.isFinal
          });
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Speech recognition error';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not accessible. Please check permissions.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not allowed.';
          break;
        case 'aborted':
          // Don't show error for intentional aborts
          console.log('Speech recognition was aborted');
          return;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      this.isRecording = false;
      
      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessage);
      }
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      this.isRecording = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };
  }

  // Initialize MediaRecorder as fallback
  private async initializeMediaRecorder(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.getSupportedMimeType()
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioChunks = [];
        
        // Provide immediate feedback to user about Firefox limitation
        if (this.onResultCallback) {
          this.onResultCallback({
            transcript: '[Firefox Browser Detected] Audio has been recorded but automatic transcription is not available. For the best experience with automatic speech-to-text, please use Chrome, Edge, or Safari. You can manually type your answer below.',
            confidence: 0.5,
            isFinal: true
          });
        }
        
        this.isRecording = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };

      this.mediaRecorder.onerror = (event) => {
        if (this.onErrorCallback) {
          this.onErrorCallback('Audio recording error. For speech recognition, please use Chrome, Edge, or Safari browsers.');
        }
      };
    } catch (error) {
      throw new Error('Failed to initialize audio recording. Please ensure microphone permissions are granted and try using Chrome, Edge, or Safari for the best experience.');
    }
  }

  // Get supported MIME type for MediaRecorder
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return 'audio/webm'; // fallback
  }

  // Start recording
  public async start(): Promise<void> {
    if (this.isRecording) {
      return;
    }

    if (!this.recognition && !this.mediaRecorder) {
      await this.initialize();
    }

    this.isRecording = true;

    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (error) {
        this.isRecording = false;
        throw new Error('Failed to start Web Speech Recognition: ' + error);
      }
    } else if (this.mediaRecorder) {
      try {
        this.audioChunks = [];
        this.mediaRecorder.start(1000); // Record in 1-second chunks
      } catch (error) {
        this.isRecording = false;
        throw new Error('Failed to start MediaRecorder: ' + error);
      }
    }
  }

  // Stop recording
  public stop(): void {
    if (!this.isRecording) {
      return;
    }

    if (this.recognition) {
      this.recognition.stop();
    } else if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  // Abort recording
  public abort(): void {
    if (this.recognition) {
      this.recognition.abort();
    } else if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.isRecording = false;
  }

  // Set event callbacks
  public onResult(callback: (result: SpeechRecognitionResult) => void): void {
    this.onResultCallback = callback;
  }

  public onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  public onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  // Get current recording state
  public getIsRecording(): boolean {
    return this.isRecording;
  }

  // Get browser compatibility info
  public getBrowserSupport(): {
    webSpeech: boolean;
    mediaRecorder: boolean;
    recommended: string;
  } {
    const webSpeech = this.isWebSpeechSupported();
    const mediaRecorder = this.isMediaRecorderSupported();
    
    let recommended = 'None available';
    if (webSpeech) {
      recommended = 'Web Speech API (Full support)';
    } else if (mediaRecorder) {
      recommended = 'MediaRecorder API (Manual transcription)';
    }

    return {
      webSpeech,
      mediaRecorder,
      recommended
    };
  }
}

// Global speech recognition instance
let globalSpeechRecognition: EnhancedSpeechRecognition | null = null;

// Factory function to get speech recognition instance
export function getSpeechRecognition(config?: SpeechRecognitionConfig): EnhancedSpeechRecognition {
  if (!globalSpeechRecognition) {
    globalSpeechRecognition = new EnhancedSpeechRecognition(config);
  }
  return globalSpeechRecognition;
}

// Utility function to check browser support
export function checkSpeechRecognitionSupport(): {
  isSupported: boolean;
  supportInfo: string;
  recommendations: string[];
} {
  const recognition = new EnhancedSpeechRecognition();
  const support = recognition.getBrowserSupport();
  
  const recommendations = [];
  
  if (!support.webSpeech && !support.mediaRecorder) {
    recommendations.push('Use Chrome, Edge, or Safari for best speech recognition support');
    recommendations.push('Ensure microphone permissions are granted');
    recommendations.push('Check that you\'re using HTTPS (required for microphone access)');
  } else if (!support.webSpeech && support.mediaRecorder) {
    recommendations.push('Firefox detected: Audio recording works but automatic speech-to-text is not available');
    recommendations.push('For automatic transcription, switch to Chrome, Edge, or Safari');
    recommendations.push('You can still record audio and manually type your responses');
  }

  // Detect if user is on Firefox specifically
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
  if (isFirefox && !support.webSpeech) {
    recommendations.push('Firefox has limited speech recognition support - consider using Chrome or Edge for better experience');
  }

  return {
    isSupported: recognition.isSupported(),
    supportInfo: support.recommended,
    recommendations
  };
}

// Type declarations for global scope
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}