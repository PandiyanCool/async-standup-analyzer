"use client";

import dynamic from "next/dynamic";

const StandupRecorder = dynamic(
  () => import("@/components/standup/StandupRecorder"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Async Standup Analyzer
          </h1>
          <p className="text-muted-foreground text-lg">
            Record and analyze your daily standup updates with AI
          </p>
        </div>
        <StandupRecorder />
      </div>
    </div>
  );
}
