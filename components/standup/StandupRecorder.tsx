"use client";

import { useState } from "react";
import AudioRecorder from "./AudioRecorder";
import StandupSummary from "./StandupSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2Icon, RotateCcwIcon, MicIcon } from "lucide-react";
import { StandupData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import WordCloud from "./WordCloud";

export default function StandupRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState<StandupData | null>(null);
  const { toast } = useToast();

  const handleTranscriptUpdate = (text: string) => {
    setTranscript(text);
  };

  const handleRecordingStateChange = (recording: boolean) => {
    setIsRecording(recording);
  };

  const analyzeStandup = async () => {
    if (!transcript.trim()) {
      toast({
        title: "No transcript to analyze",
        description: "Please record some audio first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details || data.error || "Failed to analyze transcript"
        );
      }

      if (!data.result) {
        throw new Error("No analysis result received");
      }

      let parsedResult: StandupData | null = null;
      try {
        parsedResult = JSON.parse(data.result);
      } catch (e) {
        console.error("Failed to parse analysis result:", e);
        toast({
          title: "Analysis format error",
          description:
            "The analysis result could not be parsed. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setSummary(parsedResult);

      // Save to local storage
      const savedStandups = JSON.parse(
        localStorage.getItem("standups") || "[]"
      );
      savedStandups.push({
        date: new Date().toISOString(),
        transcript,
        summary: parsedResult,
      });
      localStorage.setItem("standups", JSON.stringify(savedStandups));

      toast({
        title: "Analysis complete",
        description: "Your standup has been successfully analyzed.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description:
          error instanceof Error
            ? error.message
            : "There was an error analyzing your standup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetRecording = () => {
    setTranscript("");
    setSummary(null);
  };

  return (
    <div className="space-y-8">
      <Card className="border-l-4 border-l-indigo-500 shadow-lg">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Record Your Update
              </CardTitle>
              <CardDescription className="text-base">
                Click the microphone to start recording your standup update.
                When finished, click again to stop and analyze.
              </CardDescription>
            </div>
            {isRecording && (
              <Badge
                variant="destructive"
                className="animate-pulse px-4 py-1.5 text-sm"
              >
                Recording...
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-8">
            <div className="relative w-full">
              <AudioRecorder
                onTranscriptUpdate={handleTranscriptUpdate}
                onRecordingStateChange={handleRecordingStateChange}
                disabled={isAnalyzing}
              />
            </div>

            {transcript && !isRecording && (
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">Transcript</h3>
                    <p className="text-sm text-muted-foreground">
                      Review your recorded update before analysis
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetRecording}
                      disabled={isAnalyzing}
                      className="gap-2"
                    >
                      <RotateCcwIcon className="h-4 w-4" />
                      Reset
                    </Button>
                    <Button
                      onClick={analyzeStandup}
                      disabled={
                        isAnalyzing || isRecording || !transcript.trim()
                      }
                      className="gap-2"
                    >
                      <Wand2Icon className="h-4 w-4" />
                      {isAnalyzing ? "Analyzing..." : "Analyze"}
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-40 rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {transcript}
                  </p>
                </ScrollArea>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {summary && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
            <TabsTrigger
              value="summary"
              className="data-[state=active]:bg-background"
            >
              Summary
            </TabsTrigger>
            <TabsTrigger
              value="visualization"
              className="data-[state=active]:bg-background"
            >
              Word Cloud
            </TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="mt-6">
            <StandupSummary data={summary} />
          </TabsContent>
          <TabsContent value="visualization" className="mt-6">
            <WordCloud keywords={summary.keywords} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
