import { Router } from 'express';
import { ProblemController } from '../controllers/problem.controller.js';

const router = Router();
const problemController = new ProblemController();

router.get('/', problemController.getAllProblems.bind(problemController));

export default router;