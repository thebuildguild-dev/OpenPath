import { Router } from 'express';
import { getDemoResult } from '../controllers/demo.controller.js';

const router = Router();

router.get('/demo-result', getDemoResult);

export default router;
