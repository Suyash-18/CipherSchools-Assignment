import mongoose, { Schema, Document } from 'mongoose';

export interface IProblem extends Document {
  title: string;
  description: string;
  rubricRules: string[];
}

const ProblemSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  rubricRules: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model<IProblem>('Problem', ProblemSchema);