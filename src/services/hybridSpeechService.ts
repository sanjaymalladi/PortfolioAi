// Hybrid Speech Recognition Service
// Intelligently chooses between AssemblyAI and Web Speech API

import { getAssemblyAISpeechRecognition, checkAssemblyAISupport, type AssemblyAISpeechResult } from './assemblyAISpeechService';
import { transcribeAudio } from './geminiService';

export type SpeechProvider = 'auto' | 'assemblyai' | 'webspeech' | 'gemini';

export interface SpeechResult {
  transcript: string;
  confidence?: number;
  provider: string;
  error?: string;
}

export interface HybridSpeechResult {
  success: boolean;
  text: string;
  confidence?: number;
  isFinal?: boolean;
  provider: 'assemblyai' | 'webspeech' | 'gemini' | 'none';
}

export interface HybridSpeechOptions {
  language?: string;
  preferWebSpeech?: boolean; // Force Web Speech API if available
  fallbackToWebSpeech?: boolean; // Use Web Speech if AssemblyAI fails
}

export class HybridSpeechRecognition {
  private activeProvider: 'assemblyai' | 'webspeech' | 'gemini' | 'none' = 'none';
  private isRecording = false;
  private onResultCallback?: (result: HybridSpeechResult) => void;
  private onErrorCallback?: (error: string) => void;
  private onEndCallback?: () => void;
  private options: HybridSpeechOptions;
  private currentProvider: SpeechProvider = 'auto';
  private isListening = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor(options: HybridSpeechOptions = {}) {
    this.options = {
      language: 'en-US',
      preferWebSpeech: false,
      fallbackToWebSpeech: false, // Disable fallbacks since other providers aren't working
      ...options
    };
    this.currentProvider = 'gemini'; // Default to Gemini
  }

  // Check what speech recognition options are available
  async checkProviderAvailability(): Promise<{
    assemblyAI: boolean;
    webSpeech: boolean;
    gemini: boolean;
    recommended: 'assemblyai' | 'webspeech' | 'gemini' | 'none';
    details: string;
  }> {
    // Check Gemini (it's available if API key is configured)
    const geminiAvailable = !!import.meta.env.VITE_GEMINI_API_KEY;

    let recommended: 'assemblyai' | 'webspeech' | 'gemini' | 'none' = 'none';
    let details = '';

    if (geminiAvailable) {
      recommended = 'gemini';
      details = 'Gemini Audio (record and transcribe)';
    } else {
      details = 'No speech recognition available - Gemini API key required';
    }

    return {
      assemblyAI: false, // Disabled since not working
      webSpeech: false, // Disabled since not working
      gemini: geminiAvailable,
      recommended,
      details
    };
  }

  async initialize(): Promise<void> {
    const availability = await this.checkProviderAvailability();
    
    if (availability.recommended === 'none') {
      throw new Error('Gemini API key required for speech recognition. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }

    // Always use Gemini since it's the only working provider
    this.activeProvider = 'gemini';

    console.log(`🎤 Initialized speech recognition: ${availability.details}`);
  }

  onResult(callback: (result: HybridSpeechResult) => void): void {
    this.onResultCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  async start(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Already recording');
    }

    if (!this.activeProvider || this.activeProvider === 'none') {
      await this.initialize();
    }

    this.isRecording = true;

    // Always use Gemini since it's the only working provider
    if (this.activeProvider === 'gemini') {
      await this.startGeminiRecording();
    } else {
      throw new Error('Only Gemini speech recognition is available. Please ensure VITE_GEMINI_API_KEY is configured.');
    }
  }

  private async startGeminiRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const base64Audio = await this.blobToBase64(audioBlob);
          
          // Remove data URL prefix to get just the base64 data
          const base64Data = base64Audio.split(',')[1];
          
          const transcript = await transcribeAudio(base64Data, 'audio/webm');
          
          this.onResultCallback?.({
            success: true,
            text: transcript.trim(),
            confidence: 0.9, // Gemini doesn't provide confidence scores
            isFinal: true,
            provider: 'gemini'
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Gemini transcription failed';
          this.onErrorCallback?.(errorMessage);
        }
      };

      this.mediaRecorder.start();
      console.log('🎤 Started Gemini audio recording...');
      
    } catch (error) {
      throw new Error(`Failed to start Gemini recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  stop(): void {
    if (!this.isRecording) {
      return;
    }

    // Only handle Gemini since it's the only working provider
    if (this.activeProvider === 'gemini') {
      this.mediaRecorder?.stop();
    }

    this.isRecording = false;
  }

  cleanup(): void {
    this.stop();
    
    this.onResultCallback = undefined;
    this.onErrorCallback = undefined;
    this.onEndCallback = undefined;
  }

  // Get current provider info
  getCurrentProvider(): {
    provider: 'assemblyai' | 'webspeech' | 'gemini' | 'none';
    isRecording: boolean;
    features: string[];
  } {
    const features: string[] = [];
    
    // Only show Gemini features since it's the only working provider
    if (this.activeProvider === 'gemini') {
      features.push('High-quality transcription', 'Multimodal AI', 'Record and transcribe');
    }

    return {
      provider: this.activeProvider,
      isRecording: this.isRecording,
      features
    };
  }

  setProvider(provider: SpeechProvider) {
    this.currentProvider = provider;
  }

  async startListening(
    onResult: (result: SpeechResult) => void,
    onError: (error: string) => void
  ): Promise<void> {
    if (this.isListening) {
      return;
    }

    this.isListening = true;

    // Always use Gemini since other providers aren't working
    try {
      await this.startGeminiRecording();
    } catch (error) {
      this.isListening = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError(`Failed to start Gemini speech recognition: ${errorMessage}`);
    }
  }

  stopListening(): void {
    if (!this.isListening) {
      return;
    }

    this.isListening = false;

    // Stop MediaRecorder (for Gemini)
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      // Stop all tracks to release microphone
      if (this.mediaRecorder.stream) {
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    }

    console.log('🛑 Stopped listening');
  }
}

// Factory function
export function getHybridSpeechRecognition(options?: HybridSpeechOptions): HybridSpeechRecognition {
  return new HybridSpeechRecognition(options);
}

// Support check function
export async function checkHybridSpeechSupport(): Promise<{
  isSupported: boolean;
  supportInfo: string;
  recommendations: string[];
  providers: {
    assemblyAI: boolean;
    webSpeech: boolean;
    gemini: boolean;
  };
}> {
  const hybridRecognition = new HybridSpeechRecognition();
  const availability = await hybridRecognition.checkProviderAvailability();
  
  const recommendations: string[] = [];
  let isSupported = availability.gemini;
  
  if (!isSupported) {
    recommendations.push('Use Chrome, Firefox, Safari, or Edge browser');
    recommendations.push('Enable microphone permissions');
    recommendations.push('Ensure HTTPS connection');
    recommendations.push('Add Gemini API key for professional features');
  } else {
    if (!availability.gemini) {
      recommendations.push('Use a compatible browser for Gemini Audio support');
    }
  }

  return {
    isSupported,
    supportInfo: availability.details,
    recommendations,
    providers: {
      assemblyAI: false,
      webSpeech: false,
      gemini: availability.gemini
    }
  };
}

// Type declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
} 