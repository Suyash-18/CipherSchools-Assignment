import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js'; // Your Express application
import Attempt, { EvaluationStatus } from '../../src/models/Attempt.js';
import { EvaluationService } from '../../src/services/evaluation.service.js';

// Mock the Mongoose model and the Service using Vitest
vi.mock('../../src/models/Attempt.js');
vi.mock('../../src/services/evaluation.service.js');

describe('Attempt API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/attempts', () => {
    it('should return 202 Accepted and start background evaluation', async () => {
      // 1. Arrange: Mock the database returning a new attempt
      const mockAttempt = {
        _id: 'mocked-id-123',
        status: EvaluationStatus.SUBMITTED,
      };
      
      // Use Vitest's mocking syntax
      vi.mocked(Attempt.create).mockResolvedValue(mockAttempt as any);
      vi.mocked(EvaluationService.prototype.processAttempt).mockResolvedValue(undefined);

      const payload = {
        problemId: 'problem-123',
        format: 'TEXT',
        content: 'class VendingMachine { ... }'
      };

      // 2. Act: Use Supertest to hit the endpoint
      const response = await request(app)
        .post('/api/attempts')
        .send(payload);

      // 3. Assert: Verify the HTTP response
      expect(response.status).toBe(202);
      expect(response.body).toEqual({
        message: 'Submission received. Evaluation in progress.',
        attemptId: 'mocked-id-123',
        status: EvaluationStatus.SUBMITTED
      });

      // Verify the controller correctly passed data to the database
      expect(Attempt.create).toHaveBeenCalledWith(
        expect.objectContaining({
          problemId: 'problem-123',
          submission: expect.objectContaining({
            content: 'class VendingMachine { ... }'
          })
        })
      );

      // Verify the fire-and-forget background service was called
      expect(EvaluationService.prototype.processAttempt).toHaveBeenCalledWith('mocked-id-123');
    });

    it('should return 400 Bad Request if content is missing', async () => {
      const response = await request(app)
        .post('/api/attempts')
        .send({ problemId: 'problem-123' }); // Missing 'content'

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      
      // Ensure we don't save to DB or trigger AI on bad input
      expect(Attempt.create).not.toHaveBeenCalled();
      expect(EvaluationService.prototype.processAttempt).not.toHaveBeenCalled();
    });
  });
});