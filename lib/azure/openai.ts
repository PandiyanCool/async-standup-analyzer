import { Configuration, OpenAIApi } from "openai";
import { StandupData } from "../types";

export async function analyzeTranscript(
  transcript: string
): Promise<StandupData> {
  try {
    const configuration = new Configuration({
      apiKey: process.env.AZURE_OPENAI_KEY,
      basePath: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
    });

    const openai = new OpenAIApi(configuration);

    const prompt = `
      Analyze this standup update and extract the following information:
      1. What was done yesterday
      2. What will be done today
      3. Any blockers or challenges
      4. Key topics or keywords mentioned

      Transcript: ${transcript}

      Format the response as JSON with the following structure:
      {
        "yesterday": ["item1", "item2"],
        "today": ["item1", "item2"],
        "blockers": ["item1", "item2"],
        "keywords": [{"text": "keyword1", "value": 8}, {"text": "keyword2", "value": 5}]
      }
    `;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes daily standup updates and extracts key information."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const result = JSON.parse(response.data.choices[0].message?.content || "{}");
    
    return {
      yesterday: result.yesterday || [],
      today: result.today || [],
      blockers: result.blockers || [],
      keywords: result.keywords || []
    };
  } catch (error) {
    console.error("Error analyzing transcript:", error);
    throw error;
  }
}