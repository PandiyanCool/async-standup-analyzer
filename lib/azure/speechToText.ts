import { SpeechConfig, AudioConfig, SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk';

export async function initializeSpeechService(apiKey: string, region: string) {
  const speechConfig = SpeechConfig.fromSubscription(apiKey, region);
  speechConfig.speechRecognitionLanguage = "en-US";
  
  return {
    speechConfig,
    initialized: true
  };
}

export async function startContinuousRecognition(
  audioStream: MediaStream,
  onInterimResult: (text: string) => void,
  onFinalResult: (text: string) => void,
  onError: (error: Error) => void
) {
  try {
    const speechConfig = SpeechConfig.fromSubscription(
      process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!,
      process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!
    );
    
    const audioConfig = AudioConfig.fromStreamInput(audioStream);
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizing = (_, event) => {
      if (event.result.text) {
        onInterimResult(event.result.text);
      }
    };

    recognizer.recognized = (_, event) => {
      if (event.result.text) {
        onFinalResult(event.result.text);
      }
    };

    recognizer.canceled = (_, event) => {
      onError(new Error(`Recognition canceled: ${event.errorDetails}`));
      recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.startContinuousRecognitionAsync();

    return () => {
      recognizer.stopContinuousRecognitionAsync();
    };
  } catch (error) {
    onError(error as Error);
    return () => {};
  }
}