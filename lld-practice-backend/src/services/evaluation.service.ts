import Attempt, { EvaluationStatus } from '../models/Attempt.js';
import Problem from '../models/Problem.js';
import type { IEvaluationStrategy } from '../evaluators/IEvaluationStrategy.js';
import { LlmPromptEvaluator } from '../evaluators/LlmPromptEvaluator.js';

export class EvaluationService {
  private evaluator: IEvaluationStrategy;

  constructor(evaluator?: IEvaluationStrategy) {
    this.evaluator = evaluator || new LlmPromptEvaluator();
  }

  /**
   * Processes an attempt asynchronously. 
   * This is designed to be fired in the background by the controller.
   */
  public async processAttempt(attemptId: string): Promise<void> {
    try {
      // 1. Fetch the Attempt and corresponding Problem from MongoDB
      const attempt = await Attempt.findById(attemptId);
      if (!attempt) throw new Error('Attempt not found');

      if (attempt.status !== EvaluationStatus.SUBMITTED) {
        console.log(`Attempt ${attemptId} is already processing or completed.`);
        return; 
      }

      const problem = await Problem.findById(attempt.problemId);
      if (!problem) throw new Error('Associated problem not found');

      // 2. Mark state as EVALUATING
      attempt.status = EvaluationStatus.EVALUATING;
      await attempt.save();

      // 3. Delegate to the AI Strategy
      const result = await this.evaluator.evaluate(attempt, problem);

      // 4. Save the final JSON result back to the document
      attempt.result = result;
      attempt.status = EvaluationStatus.COMPLETED;
      await attempt.save();

    } catch (error: any) {
      // 5. Gracefully handle failure states
      console.error(`Evaluation failed for attempt ${attemptId}:`, error);
      
      let cleanFailureReason = error.message || 'An unexpected error occurred during evaluation.';
      
      // Extract the specific "[XXX Error] Message" format to keep DB entries clean
      const apiErrorMatch = cleanFailureReason.match(/(\[\d{3}[^\]]*\][^.]+)/);
      if (apiErrorMatch) {
        // Appends a period to complete the extracted sentence
        cleanFailureReason = apiErrorMatch[1].trim() + '.';
      }

      await Attempt.findByIdAndUpdate(attemptId, {
        status: EvaluationStatus.FAILED,
        failureReason: cleanFailureReason
      });
    }
  }
}