import { AzureOpenAI } from "openai";

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
): Promise<string> => {
  if (!client) {
    throw new Error("OpenAI client not initialized");
  }


  const response = await client.chat.completions.create({
    model: deployment,
    messages: [
      {
        role: "system",
        content: `You are an AI assistant specialized in analyzing standup meeting transcripts. Your role is to:\n\n1. Extract Key Information:\n   - Identify action items and their assignees\n   - Note blockers and dependencies\n   - Track progress on ongoing tasks\n   - Highlight any decisions made\n\n2. Structure Your Analysis:\n   - Start with a brief summary\n   - List action items with assignees\n   - Note blockers that need attention\n   - Include any decisions or important discussions\n\n3. Format Guidelines:\n   - Use clear headings and bullet points\n   - Keep the analysis concise but comprehensive\n   - Highlight urgent items\n   - Maintain a professional tone\n\n4. Special Instructions:\n   - If someone mentions being blocked, ensure it's clearly highlighted\n   - If deadlines are mentioned, include them in the relevant sections\n   - If there are dependencies between tasks, note these relationships\n   - If someone needs help or resources, make this visible\n\nRemember to maintain objectivity and focus on actionable insights.`
      },
      {
        role: "user",
        content: `Please analyze this standup meeting transcript:\n\n${transcript}`
      }
    ]
  });

  return response.choices[0]?.message?.content || "No analysis generated";
};