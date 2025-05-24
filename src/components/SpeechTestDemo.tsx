import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, StopCircle } from 'lucide-react';
import { getHybridSpeechRecognition, checkHybridSpeechSupport, type HybridSpeechResult } from '../services/hybridSpeechService';
import { useToast } from '@/hooks/use-toast';

const SpeechTestDemo: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [provider, setProvider] = useState<'auto' | 'assemblyai' | 'webspeech'>('auto');
  const [providerInfo, setProviderInfo] = useState<any>(null);
  const [supportInfo, setSupportInfo] = useState<any>(null);
  const speechRef = useRef<any>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const checkSupport = async () => {
      const info = await checkHybridSpeechSupport();
      setSupportInfo(info);
    };
    checkSupport();
  }, []);

  const initializeSpeech = async () => {
    try {
      speechRef.current = getHybridSpeechRecognition({
        language: 'en-US',
        preferWebSpeech: provider === 'webspeech',
        fallbackToWebSpeech: provider !== 'assemblyai'
      });

      await speechRef.current.initialize();
      
      const info = speechRef.current.getCurrentProvider();
      setProviderInfo(info);

      speechRef.current.onResult((result: HybridSpeechResult) => {
        if (result.success && result.text) {
          setTranscript(prev => prev + ' ' + result.text);
          toast({
            title: `✅ Speech Detected (${result.provider})`,
            description: result.text,
            duration: 2000
          });
        }
      });

      speechRef.current.onError((error: string) => {
        toast({
          title: "❌ Speech Error",
          description: error,
          variant: "destructive",
          duration: 3000
        });
        setIsRecording(false);
      });

      speechRef.current.onEnd(() => {
        setIsRecording(false);
      });

    } catch (error: any) {
      toast({
        title: "❌ Initialization Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const startRecording = async () => {
    if (!speechRef.current) {
      await initializeSpeech();
    }
    
    try {
      await speechRef.current.start();
      setIsRecording(true);
    } catch (error: any) {
      toast({
        title: "❌ Recording Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (speechRef.current) {
      speechRef.current.stop();
    }
    setIsRecording(false);
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🎤 Hybrid Speech Recognition Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Support Info */}
          {supportInfo && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">System Support Status:</h3>
              <div className="space-y-2">
                <p className="text-sm">{supportInfo.supportInfo}</p>
                <div className="flex gap-2">
                  <Badge variant={supportInfo.providers.assemblyAI ? "default" : "secondary"}>
                    AssemblyAI: {supportInfo.providers.assemblyAI ? "✅ Available" : "❌ Not Available"}
                  </Badge>
                  <Badge variant={supportInfo.providers.webSpeech ? "default" : "secondary"}>
                    Web Speech: {supportInfo.providers.webSpeech ? "✅ Available" : "❌ Not Available"}
                  </Badge>
                </div>
                {supportInfo.recommendations.length > 0 && (
                  <div className="text-xs text-gray-600">
                    <strong>Recommendations:</strong> {supportInfo.recommendations.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Provider Selection */}
          <div className="space-y-3">
            <h3 className="font-medium">Choose Provider:</h3>
            <div className="flex gap-2">
              <Button
                variant={provider === 'auto' ? 'default' : 'outline'}
                onClick={() => setProvider('auto')}
                size="sm"
              >
                Auto
              </Button>
              <Button
                variant={provider === 'assemblyai' ? 'default' : 'outline'}
                onClick={() => setProvider('assemblyai')}
                size="sm"
              >
                AssemblyAI
              </Button>
              <Button
                variant={provider === 'webspeech' ? 'default' : 'outline'}
                onClick={() => setProvider('webspeech')}
                size="sm"
              >
                Web Speech
              </Button>
            </div>
          </div>

          {/* Current Provider Info */}
          {providerInfo && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="capitalize">
                  Active: {providerInfo.provider === 'assemblyai' ? 'AssemblyAI' : 
                          providerInfo.provider === 'webspeech' ? 'Web Speech' : 'None'}
                </Badge>
                <span className="text-sm text-gray-600">
                  {providerInfo.features.join(' • ')}
                </span>
              </div>
            </div>
          )}

          {/* Recording Controls */}
          <div className="flex gap-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={isRecording ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              disabled={!supportInfo?.isSupported}
            >
              {isRecording ? (
                <>
                  <StopCircle className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
            <Button onClick={clearTranscript} variant="outline">
              Clear Transcript
            </Button>
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="font-medium">Recording... Speak now!</span>
            </div>
          )}

          {/* Transcript Display */}
          <div className="space-y-2">
            <h3 className="font-medium">Transcript:</h3>
            <div className="min-h-[120px] p-4 border rounded-lg bg-gray-50">
              {transcript || (
                <span className="text-gray-500 italic">
                  {!supportInfo?.isSupported 
                    ? "Speech recognition not supported in this environment"
                    : "Click 'Start Recording' and speak to see transcript here..."}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-600">
              Characters: {transcript.length}
            </div>
          </div>

          {/* Test Instructions */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">🧪 Testing Instructions:</h4>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Try different providers to compare accuracy and speed</li>
              <li>Test with various speech patterns (fast, slow, with accents)</li>
              <li>Check how each provider handles background noise</li>
              <li>Compare real-time vs final transcription results</li>
              <li>Test fallback behavior when AssemblyAI is unavailable</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeechTestDemo; 