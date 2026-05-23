import { Router } from 'express';
import { getIssues, scoreIssuesHandler } from '../controllers/issues.controller.js';

const router = Router();

router.get('/issues', getIssues);
router.post('/issues/score', scoreIssuesHandler);

export default router;
