Below are API contracts in Markdown first, then a backend-building prompt you can give to Sonnet/Claude-style thinking model.

OpenPath Backend API Contracts
# OpenPath Backend API Contracts

Base URL:

```txt
http://localhost:5000/api

Production example:

https://your-domain.com/api

Common Response Format
All APIs should return JSON.

Success Response
{
  "success": true,
  "message": "Request successful",
  "data": {}
}

Error Response
{
  "success": false,
  "message": "Something went wrong",
  "error": {
    "code": "ERROR_CODE",
    "details": "Human readable error details"
  }
}

1. Health Check API
Endpoint
GET /health

Purpose
Check if backend server is running.

Query Parameters
None.

Request Body
None.

Success Response
{
  "success": true,
  "message": "OpenPath backend is running",
  "data": {
    "status": "ok",
    "service": "openpath-backend",
    "version": "1.0.0"
  }
}

2. Analyze Repository API
Endpoint
POST /analyze

Purpose


Main API used by frontend.
It accepts a GitHub repository URL and contributor profile, then returns a personalized open-source contribution roadmap.


Request Body
{
  "repoUrl": "https://github.com/owner/repo",
  "contributor": {
    "name": "Sandipan",
    "level": "beginner",
    "skills": ["React", "JavaScript", "CSS"],
    "goal": "first-pr",
    "preferredContributionType": "code"
  },
  "options": {
    "maxIssues": 20,
    "includeAiRoadmap": true,
    "includePrDraft": true,
    "includeSetupAnalysis": true
  }
}

Body Parameters
Field
Type
Required
Description
repoUrl
string
Yes
Public GitHub repository URL
contributor
object
Yes
Contributor profile
contributor.name
string
No
Contributor name
contributor.level
string
Yes
beginner, intermediate, or advanced
contributor.skills
array of strings
Yes
Skills like React, Python, Node.js, CSS, Docs
contributor.goal
string
Yes
first-pr, bug-fix, docs, feature, testing, or explore
contributor.preferredContributionType
string
No
code, docs, testing, ui, backend, any
options
object
No
Analysis options
options.maxIssues
number
No
Number of GitHub issues to analyze. Default: 20
options.includeAiRoadmap
boolean
No
Generate AI roadmap. Default: true
options.includePrDraft
boolean
No
Generate PR title/description. Default: true
options.includeSetupAnalysis
boolean
No
Analyze setup blockers. Default: true
Success Response
{
  "success": true,
  "message": "Repository analyzed successfully",
  "data": {
    "repo": {
      "owner": "owner",
      "name": "repo",
      "fullName": "owner/repo",
      "url": "https://github.com/owner/repo",
      "description": "Example repository description",
      "stars": 1200,
      "forks": 200,
      "openIssues": 45,
      "defaultBranch": "main",
      "primaryLanguage": "JavaScript",
      "languages": ["JavaScript", "CSS", "HTML"],
      "topics": ["react", "open-source"]
    },
    "repoSummary": {
      "projectType": "React web application",
      "summary": "This repository appears to be a React-based web app.",
      "importantFolders": [
        "src",
        "components",
        "pages",
        "styles"
      ],
      "setupFiles": [
        "package.json",
        "README.md"
      ]
    },
    "setupAnalysis": {
      "difficulty": "medium",
      "score": 55,
      "commands": {
        "install": "npm install",
        "dev": "npm run dev",
        "test": "npm test",
        "build": "npm run build"
      },
      "blockers": [
        "No .env.example file found",
        "README does not clearly mention test command"
      ],
      "recommendations": [
        "Check README before setup",
        "Look for required environment variables",
        "Run npm install before starting development"
      ]
    },
    "recommendedIssues": [
      {
        "rank": 1,
        "id": 123,
        "number": 45,
        "title": "Fix button alignment on mobile screen",
        "url": "https://github.com/owner/repo/issues/45",
        "state": "open",
        "labels": ["good first issue", "ui", "bug"],
        "createdAt": "2026-01-10T10:00:00Z",
        "updatedAt": "2026-01-14T12:00:00Z",
        "comments": 2,
        "scores": {
          "finalScore": 87,
          "skillMatch": 90,
          "beginnerFriendliness": 85,
          "clarity": 80,
          "risk": 20,
          "confidence": 78
        },
        "difficulty": "beginner",
        "riskLevel": "low",
        "whyRecommended": "This issue matches React and CSS skills and appears to involve a small UI fix.",
        "likelyFiles": [
          {
            "path": "src/components/Button.jsx",
            "reason": "Issue mentions button alignment"
          },
          {
            "path": "src/styles",
            "reason": "Likely styling-related change"
          }
        ],
        "safeAreas": [
          "components",
          "styles"
        ],
        "riskyAreas": [
          "auth",
          "database",
          "api"
        ],
        "patchStrategy": [
          "Reproduce the issue locally",
          "Open the affected UI component",
          "Check responsive CSS classes",
          "Make the smallest possible style change",
          "Test on mobile and desktop widths"
        ],
        "testingChecklist": [
          "Run the app locally",
          "Check affected page on mobile width",
          "Check affected page on desktop width",
          "Run available tests if present"
        ],
        "prDraft": {
          "title": "fix: improve button alignment on mobile",
          "description": "This PR fixes the mobile alignment issue for the affected button component.\n\nChanges made:\n- Adjusted responsive styling\n- Verified layout on mobile and desktop\n\nTesting:\n- Checked locally on mobile viewport\n- Checked desktop layout"
        },
        "maintainerComment": "Hi, I would like to work on this issue. I have checked the affected UI area and plan to make a small responsive styling fix."
      }
    ],
    "bestIssue": {
      "number": 45,
      "title": "Fix button alignment on mobile screen",
      "url": "https://github.com/owner/repo/issues/45",
      "finalScore": 87
    },
    "overallGuidance": {
      "suggestedFirstStep": "Start by setting up the repository locally and reproducing the recommended issue.",
      "filesToAvoid": [
        "auth",
        "database",
        "payment",
        "security"
      ],
      "contributionAdvice": [
        "Keep the first PR small",
        "Avoid refactoring unrelated files",
        "Mention testing clearly in PR description"
      ]
    }
  }
}

Possible Error Responses
Invalid GitHub URL
{
  "success": false,
  "message": "Invalid GitHub repository URL",
  "error": {
    "code": "INVALID_REPO_URL",
    "details": "Please provide a valid GitHub repository URL like https://github.com/owner/repo"
  }
}

Repository Not Found
{
  "success": false,
  "message": "Repository not found or not accessible",
  "error": {
    "code": "REPO_NOT_FOUND",
    "details": "The repository may be private, deleted, or the GitHub token may not have access."
  }
}

AI Generation Failed
{
  "success": false,
  "message": "AI roadmap generation failed",
  "error": {
    "code": "AI_GENERATION_FAILED",
    "details": "Gemini response could not be parsed."
  }
}

3. Fetch Repository Metadata API
Endpoint
GET /repo

Purpose
Fetch basic GitHub repository information without running full AI analysis.

Query Parameters
Parameter
Type
Required
Description
repoUrl
string
Yes
GitHub repository URL
Example Request
GET /repo?repoUrl=https://github.com/owner/repo

Request Body
None.

Success Response
{
  "success": true,
  "message": "Repository metadata fetched successfully",
  "data": {
    "owner": "owner",
    "name": "repo",
    "fullName": "owner/repo",
    "url": "https://github.com/owner/repo",
    "description": "Repository description",
    "stars": 1200,
    "forks": 200,
    "watchers": 100,
    "openIssues": 45,
    "defaultBranch": "main",
    "primaryLanguage": "JavaScript",
    "topics": ["react", "opensource"],
    "license": "MIT",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z"
  }
}

4. Fetch Repository Issues API
Endpoint
GET /issues

Purpose
Fetch open issues from a GitHub repository.

Query Parameters
Parameter
Type
Required
Default
Description
repoUrl
string
Yes
-
GitHub repository URL
state
string
No
open
open, closed, or all
limit
number
No
20
Number of issues to fetch
labels
string
No
-
Comma-separated labels
sort
string
No
updated
created, updated, or comments
direction
string
No
desc
asc or desc
Example Request
GET /issues?repoUrl=https://github.com/owner/repo&state=open&limit=20&labels=good-first-issue

Request Body
None.

Success Response
{
  "success": true,
  "message": "Issues fetched successfully",
  "data": {
    "count": 2,
    "issues": [
      {
        "id": 123,
        "number": 45,
        "title": "Fix button alignment",
        "body": "The button is not aligned on mobile.",
        "url": "https://github.com/owner/repo/issues/45",
        "state": "open",
        "labels": ["good first issue", "bug"],
        "assignees": [],
        "comments": 2,
        "createdAt": "2026-01-10T10:00:00Z",
        "updatedAt": "2026-01-14T12:00:00Z"
      }
    ]
  }
}

5. Score Issues API
Endpoint
POST /issues/score

Purpose


Score already-fetched issues based on contributor skills and risk factors.
This API does not call Gemini. It uses rule-based scoring.


Request Body
{
  "repoUrl": "https://github.com/owner/repo",
  "contributor": {
    "level": "beginner",
    "skills": ["React", "CSS", "JavaScript"],
    "goal": "first-pr",
    "preferredContributionType": "ui"
  },
  "issues": [
    {
      "id": 123,
      "number": 45,
      "title": "Fix button alignment",
      "body": "The button is not aligned on mobile.",
      "labels": ["good first issue", "bug", "ui"],
      "comments": 2,
      "assignees": []
    }
  ]
}

Body Parameters
Field
Type
Required
Description
repoUrl
string
No
GitHub repository URL
contributor
object
Yes
Contributor profile
contributor.level
string
Yes
beginner, intermediate, or advanced
contributor.skills
array
Yes
Contributor skills
contributor.goal
string
Yes
Contribution goal
contributor.preferredContributionType
string
No
Preferred contribution type
issues
array
Yes
Issues to score
Success Response
{
  "success": true,
  "message": "Issues scored successfully",
  "data": {
    "scoredIssues": [
      {
        "number": 45,
        "title": "Fix button alignment",
        "scores": {
          "finalScore": 87,
          "skillMatch": 90,
          "beginnerFriendliness": 85,
          "clarity": 80,
          "risk": 20,
          "staleness": 5,
          "confidence": 78
        },
        "difficulty": "beginner",
        "riskLevel": "low",
        "reason": "UI bug with good first issue label and strong match with React/CSS skills."
      }
    ]
  }
}

6. Generate AI Roadmap API
Endpoint
POST /roadmap

Purpose
Generate AI-powered contribution roadmap using Gemini 2.5 Flash.

Request Body
{
  "repo": {
    "fullName": "owner/repo",
    "description": "Repository description",
    "languages": ["JavaScript", "CSS"],
    "fileStructure": ["src", "components", "pages", "styles"],
    "readmeSummary": "React-based project"
  },
  "contributor": {
    "level": "beginner",
    "skills": ["React", "CSS"],
    "goal": "first-pr"
  },
  "issues": [
    {
      "number": 45,
      "title": "Fix button alignment",
      "body": "The button is not aligned on mobile.",
      "labels": ["good first issue", "ui"],
      "scores": {
        "finalScore": 87,
        "risk": 20,
        "skillMatch": 90
      }
    }
  ],
  "setupAnalysis": {
    "difficulty": "medium",
    "blockers": ["No .env.example file found"]
  }
}

Success Response
{
  "success": true,
  "message": "Roadmap generated successfully",
  "data": {
    "bestIssue": {
      "number": 45,
      "title": "Fix button alignment",
      "url": "https://github.com/owner/repo/issues/45"
    },
    "whyThisIssue": "This is a low-risk UI issue that matches the contributor's React and CSS skills.",
    "likelyFiles": [
      {
        "path": "src/components/Button.jsx",
        "reason": "Likely component affected by the issue"
      }
    ],
    "riskAssessment": {
      "level": "low",
      "score": 20,
      "reason": "The issue appears limited to UI styling."
    },
    "patchStrategy": [
      "Reproduce the issue locally",
      "Inspect the button component",
      "Check responsive styling",
      "Make a minimal CSS/className change",
      "Test on mobile and desktop"
    ],
    "testingChecklist": [
      "Run local dev server",
      "Check mobile viewport",
      "Check desktop viewport",
      "Run tests if available"
    ],
    "filesToAvoid": [
      "auth",
      "database",
      "api"
    ],
    "prDraft": {
      "title": "fix: improve button alignment on mobile",
      "description": "This PR fixes the mobile alignment issue for the button component.\n\nTesting:\n- Checked mobile viewport\n- Checked desktop viewport"
    },
    "maintainerComment": "Hi, I would like to work on this issue. I plan to make a small UI fix and verify it locally."
  }
}

7. Analyze Setup API
Endpoint
POST /setup/analyze

Purpose
Analyze repository setup files and detect setup blockers.

Request Body
{
  "repoUrl": "https://github.com/owner/repo",
  "files": {
    "readme": "# Project\nRun npm install...",
    "packageJson": {
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "test": "jest"
      },
      "dependencies": {}
    },
    "envExampleExists": false,
    "contributingExists": true
  }
}

Success Response
{
  "success": true,
  "message": "Setup analyzed successfully",
  "data": {
    "difficulty": "medium",
    "score": 55,
    "detectedStack": ["Next.js", "React", "Node.js"],
    "commands": {
      "install": "npm install",
      "dev": "npm run dev",
      "build": "npm run build",
      "test": "npm test"
    },
    "blockers": [
      "No .env.example file found"
    ],
    "missingDocs": [
      "Environment variable documentation"
    ],
    "recommendations": [
      "Add .env.example",
      "Document required environment variables",
      "Mention test command in README"
    ]
  }
}

8. Generate PR Draft API
Endpoint
POST /pr-draft

Purpose
Generate a PR title, PR description, and maintainer comment.

Request Body
{
  "repo": {
    "fullName": "owner/repo",
    "projectType": "React web app"
  },
  "issue": {
    "number": 45,
    "title": "Fix button alignment on mobile screen",
    "body": "The submit button is not aligned on mobile screens.",
    "labels": ["bug", "ui"]
  },
  "patchPlan": [
    "Inspect the button component",
    "Fix responsive classes",
    "Test mobile viewport"
  ],
  "testingChecklist": [
    "Checked mobile viewport",
    "Checked desktop viewport"
  ]
}

Success Response
{
  "success": true,
  "message": "PR draft generated successfully",
  "data": {
    "prTitle": "fix: improve button alignment on mobile",
    "prDescription": "## Summary\nFixes mobile alignment for the affected button.\n\n## Changes\n- Updated responsive styling\n- Verified mobile and desktop layout\n\n## Testing\n- Checked mobile viewport\n- Checked desktop viewport",
    "maintainerComment": "Hi, I would like to work on this issue. I plan to make a small responsive UI fix and test it locally."
  }
}

9. Fallback Demo API
Endpoint
GET /demo-result

Purpose
Return a static demo response if GitHub API or Gemini API fails during judging.

Query Parameters
None.

Request Body
None.

Success Response
{
  "success": true,
  "message": "Demo result loaded successfully",
  "data": {
    "repo": {
      "fullName": "demo/openpath-sample",
      "description": "Sample React project for OpenPath demo"
    },
    "bestIssue": {
      "number": 12,
      "title": "Fix navbar overflow on mobile",
      "url": "https://github.com/demo/openpath-sample/issues/12"
    },
    "scores": {
      "finalScore": 91,
      "risk": 18,
      "skillMatch": 94,
      "confidence": 82
    },
    "likelyFiles": [
      "src/components/Navbar.jsx",
      "src/styles/navbar.css"
    ],
    "patchStrategy": [
      "Run the project locally",
      "Open mobile viewport",
      "Inspect navbar component",
      "Fix responsive layout",
      "Test desktop and mobile views"
    ],
    "prDraft": {
      "title": "fix: resolve navbar overflow on mobile",
      "description": "This PR fixes navbar overflow on smaller screens."
    }
  }
}



