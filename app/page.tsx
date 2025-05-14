import StandupRecorder from "@/components/standup/StandupRecorder";

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
