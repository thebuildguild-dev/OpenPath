import { Router } from 'express';
import { generateRoadmapHandler } from '../controllers/roadmap.controller.js';

const router = Router();

router.post('/roadmap', generateRoadmapHandler);

export default router;
