import type { IAttempt } from '../models/Attempt.js';
import type { IProblem } from '../models/Problem.js';

export interface IEvaluationStrategy {
  /**
   * Takes a raw attempt and problem definition, and returns a structured EvaluationResult.
   */
  evaluate(attempt: IAttempt, problem: IProblem): Promise<Record<string, any>>;
}