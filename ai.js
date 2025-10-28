import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";

// Initialize the OpenAI client
const client = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN,
});

console.log("OpenAI client initialized");

/**
 *
 * @param {*} data A list of JSON objects containing the user message
 * Example: '[{ "role": "user", "content": "What is the capital of France?" }]'
 * @returns The list of JSON objects of the data + AI response
 * Example: '[
 * { "role": "user", "content": "What is the capital of France?" },
 * { "role": "assistant", "content": "The capital of France is Paris." }
 * ]'
 */
export async function getResponse(data) {
  // Prepare the input for the chat completion
  let input = {
    messages: data,
    model: "openai/gpt-4o-mini",
  };

  // Get the response from the AI model
  const response = (await client.chat.completions.create(input)).choices[0]
    .message;
  console.log("AI response received:", response);
  let responseFormatted = {
    role: response.role,
    content: response.content,
  };
  let output = [...data, responseFormatted];
  return output;
}
