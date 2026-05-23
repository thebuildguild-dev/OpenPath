import { Router } from 'express';
import { analyzeRepo } from '../controllers/analyze.controller.js';

const router = Router();

router.post('/analyze', analyzeRepo);

export default router;
