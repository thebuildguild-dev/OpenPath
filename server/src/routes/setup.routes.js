import { Router } from 'express';
import { analyzeSetupHandler } from '../controllers/setup.controller.js';

const router = Router();

router.post('/setup/analyze', analyzeSetupHandler);

export default router;
