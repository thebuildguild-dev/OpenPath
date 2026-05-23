import { Router } from 'express';
import {
  runRepoScout,
  runArchitectureMapper,
  runIssueMiner,
  runSetupInspector,
  runRiskMapper,
  runPathPlanner,
} from '../controllers/agents.controller.js';

const router = Router();

router.post('/agents/repo-scout', runRepoScout);
router.post('/agents/architecture', runArchitectureMapper);
router.post('/agents/issues', runIssueMiner);
router.post('/agents/setup', runSetupInspector);
router.post('/agents/risk', runRiskMapper);
router.post('/agents/path', runPathPlanner);

export default router;
