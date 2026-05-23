import { MOCK_ANALYSIS_RESULT } from '../data/mockData';
import type { AnalysisRequest, AnalysisResponse } from '../types';

// Base URL — swap to real endpoint when backend is ready
export const BASE_URL = 'http://localhost:5000/api';

// Simulate realistic network latency with a min/max range
const mockDelay = (min = 1800, max = 2800) =>
  new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));

/**
 * POST /analyze
 * Main API: accepts a GitHub repo URL + contributor profile,
 * returns a personalised open-source contribution roadmap.
 *
 * TODO: Remove mock and uncomment the real fetch when backend is ready.
 */
export async function analyzeRepository(
  _request: AnalysisRequest
): Promise<AnalysisResponse> {
  // --- MOCK ---
  await mockDelay();
  return MOCK_ANALYSIS_RESULT;

  // --- REAL (uncomment when backend is live) ---
  // const res = await fetch(`${BASE_URL}/analyze`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(_request),
  // });
  // if (!res.ok) {
  //   const err = await res.json();
  //   throw new Error(err.message ?? 'Analysis failed');
  // }
  // return res.json();
}

/**
 * GET /health
 * Check if the backend server is running.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * GET /demo-result
 * Fallback static demo result when GitHub / Gemini APIs fail.
 */
export async function getDemoResult(): Promise<AnalysisResponse> {
  await mockDelay(400, 600);
  return MOCK_ANALYSIS_RESULT;
}
