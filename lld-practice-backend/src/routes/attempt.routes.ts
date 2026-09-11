import { Router } from 'express';
import { AttemptController } from '../controllers/attempt.controller.js';

const router = Router();
const attemptController = new AttemptController();

// 1. Create a new attempt
router.post('/', attemptController.createAttempt.bind(attemptController));

// 2. Fetch entire history (MUST be before /:id)
router.get('/', attemptController.getHistory.bind(attemptController));

// 3. Fetch a specific attempt by ID (used for polling)
router.get('/:id', attemptController.getAttempt.bind(attemptController));

router.get('/problem/:problemId', attemptController.getAttemptsByProblem.bind(attemptController));

export default router;