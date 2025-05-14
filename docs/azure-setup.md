## Azure Services Setup Guide

This guide explains how to set up and configure Azure services for the Async Standup Analyzer.

### Prerequisites

- An Azure account ([Create one here](https://azure.microsoft.com/free/))
- Access to Azure Portal ([portal.azure.com](https://portal.azure.com))

### 1. Azure Speech Service Setup

The Speech service enables real-time transcription of audio to text.

1. Create a Speech resource:
   - Go to Azure Portal
   - Click "Create a resource"
   - Search for "Speech"
   - Click "Create"
   - Fill in the required details:
     - Resource group: Create new or select existing
     - Region: Choose nearest to your users
     - Name: e.g., "standup-speech-service"
     - Pricing tier: Free tier (F0) for testing, Standard (S0) for production

2. Get the credentials:
   - Once created, go to the resource
   - Navigate to "Keys and Endpoint"
   - Copy "Key 1" and "Region"
   - Add to your `.env.local` file:
     ```
     AZURE_SPEECH_KEY=your_key_here
     AZURE_SPEECH_REGION=your_region_here
     ```

### 2. Azure OpenAI Service Setup

Azure OpenAI is used for analyzing transcripts and generating summaries.

1. Request access:
   - Azure OpenAI requires approval
   - Apply at [aka.ms/oai/access](https://aka.ms/oai/access)

2. Create Azure OpenAI resource:
   - Go to Azure Portal
   - Click "Create a resource"
   - Search for "Azure OpenAI"
   - Click "Create"
   - Fill in the details:
     - Resource group: Same as Speech service
     - Region: Available OpenAI region
     - Name: e.g., "standup-openai-service"
     - Pricing tier: Standard S0

3. Deploy a model:
   - Go to Azure OpenAI Studio
   - Click "Deployments"
   - Create new deployment
   - Model: GPT-4 or GPT-3.5-Turbo
   - Deployment name: e.g., "standup-analysis"

4. Get credentials:
   - Go to the resource
   - Navigate to "Keys and Endpoint"
   - Copy "Key 1" and "Endpoint"
   - Add to your `.env.local` file:
     ```
     AZURE_OPENAI_KEY=your_key_here
     AZURE_OPENAI_ENDPOINT=your_endpoint_here
     AZURE_OPENAI_DEPLOYMENT=your_deployment_name
     ```

### Implementation Guide

#### Speech-to-Text Integration

1. Update the AudioRecorder component:
   ```typescript
   import { initializeSpeechService } from '@/lib/azure/speechToText';

   // In your component:
   useEffect(() => {
     const initSpeech = async () => {
       await initializeSpeechService(
         process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!,
         process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!
       );
     };
     initSpeech();
   }, []);
   ```

2. Start recognition:
   ```typescript
   const startRecording = async () => {
     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
     await startContinuousRecognition(
       stream,
       (interim) => setTranscript(interim),
       (final) => setTranscript(final),
       (error) => console.error(error)
     );
   };
   ```

#### OpenAI Integration

1. Analyze transcripts:
   ```typescript
   import { analyzeTranscript } from '@/lib/azure/openai';

   const handleAnalysis = async (transcript: string) => {
     const summary = await analyzeTranscript(
       transcript,
       process.env.AZURE_OPENAI_KEY!,
       process.env.AZURE_OPENAI_ENDPOINT!
     );
     setSummary(summary);
   };
   ```

### Environment Variables

Create `.env.local` in your project root:

```env
# Azure Speech Service
NEXT_PUBLIC_AZURE_SPEECH_KEY=your_speech_key
NEXT_PUBLIC_AZURE_SPEECH_REGION=your_speech_region

# Azure OpenAI
AZURE_OPENAI_KEY=your_openai_key
AZURE_OPENAI_ENDPOINT=your_openai_endpoint
AZURE_OPENAI_DEPLOYMENT=your_deployment_name
```

### Security Considerations

1. API Key Protection:
   - NEVER expose Azure keys in client-side code
   - Use environment variables
   - Consider implementing a backend API to proxy requests

2. Rate Limiting:
   - Implement client-side throttling
   - Monitor API usage
   - Set up alerts for unusual usage patterns

### Testing

1. Speech Service:
   ```typescript
   // Test microphone access
   const testMicrophone = async () => {
     try {
       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
       // Microphone access successful
       stream.getTracks().forEach(track => track.stop());
     } catch (error) {
       // Handle microphone access error
     }
   };
   ```

2. OpenAI Service:
   ```typescript
   // Test analysis
   const testAnalysis = async () => {
     try {
       const result = await analyzeTranscript(
         "Test transcript",
         process.env.AZURE_OPENAI_KEY!,
         process.env.AZURE_OPENAI_ENDPOINT!
       );
       // Verify result structure
     } catch (error) {
       // Handle analysis error
     }
   };
   ```

### Troubleshooting

Common issues and solutions:

1. Speech Service:
   - Microphone access denied: Check browser permissions
   - Transcription errors: Verify API key and region
   - No audio input: Check device settings

2. OpenAI Service:
   - Rate limits: Implement retry logic
   - Token limits: Optimize prompt length
   - Model errors: Check deployment status

### Production Considerations

1. Scaling:
   - Monitor API usage
   - Implement caching where appropriate
   - Consider regional deployments

2. Cost Management:
   - Set up budget alerts
   - Monitor usage metrics
   - Optimize API calls

3. Error Handling:
   - Implement comprehensive error boundaries
   - Add logging and monitoring
   - Create user-friendly error messages