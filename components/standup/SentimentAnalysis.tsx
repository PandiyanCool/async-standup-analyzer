"use client";

import { SentimentAnalysis as SentimentAnalysisType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThumbsUpIcon, ThumbsDownIcon, MinusIcon } from "lucide-react";

interface SentimentAnalysisProps {
  sentiment?: SentimentAnalysisType;
}

export default function SentimentAnalysis({
  sentiment,
}: SentimentAnalysisProps) {
  if (!sentiment) {
    return null;
  }

  const getSentimentIcon = () => {
    switch (sentiment.overall) {
      case "positive":
        return <ThumbsUpIcon className="h-5 w-5 text-green-500" />;
      case "negative":
        return <ThumbsDownIcon className="h-5 w-5 text-red-500" />;
      default:
        return <MinusIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSentimentColor = () => {
    switch (sentiment.overall) {
      case "positive":
        return "text-green-500";
      case "negative":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getProgressColor = () => {
    if (sentiment.score > 0.3) return "bg-green-500";
    if (sentiment.score < -0.3) return "bg-red-500";
    return "bg-gray-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getSentimentIcon()}
          <span>Sentiment Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={getSentimentColor()}>
              Overall:{" "}
              {sentiment.overall.charAt(0).toUpperCase() +
                sentiment.overall.slice(1)}
            </span>
            <span className="text-muted-foreground">
              Score: {sentiment.score.toFixed(2)}
            </span>
          </div>
          <Progress
            value={((sentiment.score + 1) / 2) * 100}
            className={`h-2 ${getProgressColor()}`}
          />
        </div>

        {sentiment.highlights.positive.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-500">
              Positive Highlights
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {sentiment.highlights.positive.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
        )}

        {sentiment.highlights.negative.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-500">
              Areas of Concern
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {sentiment.highlights.negative.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
