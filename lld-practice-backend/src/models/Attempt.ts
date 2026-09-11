import mongoose, { Schema, Document } from 'mongoose';

// --- Enums ---
export const SubmissionFormat = {
  TEXT: 'TEXT',
  CODE: 'CODE',
  DIAGRAM: 'DIAGRAM'
};

export const EvaluationStatus = {
  SUBMITTED: 'SUBMITTED',
  EVALUATING: 'EVALUATING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

// --- Embedded Subdocuments ---
const SubmissionSchema = new Schema({
  format: { 
    type: String, 
    enum: Object.values(SubmissionFormat), 
    required: true 
  },
  content: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
}, { _id: false }); // _id is false because it doesn't need a unique ID outside of the Attempt

const CriterionFeedbackSchema = new Schema({
  criterion: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 10 },
  evidence: { type: String, required: true },
  concern: { type: String },
  suggestion: { type: String, required: true }
}, { _id: false });

const EvaluationResultSchema = new Schema({
  overallScore: { type: Number, required: true, min: 0, max: 100 },
  summary: { type: String, required: true },
  criteria: { type: [CriterionFeedbackSchema], required: true },
  evaluatedAt: { type: Date, default: Date.now }
}, { _id: false });

// --- Main Aggregate Root Schema ---
export interface IAttempt extends Document {
  problemId: mongoose.Types.ObjectId;
  status: string;
  submission: Record<string, any>;
  result?: Record<string, any>;
  failureReason?: string;
}

const AttemptSchema: Schema = new Schema({
  problemId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Problem', 
    required: true 
  },
  status: { 
    type: String, 
    enum: Object.values(EvaluationStatus), 
    default: EvaluationStatus.SUBMITTED 
  },
  submission: { type: SubmissionSchema, required: true },
  result: { type: EvaluationResultSchema },
  failureReason: { type: String }
}, { timestamps: true });

export default mongoose.model<IAttempt>('Attempt', AttemptSchema);