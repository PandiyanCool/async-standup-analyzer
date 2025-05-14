import StandupRecorder from "@/components/standup/StandupRecorder";

export default function Home() {
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight mb-6 text-center">
          Record Your Daily Standup
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          Speak into your microphone to record your daily standup update. 
          We&apos;ll transcribe and analyze it automatically.
        </p>
        <StandupRecorder />
      </div>
    </div>
  );
}