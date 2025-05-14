"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  CopyIcon,
  SlackIcon,
  AlertCircleIcon,
  LightbulbIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StandupData } from "@/lib/types";
import { formatStandupForSlack } from "@/lib/slack";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StandupSummaryProps {
  data: StandupData;
}

export default function StandupSummary({ data }: StandupSummaryProps) {
  const { toast } = useToast();
  const [slackLoading, setSlackLoading] = useState(false);

  const copyToClipboard = () => {
    const text = `
🔹 What I did yesterday:
${data.yesterday.map((item) => `- ${item}`).join("\n")}

🔹 What I'm doing today:
${data.today.map((item) => `- ${item}`).join("\n")}

🔹 Blockers:
${
  data.blockers.length > 0
    ? data.blockers.map((item) => `- ${item}`).join("\n")
    : "- No blockers"
}
    `.trim();

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Your standup summary has been copied to clipboard.",
        });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Copy failed",
          description: "Failed to copy to clipboard. Please try again.",
          variant: "destructive",
        });
      });
  };

  const sendToSlack = async () => {
    setSlackLoading(true);

    try {
      // Simulate sending to Slack
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Sent to Slack",
        description: "Your standup summary has been sent to Slack.",
      });
    } catch (error) {
      toast({
        title: "Failed to send",
        description: "There was an error sending to Slack. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setSlackLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="gap-2"
        >
          <CopyIcon className="h-4 w-4" />
          Copy
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={sendToSlack}
          disabled={slackLoading}
          className="gap-2"
        >
          <SlackIcon className="h-4 w-4" />
          {slackLoading ? "Sending..." : "Send to Slack"}
        </Button>
      </div>

      <Card className="border-l-4 border-l-emerald-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2Icon className="h-5 w-5 text-emerald-500" />
            Completed Yesterday
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[120px] pr-4">
            {data.yesterday.length > 0 ? (
              <ul className="space-y-2">
                {data.yesterday.map((item, index) => (
                  <li
                    key={`yesterday-${index}`}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="rounded-full bg-emerald-500/10 p-1 mt-0.5">
                      <CheckCircle2Icon className="h-3 w-3 text-emerald-500" />
                    </span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic text-sm">
                No items completed yesterday.
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClockIcon className="h-5 w-5 text-blue-500" />
            Planned for Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[120px] pr-4">
            {data.today.length > 0 ? (
              <ul className="space-y-2">
                {data.today.map((item, index) => (
                  <li
                    key={`today-${index}`}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="rounded-full bg-blue-500/10 p-1 mt-0.5">
                      <ClockIcon className="h-3 w-3 text-blue-500" />
                    </span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic text-sm">
                No items planned for today.
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircleIcon className="h-5 w-5 text-red-500" />
            Blockers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[120px] pr-4">
            {data.blockers.length > 0 ? (
              <ul className="space-y-2">
                {data.blockers.map((item, index) => (
                  <li
                    key={`blocker-${index}`}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="rounded-full bg-red-500/10 p-1 mt-0.5">
                      <XCircleIcon className="h-3 w-3 text-red-500" />
                    </span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic text-sm">
                No blockers reported.
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <LightbulbIcon className="h-5 w-5 text-amber-500" />
            Key Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.keywords.map((keyword, index) => (
              <Badge
                key={`keyword-${index}`}
                variant="secondary"
                className="text-sm"
              >
                {keyword.text}
                <span className="ml-1 text-muted-foreground">
                  ({keyword.value})
                </span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
