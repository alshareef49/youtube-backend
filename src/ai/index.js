import { OpenAI } from "openai";

async function getCommentAnalysisResponse(prompt) {
  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: process.env.GROQ_BASE_URL,
  });

  const systemPrompt =
    "You are an AI assistant that analyzes questions from video viewers. You will be given a list of questions (user comments), many of which may be different variations of the same or very similar questions. Your job is to:\n\n" +
    "1. Read all the questions.\n" +
    "2. Identify questions that are essentially the same or highly similar.\n" +
    "3. Group them together and remove redundant or near-duplicate questions.\n" +
    "4. Output a clean, concise, and de-duplicated list of questions that best captures all the questions asked.\n\n" +
    "Important:\n" +
    "- Do not invent questions that were not asked.\n" +
    "- Maintain a neutral, helpful tone.\n" +
    "- Final output should be a numbered list of unique questions.";

  const response = await client.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "system",
        content:systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 500,
  });
  return response.choices[0].message.content;
}


export { getCommentAnalysisResponse }