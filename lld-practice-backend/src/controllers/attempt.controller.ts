import type { Request, Response } from 'express';
import Attempt, { EvaluationStatus, SubmissionFormat } from '../models/Attempt.js';
import { EvaluationService } from '../services/evaluation.service.js';

// Note: In a real app, this would be injected via a Dependency Injection container.
const evaluationService = new EvaluationService(); 

export class AttemptController {

  // POST /api/attempts
  public async createAttempt(req: Request, res: Response): Promise<void> {
    try {
      const { problemId, format, content } = req.body;

      if (!problemId || !content) {
        res.status(400).json({ error: 'Both problemId and content are required to submit an attempt.' });
        return;
      }

      const newAttempt = await Attempt.create({
        problemId,
        status: EvaluationStatus.SUBMITTED,
        submission: {
          format: format || SubmissionFormat.TEXT,
          content: content
        }
      });

      evaluationService.processAttempt(newAttempt._id.toString()).catch(err => {
        console.error(`Background evaluation failed for ${newAttempt._id}:`, err);
      });

      res.status(202).json({
        message: 'Submission received. Evaluation in progress.',
        attemptId: newAttempt._id,
        status: newAttempt.status
      });
    } catch (error: any) {
      // Custom Error Masking
      res.status(500).json({ error: 'Failed to submit your architecture. Please check your input and try again.' });
    }
  }

  // GET /api/attempts/:id
  public async getAttempt(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const attempt = await Attempt.findById(id).populate('problemId', 'title');

      if (!attempt) {
        res.status(404).json({ error: 'We could not find that specific attempt.' });
        return;
      }

      res.status(200).json(attempt);
    } catch (error: any) {
      // Custom Error Masking
      res.status(500).json({ error: 'Unable to retrieve the attempt details at this time.' });
    }
  }

  // GET /api/attempts
  public async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { problemId } = req.query;
      const filter = typeof problemId === 'string' ? { problemId } : {};

      const history = await Attempt.find(filter)
        .sort({ createdAt: -1 }) 
        .populate('problemId', 'title')
        .select('-submission.content') 
        .exec();

      res.status(200).json(history);
    } catch (error: any) {
      // Custom Error Masking
      res.status(500).json({ error: 'Failed to load your submission history.' });
    }
  }

  // GET /api/attempts/problem/:problemId
  public async getAttemptsByProblem(req: Request, res: Response): Promise<void> {
    try {
      const { problemId } = req.params;
      const resolvedProblemId = Array.isArray(problemId) ? problemId[0] : problemId;

      if (!resolvedProblemId) {
        res.status(400).json({ error: 'A valid challenge ID is required.' });
        return;
      }

      const attempts = await Attempt.find({ problemId: resolvedProblemId })
        .sort({ createdAt: -1 }) 
        .populate('problemId', 'title')
        .select('-submission.content');

      res.status(200).json(attempts);
    } catch (error: any) {
      // Custom Error Masking
      res.status(500).json({ error: 'Unable to load attempts for this specific challenge.' });
    }
  }
}