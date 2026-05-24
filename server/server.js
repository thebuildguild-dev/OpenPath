import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { requireApiKey } from './src/middleware/auth.js';

import healthRoutes from './src/routes/health.routes.js';
import repoRoutes from './src/routes/repo.routes.js';
import analyzeRoutes from './src/routes/analyze.routes.js';
import issuesRoutes from './src/routes/issues.routes.js';
import roadmapRoutes from './src/routes/roadmap.routes.js';
import setupRoutes from './src/routes/setup.routes.js';
import prDraftRoutes from './src/routes/prDraft.routes.js';
import demoRoutes from './src/routes/demo.routes.js';
import agentsRoutes from './src/routes/agents.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Security headers
app.use(helmet());

// CORS allowlist (comma-separated env var)
const rawOrigins = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || '';
const allowedOrigins = rawOrigins.split(',').map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser tools (curl, server-side) when origin is undefined
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, false);
      const allowed = allowedOrigins.includes(origin);
      return callback(null, allowed);
    },
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting for expensive endpoints
const expensiveLimiter = rateLimit({ windowMs: 60_000, max: 20, standardHeaders: true, legacyHeaders: false });
app.use('/api/analyze', expensiveLimiter);
app.use('/api/agents', expensiveLimiter);

// Protect expensive endpoints with API key middleware
app.use('/api/analyze', requireApiKey);
app.use('/api/agents', requireApiKey);

// Request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Routes
app.use('/api', healthRoutes);
app.use('/api', repoRoutes);
app.use('/api', analyzeRoutes);
app.use('/api', issuesRoutes);
app.use('/api', roadmapRoutes);
app.use('/api', setupRoutes);
app.use('/api', prDraftRoutes);
app.use('/api', demoRoutes);
app.use('/api', agentsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: { code: 'NOT_FOUND', details: 'The requested endpoint does not exist.' },
  });
});

// Global error handler
app.use((err, _req, res, _next) => {
  // Log full error server-side only
  console.error('[Global Error]', err);
  const statusCode = err.statusCode || 500;
  // Return minimal error information to clients
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    error: {
      code: err.code || 'INTERNAL_ERROR',
    },
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 OpenPath backend running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Demo:   http://localhost:${PORT}/api/demo-result\n`);
});
