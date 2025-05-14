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
        // Log request headers for debugging
        console.log('Request headers:', Object.fromEntries(request.headers.entries()));

        const { transcript } = await request.json();

        if (!transcript) {
            return NextResponse.json(
                { error: 'Transcript is required' },
                { status: 400 }
            );
        }

        // Log the request details (excluding sensitive data)
        console.log('Processing transcript analysis request:', {
            transcriptLength: transcript.length,
            deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
            endpoint: process.env.AZURE_OPENAI_ENDPOINT,
            apiVersion: process.env.AZURE_OPENAI_API_VERSION
        });

        if (!process.env.AZURE_OPENAI_DEPLOYMENT) {
            throw new Error('AZURE_OPENAI_DEPLOYMENT is not configured');
        }

        const response = await client.chat.completions.create({
            model: process.env.AZURE_OPENAI_DEPLOYMENT,
            messages: [
                {
                    role: "system",
                    content: `You are an AI assistant specialized in analyzing standup meeting transcripts. Your role is to extract and structure information in JSON format.

Please analyze the transcript and return a JSON object with the following structure:
{
    "yesterday": [
        "Item 1 completed yesterday",
        "Item 2 completed yesterday"
    ],
    "today": [
        "Item 1 planned for today",
        "Item 2 planned for today"
    ],
    "blockers": [
        "Blocker 1 description",
        "Blocker 2 description"
    ],
    "keywords": [
        {
            "text": "Key term or topic",
            "value": 5  // Number of mentions
        }
    ]
}

Guidelines:
1. If a section has no items, return an empty array
2. Include all relevant information from the transcript
3. Keep items concise but descriptive
4. Highlight urgent items and blockers
5. Maintain a professional tone
6. Ensure the output is valid JSON
7. For keywords, count the frequency of important terms mentioned in the transcript`
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