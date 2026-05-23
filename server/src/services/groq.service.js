/**
 * Groq Service — canonical public wrapper around the Groq AI client.
 * Re-exports from ai.service.js so the rest of the codebase can import
 * from either `groq.service.js` or `ai.service.js`.
 */

export { generateJson, generateJsonSafe } from './ai.service.js';
export { callGroq, GROQ_MODELS } from '../utils/groq.js';
