"use client";

import { useState, useEffect, useRef } from "react";
import { MicIcon, StopCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { initializeSpeechService, startContinuousRecognition } from "@/lib/azure/speechToText";

interface AudioRecorderProps {
  onTranscriptUpdate: (text: string) => void;
  onRecordingStateChange: (recording: boolean) => void;
  disabled?: boolean;
}

export default function AudioRecorder({
  onTranscriptUpdate,
  onRecordingStateChange,
  disabled = false,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stopRecognitionRef = useRef<(() => void) | null>(null);
  const { toast } = useToast();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (stopRecognitionRef.current) {
        stopRecognitionRef.current();
      }
    };
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      mediaStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setHasPermission(false);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record your standup.",
        variant: "destructive",
      });
      return null;
    }
  };

  const setupAudioVisualizer = (stream: MediaStream) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!analyserRef.current || !ctx) return;
      
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height / 2;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "rgba(129, 140, 248, 0.8)");
        gradient.addColorStop(1, "rgba(79, 70, 229, 0.4)");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    draw();
  };

  const startRecording = async () => {
    if (disabled) return;
    
    const stream = await requestMicrophonePermission();
    if (!stream) return;
    
    try {
      await initializeSpeechService(
        process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!,
        process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!
      );

      const stopRecognition = await startContinuousRecognition(
        stream,
        (interimText) => onTranscriptUpdate(interimText),
        (finalText) => onTranscriptUpdate(finalText),
        (error) => {
          console.error("Recognition error:", error);
          toast({
            title: "Recognition error",
            description: "There was an error with speech recognition. Please try again.",
            variant: "destructive",
          });
        }
      );
      
      stopRecognitionRef.current = stopRecognition;
      setupAudioVisualizer(stream);
      setIsRecording(true);
      onRecordingStateChange(true);
      
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording error",
        description: "There was an error starting the recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (stopRecognitionRef.current) {
      stopRecognitionRef.current();
      stopRecognitionRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    
    setIsRecording(false);
    onRecordingStateChange(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={100} 
          className={`rounded-lg transition-opacity duration-300 ${isRecording ? 'opacity-100' : 'opacity-0'}`}
        />
        
        <Button
          size="lg"
          className={`h-24 w-24 rounded-full transition-transform duration-300 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'} ${isRecording ? 'scale-110' : 'scale-100'}`}
          onClick={toggleRecording}
          disabled={disabled || hasPermission === false}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? (
            <StopCircleIcon className="h-12 w-12" />
          ) : (
            <MicIcon className="h-12 w-12" />
          )}
        </Button>
        
        {isRecording && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="text-sm font-medium text-red-500 animate-pulse">
              Recording {formatTime(recordingTime)}
            </span>
          </div>
        )}
      </div>
      
      {isRecording && (
        <div className="w-full max-w-md mt-8">
          <Progress value={Math.min(recordingTime / 120 * 100, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {recordingTime >= 120 ? "Max duration reached" : `Max duration: ${formatTime(120)}`}
          </p>
        </div>
      )}
    </div>
  );
}