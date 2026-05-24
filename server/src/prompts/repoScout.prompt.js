/**
 * Prompt builder for the Repo Scout Agent.
 * Ask Groq to enrich the rule-based repo summary with a natural language description.
 */

import { sanitizeForPrompt } from '../utils/sanitize.js';

export function buildRepoScoutPrompt({ repoMetadata, readme, languages, topLevelContents, ruleBasedResult }) {
  const folderNames = topLevelContents.filter((f) => f.type === 'dir').map((f) => f.name);
  const fileNames = topLevelContents.filter((f) => f.type === 'file').map((f) => f.name);
  const langList = Object.keys(languages || {}).join(', ') || 'unknown';
  const readmeSnippet = sanitizeForPrompt(readme, 800);

  return `You are OpenPath's Repo Scout agent. Analyze this GitHub repository and return a structured summary.

Repository: ${repoMetadata?.fullName || 'unknown'}
Description: ${repoMetadata?.description || 'no description'}
Stars: ${repoMetadata?.stars || 0} | Forks: ${repoMetadata?.forks || 0}
Primary Language: ${repoMetadata?.primaryLanguage || langList}
Topics: ${(repoMetadata?.topics || []).join(', ') || 'none'}

Top-level folders: ${folderNames.join(', ') || 'none'}
Top-level files: ${fileNames.join(', ') || 'none'}

README excerpt:
"""
${readmeSnippet || 'No README found.'}
"""

Rule-based pre-analysis:
- Project type guess: ${ruleBasedResult.projectType}
- Detected stack: ${(ruleBasedResult.detectedStack || []).join(', ')}
- Beginner-friendly areas: ${(ruleBasedResult.beginnerFriendlyAreas || []).join(', ')}

Based on the above, return ONLY valid JSON (no markdown, no explanation) matching this exact shape:

{
  "projectType": "<short project type e.g. React web app, CLI tool, Python library>",
  "summary": "<2-3 sentence plain-English summary of what this repo does>",
  "mainPurpose": "<one sentence describing the core function>",
  "importantFiles": ["<file name>"],
  "importantFolders": ["<folder name>"],
  "beginnerFriendlyAreas": ["<safe folder/area>"],
  "complexAreas": ["<risky folder/area>"],
  "confidence": <integer 0-100>
}`;
}
