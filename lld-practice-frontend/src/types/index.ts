export type EvaluationStatus = 'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | 'FAILED';

export interface CriterionFeedback {
  criterion: string;
  score: number;
  evidence: string;
  concern?: string;
  suggestion: string;
}

export interface EvaluationResult {
  overallScore: number;
  summary: string;
  criteria: CriterionFeedback[];
  evaluatedAt: string;
}

export interface Attempt {
  _id: string;
  problemId: string;
  status: EvaluationStatus;
  result?: EvaluationResult;
  failureReason?: string;
}

export interface Problem {
  _id: string;
  title: string;
  description: string;
  rubricRules: string[];
}