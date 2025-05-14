import { AzureOpenAI } from "openai";
import { StandupData } from "@/lib/types";

let client: AzureOpenAI | null = null;

export const initializeOpenAIClient = (
  endpoint: string,
  apiKey: string,
  apiVersion = "2024-02-15-preview"
): void => {

  if (!apiKey) {
    throw new Error('Azure OpenAI API key is required');
  }

  client = new AzureOpenAI({
    apiKey,
    baseURL: endpoint,
    defaultQuery: { 'api-version': apiVersion },
    defaultHeaders: { 'api-key': apiKey }
  });
};

export const analyzeStandupTranscript = async (
  transcript: string,
  deployment: string
): Promise<StandupData> => {
  if (!client) {
    throw new Error("OpenAI client not initialized");
  }

  const response = await client.chat.completions.create({
    model: deployment,
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
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No analysis generated");
  }

  try {
    return JSON.parse(content) as StandupData;
  } catch (error) {
    console.error("Failed to parse OpenAI response:", error);
    throw new Error("Failed to parse analysis response");
  }
};