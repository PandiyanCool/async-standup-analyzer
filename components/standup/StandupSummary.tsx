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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StandupData } from "@/lib/types";
import { formatStandupForSlack } from "@/lib/slack";

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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2Icon className="h-5 w-5 text-emerald-500" />
            What I did yesterday
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.yesterday.map((item, index) => (
              <li key={`yesterday-${index}`} className="flex items-start gap-2">
                <span className="rounded-full bg-emerald-500/10 p-1">
                  <CheckCircle2Icon className="h-3 w-3 text-emerald-500" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClockIcon className="h-5 w-5 text-blue-500" />
            What I&apos;m doing today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.today.map((item, index) => (
              <li key={`today-${index}`} className="flex items-start gap-2">
                <span className="rounded-full bg-blue-500/10 p-1">
                  <ClockIcon className="h-3 w-3 text-blue-500" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <XCircleIcon className="h-5 w-5 text-red-500" />
            Blockers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.blockers.length > 0 ? (
            <ul className="space-y-2">
              {data.blockers.map((item, index) => (
                <li key={`blocker-${index}`} className="flex items-start gap-2">
                  <span className="rounded-full bg-red-500/10 p-1">
                    <XCircleIcon className="h-3 w-3 text-red-500" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic">
              No blockers reported.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="outline" onClick={copyToClipboard}>
          <CopyIcon className="mr-2 h-4 w-4" />
          Copy to Clipboard
        </Button>
        <Button onClick={sendToSlack} disabled={slackLoading}>
          <SlackIcon className="mr-2 h-4 w-4" />
          {slackLoading ? "Sending..." : "Send to Slack"}
        </Button>
      </div>
    </div>
  );
}
