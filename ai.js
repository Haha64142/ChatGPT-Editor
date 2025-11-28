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
export function getResponse(data) {
  return new Promise(async (resolve, reject) => {
    // Prepare the input for the chat completion
    const input = {
      messages: data,
      model: "openai/gpt-4.1-mini",
    };

    try {
      // Get the response from the AI model
      const response = await client.chat.completions.create(input);
      const message = response.choices[0].message;

      // Format the response
      let responseFormatted = {
        role: message.role,
        content: message.content,
      };
      return resolve(responseFormatted);
    } catch (err) {
      console.log(err.message);
      console.log(err.stack);
      return reject(err.stack);
    }
  });
}
