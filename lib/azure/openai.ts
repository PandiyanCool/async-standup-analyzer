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