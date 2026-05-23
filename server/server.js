import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import healthRoutes from './src/routes/health.routes.js';
import repoRoutes from './src/routes/repo.routes.js';
import analyzeRoutes from './src/routes/analyze.routes.js';
import issuesRoutes from './src/routes/issues.routes.js';
import roadmapRoutes from './src/routes/roadmap.routes.js';
import setupRoutes from './src/routes/setup.routes.js';
import prDraftRoutes from './src/routes/prDraft.routes.js';
import demoRoutes from './src/routes/demo.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

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
  console.error('[Global Error]', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    error: {
      code: err.code || 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    },
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 OpenPath backend running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Demo:   http://localhost:${PORT}/api/demo-result\n`);
});
