// Backend Speech Recognition Service using Faster Whisper API
export interface BackendSpeechResult {
  text: string;
  confidence: number;
  duration: number;
  language: string;
  success: boolean;
}

export interface SpeechRecognitionConfig {
  language?: string;
  apiUrl?: string;
  chunkSize?: number; // Size of audio chunks in milliseconds
}

export class BackendSpeechRecognition {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private config: SpeechRecognitionConfig;
  private onResultCallback?: (result: BackendSpeechResult) => void;
  private onErrorCallback?: (error: string) => void;
  private onEndCallback?: () => void;
  private stream: MediaStream | null = null;
  private recordingTimer: number | null = null;
  private isInitialized = false;

  constructor(config: SpeechRecognitionConfig = {}) {
    this.config = {
      language: 'en',
      apiUrl: 'http://localhost:8000/api/v1/speech',
      chunkSize: 2000, // 2 seconds for faster processing
      ...config
    };
  }

  // Check if backend speech recognition is available
  public async isSupported(): Promise<boolean> {
    try {
      // Check if we can access microphone
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      // Check if backend is available
      const response = await fetch(`${this.config.apiUrl}/model-info`);
      return response.ok;
    } catch (error) {
      console.error('Backend speech service not available:', error);
      return false;
    }
  }

  // Initialize the service
  public async initialize(): Promise<void> {
    try {
      console.log('Initializing backend speech service...');
      console.log('Connecting to:', `${this.config.apiUrl}/model-info`);
      
      // Test backend connectivity
      const response = await fetch(`${this.config.apiUrl}/model-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Backend response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Backend not accessible: ${response.status} ${response.statusText}. Response: ${errorText}`);
      }
      
      const modelInfo = await response.json();
      console.log('Backend connected successfully! Model info:', modelInfo);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize backend speech service:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Cannot connect to backend server. Please ensure the backend is running on http://localhost:8000. Original error: ${error.message}`);
      }
      
      throw new Error(`Backend speech service unavailable. Please start the backend server on port 8000. Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Start recording and transcribing
  public async start(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Speech recognition not initialized. Call initialize() first.');
    }
    
    if (this.isRecording) {
      return; // Already recording
    }

    try {
      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];
      this.isRecording = true;

      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      });

      this.mediaRecorder.addEventListener('stop', async () => {
        if (this.audioChunks.length > 0) {
          await this.processAudioChunks();
        }
      });

      this.mediaRecorder.start();
      
      // Set up chunk recording timer
      this.recordingTimer = setInterval(() => {
        if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
          setTimeout(() => {
            if (this.isRecording && this.mediaRecorder) {
              this.mediaRecorder.start();
            }
          }, 100);
        }
      }, this.config.chunkSize) as any;

      console.log('Backend speech recognition started');
    } catch (error) {
      this.isRecording = false;
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Microphone access denied. Please allow microphone access and try again.');
        } else if (error.name === 'NotFoundError') {
          throw new Error('No microphone found. Please connect a microphone and try again.');
        } else if (error.name === 'OverconstrainedError') {
          throw new Error('Microphone constraints not supported. Please try with a different microphone.');
        }
      }
      
      throw new Error(`Failed to start recording: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Stop recording
  public stop(): void {
    if (!this.isRecording) {
      return;
    }

    this.isRecording = false;

    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    console.log('Backend speech recognition stopped');
  }

  // Process recorded audio chunks
  private async processAudioChunks(): Promise<void> {
    try {
      if (this.audioChunks.length === 0) {
        if (this.onErrorCallback) {
          this.onErrorCallback('No audio recorded');
        }
        return;
      }

      // Create audio blob
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      
      // Send to backend for transcription
      const result = await this.transcribeWithBackend(audioBlob);
      
      if (this.onResultCallback) {
        this.onResultCallback(result);
      }

    } catch (error) {
      console.error('Error processing audio:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(`Transcription failed: ${error}`);
      }
    } finally {
      this.audioChunks = [];
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    }
  }

  // Send audio to backend for transcription
  private async transcribeWithBackend(audioBlob: Blob): Promise<BackendSpeechResult> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('language', this.config.language || 'en');

      const response = await fetch(`${this.config.apiUrl}/transcribe-live`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Transcription failed');
      }

      const data = await response.json();
      
      return {
        text: data.text || '',
        confidence: data.confidence || 0.0,
        duration: data.duration || 0.0,
        language: data.language || this.config.language || 'en',
        success: data.success || false
      };

    } catch (error) {
      console.error('Backend transcription error:', error);
      throw new Error(`Backend transcription failed: ${error}`);
    }
  }

  // Get supported audio MIME type
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

  // Abort recording
  public abort(): void {
    this.isRecording = false;
    
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }

    this.audioChunks = [];
  }

  // Set event callbacks
  public onResult(callback: (result: BackendSpeechResult) => void): void {
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

  // Cleanup resources
  public cleanup(): void {
    this.abort();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}

// Global backend speech recognition instance
let globalBackendSpeechRecognition: BackendSpeechRecognition | null = null;

// Factory function to get backend speech recognition instance
export function getBackendSpeechRecognition(config?: SpeechRecognitionConfig): BackendSpeechRecognition {
  if (!globalBackendSpeechRecognition) {
    globalBackendSpeechRecognition = new BackendSpeechRecognition(config);
  }
  return globalBackendSpeechRecognition;
}

// Utility function to check backend availability
export async function checkBackendSpeechSupport(): Promise<{
  isSupported: boolean;
  supportInfo: string;
  recommendations: string[];
}> {
  try {
    console.log('Checking backend speech support...');
    const recognition = new BackendSpeechRecognition();
    
    console.log('Testing backend availability...');
    const isSupported = await recognition.isSupported();
    console.log('Backend support check result:', isSupported);
    
    if (isSupported) {
      return {
        isSupported: true,
        supportInfo: 'Backend Faster Whisper (Full support)',
        recommendations: ['Backend speech recognition is available and ready to use!']
      };
    } else {
      return {
        isSupported: false,
        supportInfo: 'Backend service unavailable',
        recommendations: [
          'Start the backend server (python start.py)',
          'Check backend URL configuration',
          'Ensure microphone permissions are granted'
        ]
      };
    }
  } catch (error) {
    console.error('Backend speech support check failed:', error);
    return {
      isSupported: false,
      supportInfo: 'Backend connection failed',
      recommendations: [
        'Start the backend server: cd backend && python simple_test.py',
        'Check if backend is running on http://localhost:8000',
        'Verify CORS configuration allows frontend domain',
        `Error details: ${error instanceof Error ? error.message : String(error)}`
      ]
    };
  }
} 