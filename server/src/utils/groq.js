import Groq from "groq-sdk";

export const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "meta-llama/llama-4-scout-17b-16e-instruct",
];

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY");
  }

  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

function extractText(completion) {
  return completion?.choices?.[0]?.message?.content || "";
}

export async function callGroq(messages, options = {}) {
  const groq = getGroqClient();

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("callGroq requires a non-empty messages array");
  }

  let lastError;

  for (const model of GROQ_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens ?? 1800,
        stream: false,
      });

      const text = extractText(completion);

      if (!text || typeof text !== "string") {
        throw new Error(`${model} returned empty response`);
      }

      return {
        model,
        text,
        raw: completion,
      };
    } catch (error) {
      lastError = error;
      console.error(`Groq model failed: ${model}`, error?.message || error);
    }
  }

  throw new Error(
    `All Groq models failed. Last error: ${lastError?.message || "Unknown error"}`,
  );
}
