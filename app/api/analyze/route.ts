import { NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';

export const dynamic = 'force-dynamic';

// Validate environment variables
const requiredEnvVars = {
    AZURE_OPENAI_KEY: process.env.AZURE_OPENAI_KEY,
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT,
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
}

const client = new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_KEY,
    baseURL: process.env.AZURE_OPENAI_ENDPOINT,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
    defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY! }
});

export async function POST(request: Request) {
    try {

        const { transcript } = await request.json();

        if (!transcript) {
            return NextResponse.json(
                { error: 'Transcript is required' },
                { status: 400 }
            );
        }



        if (!process.env.AZURE_OPENAI_DEPLOYMENT) {
            throw new Error('AZURE_OPENAI_DEPLOYMENT is not configured');
        }

        const response = await client.chat.completions.create({
            model: process.env.AZURE_OPENAI_DEPLOYMENT,
            messages: [
                {
                    role: "system",
                    content: `You are an AI assistant specialized in analyzing standup meeting transcripts. Your role is to extract key information and provide sentiment analysis. Return your analysis in the following JSON format:

{
  "yesterday": ["item1", "item2", ...],
  "today": ["item1", "item2", ...],
  "blockers": ["blocker1", "blocker2", ...],
  "keywords": [
    {"text": "keyword1", "value": 1},
    {"text": "keyword2", "value": 2},
    ...
  ],
  "sentiment": {
    "overall": "positive" | "neutral" | "negative",
    "score": number, // -1 to 1
    "highlights": {
      "positive": ["highlight1", "highlight2", ...],
      "negative": ["concern1", "concern2", ...]
    }
  }
}

Guidelines:
1. Extract completed tasks, planned tasks, and blockers
2. Identify key topics and their frequency
3. Analyze sentiment:
   - Determine overall sentiment (positive/neutral/negative)
   - Calculate sentiment score (-1 to 1)
   - List positive highlights and concerns
4. Keep items concise and actionable
5. Ensure all arrays are properly populated, even if empty`
                },
                {
                    role: "user",
                    content: `Please analyze this standup meeting transcript:\n\n${transcript}`
                }
            ]
        });

        const result = response.choices[0]?.message?.content;
        if (!result) {
            throw new Error('No response from OpenAI');
        }

        // Try to parse the result as JSON to validate it
        try {
            JSON.parse(result);
        } catch (e) {
            console.error('Invalid JSON response:', result);
            throw new Error('Invalid JSON response from OpenAI');
        }

        return NextResponse.json({ result });
    } catch (error) {
        // Enhanced error logging
        console.error('Error analyzing transcript:', {
            error: error instanceof Error ? {
                message: error.message,
                name: error.name,
                stack: error.stack
            } : error,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json(
            {
                error: 'Failed to analyze transcript',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 