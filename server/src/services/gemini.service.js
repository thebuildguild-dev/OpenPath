import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-2.5-flash';

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set in environment variables');
  return new GoogleGenerativeAI(key);
}

/**
 * Strip markdown code fences that Gemini sometimes wraps around JSON.
 */
function stripFences(text) {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

/**
 * Call Gemini with a prompt and return parsed JSON.
 * Throws if Gemini is unavailable or returns unparseable content.
 * @param {string} prompt
 * @returns {object}
 */
export async function generateJson(prompt) {
  const client = getClient();
  const model = client.getGenerativeModel({ model: MODEL_NAME });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = stripFences(text);

  try {
    return JSON.parse(cleaned);
  } catch {
    // Second attempt: try to extract the first JSON object/array from the text
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      return JSON.parse(match[1]);
    }
    throw new Error(`Gemini returned non-JSON response: ${cleaned.slice(0, 200)}`);
  }
}

/**
 * generateJson with timeout and a fallback value on failure.
 * Never throws — always returns either Gemini result or fallback.
 * @param {string} prompt
 * @param {*} fallback  Value to return on failure
 * @param {number} timeoutMs
 */
export async function generateJsonSafe(prompt, fallback, timeoutMs = 30000) {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini request timed out')), timeoutMs)
    );
    const result = await Promise.race([generateJson(prompt), timeoutPromise]);
    return { data: result, fromFallback: false };
  } catch (err) {
    console.warn('[Gemini] Falling back to rule-based result:', err.message);
    return { data: fallback, fromFallback: true };
  }
}
