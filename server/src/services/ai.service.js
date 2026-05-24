import { callGroq } from '../utils/groq.js';
import { safeJsonParse } from '../utils/safeJsonParse.js';

const DEFAULT_SYSTEM_PROMPT =
  'You are OpenPath, an AI mentor that analyzes GitHub repositories and creates safe contribution roadmaps.';

function stripFences(text) {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

export async function generateJson(prompt, options = {}) {
  const result = await callGroq(
    [
      {
        role: 'system',
        content: options.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    {
      temperature: options.temperature,
      max_tokens: options.max_tokens,
    }
  );

  const cleaned = stripFences(result.text);
  const parsed = safeJsonParse(cleaned, null);
  if (parsed === null) {
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      const alt = safeJsonParse(match[1], null);
      if (alt !== null) return alt;
    }
    throw new Error(`Groq returned non-JSON response from ${result.model}: ${cleaned.slice(0, 200)}`);
  }
  return parsed;
}

export async function generateJsonSafe(prompt, fallback, timeoutMs = 30000, options = {}) {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Groq request timed out')), timeoutMs)
    );
    const result = await Promise.race([generateJson(prompt, options), timeoutPromise]);
    return { data: result, fromFallback: false };
  } catch (err) {
    console.warn('[AI] Falling back to rule-based result:', err.message);
    return { data: fallback, fromFallback: true };
  }
}
