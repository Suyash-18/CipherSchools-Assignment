import type { Request, Response } from 'express';
import Problem from '../models/Problem.js';

export class ProblemController {
  // GET /api/problems
  public async getAllProblems(req: Request, res: Response): Promise<void> {
    try {
      // Fetch all problems from MongoDB
      const problems = await Problem.find();
      res.status(200).json(problems);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
}