import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EvaluationService } from '../../src/services/evaluation.service.js';
import Attempt, { EvaluationStatus } from '../../src/models/Attempt.js';
import Problem from '../../src/models/Problem.js';
import type { IEvaluationStrategy } from '../../src/evaluators/IEvaluationStrategy.js';

// 1. Mock the Mongoose Models using Vitest
vi.mock('../../src/models/Attempt');
vi.mock('../../src/models/Problem');

// 2. Create Mock Evaluators
class MockSuccessEvaluator implements IEvaluationStrategy {
  async evaluate(attempt: any, problem: any) {
    return {
      overallScore: 90,
      summary: 'Great abstraction.',
      criteria: []
    };
  }
}

class MockFailingEvaluator implements IEvaluationStrategy {
  async evaluate(attempt: any, problem: any): Promise<Record<string, any>> {
    throw new Error('OpenAI API Timeout');
  }
}

describe('EvaluationService', () => {
  let mockAttempt: any;
  let mockProblem: any;

  beforeEach(() => {
    // Clear mocks using Vitest
    vi.clearAllMocks();

    // Setup a fake Mongoose document with a mocked save() method
    mockAttempt = {
      _id: 'attempt123',
      problemId: 'problem123',
      status: EvaluationStatus.SUBMITTED,
      save: vi.fn().mockResolvedValue(true)
    };

    mockProblem = {
      _id: 'problem123',
      description: 'Design a Parking Lot'
    };

    // Override the Mongoose methods using Vitest's vi.mocked()
    vi.mocked(Attempt.findById).mockResolvedValue(mockAttempt as any);
    vi.mocked(Problem.findById).mockResolvedValue(mockProblem as any);
  });

  it('should successfully evaluate and update status to COMPLETED', async () => {
    // Arrange
    const service = new EvaluationService(new MockSuccessEvaluator());

    // Act
    await service.processAttempt('attempt123');

    // Assert
    expect(mockAttempt.status).toBe(EvaluationStatus.COMPLETED);
    expect(mockAttempt.save).toHaveBeenCalledTimes(2); 
    expect(mockAttempt.result).toBeDefined();
    expect(mockAttempt.result.overallScore).toBe(90);
  });

  it('should gracefully handle evaluator failures and set status to FAILED', async () => {
    // Arrange
    const service = new EvaluationService(new MockFailingEvaluator());
    
    // Mock the catch block dependency
    vi.mocked(Attempt.findByIdAndUpdate).mockResolvedValue(true as any);

    // Act
    await service.processAttempt('attempt123');

    // Assert
    expect(Attempt.findByIdAndUpdate).toHaveBeenCalledWith(
      'attempt123',
      expect.objectContaining({
        status: EvaluationStatus.FAILED,
        failureReason: 'OpenAI API Timeout'
      })
    );
  });

  it('should abort if the attempt is already evaluating or completed', async () => {
    // Arrange
    mockAttempt.status = EvaluationStatus.COMPLETED;
    const service = new EvaluationService(new MockSuccessEvaluator());

    // Act
    await service.processAttempt('attempt123');

    // Assert
    expect(mockAttempt.save).not.toHaveBeenCalled();
  });
});