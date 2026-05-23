export class AppError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class GitHubError extends AppError {
  constructor(message, details = null) {
    super(message, 'GITHUB_ERROR', 502);
    this.name = 'GitHubError';
    this.details = details;
  }
}

export class GeminiError extends AppError {
  constructor(message, details = null) {
    super(message, 'GEMINI_ERROR', 502);
    this.name = 'GeminiError';
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}
