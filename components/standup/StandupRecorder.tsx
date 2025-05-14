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
import { Wand2Icon, RotateCcwIcon } from "lucide-react";
import { StandupData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Record Your Update</CardTitle>
          <CardDescription>
            Click the microphone to start recording your standup update. When
            finished, click again to stop and analyze.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <AudioRecorder
              onTranscriptUpdate={handleTranscriptUpdate}
              onRecordingStateChange={handleRecordingStateChange}
              disabled={isAnalyzing}
            />

            {transcript && !isRecording && (
              <div className="w-full mt-4">
                <h3 className="font-medium mb-2">Transcript:</h3>
                <div className="p-4 bg-muted rounded-md text-sm h-32 overflow-auto">
                  {transcript}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={resetRecording}
                    disabled={isAnalyzing}
                  >
                    <RotateCcwIcon className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <Button
                    onClick={analyzeStandup}
                    disabled={isAnalyzing || isRecording || !transcript.trim()}
                  >
                    <Wand2Icon className="mr-2 h-4 w-4" />
                    {isAnalyzing ? "Analyzing..." : "Analyze"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {summary && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="visualization">Word Cloud</TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="mt-4">
            <StandupSummary data={summary} />
          </TabsContent>
          <TabsContent value="visualization" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Key Topics</CardTitle>
                <CardDescription>
                  Visualization of the most frequently mentioned topics in your
                  standup.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <div className="word-cloud-placeholder h-64 w-full flex items-center justify-center">
                  <p className="text-muted-foreground text-center">
                    Word cloud visualization would appear here, showing key
                    terms like:
                    <br />
                    {summary.keywords.map((k) => k.text).join(", ")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
