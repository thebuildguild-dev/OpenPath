import { Router } from 'express';
import { generatePrDraftHandler } from '../controllers/prDraft.controller.js';

const router = Router();

router.post('/pr-draft', generatePrDraftHandler);

export default router;
