import { Router } from 'express';
import { getRepo } from '../controllers/repo.controller.js';

const router = Router();

router.get('/repo', getRepo);

export default router;
