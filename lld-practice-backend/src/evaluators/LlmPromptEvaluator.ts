import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import type { IEvaluationStrategy } from './IEvaluationStrategy.js';
import type { IAttempt } from '../models/Attempt.js';
import type { IProblem } from '../models/Problem.js';

export class LlmPromptEvaluator implements IEvaluationStrategy {
  private genAI: GoogleGenerativeAI;

  constructor() {
    // Ensure process.env.GEMINI_API_KEY is set in your .env file
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  public async evaluate(attempt: IAttempt, problem: IProblem): Promise<Record<string, any>> {
    const systemPrompt = `
      You are a strict Senior Software Engineer evaluating a Low-Level Design (LLD) submission. 
      Do NOT evaluate syntax. Evaluate architectural choices, abstraction, and encapsulation.
      
      Problem Context: ${problem.description}
      Constraints/Rubric: ${problem.rubricRules.join(', ')}
    `;

    const userPrompt = `
      Evaluate the following learner submission against standard SOLID principles, 
      encapsulation, and interface design. 
      
      Learner Submission:
      ${attempt.submission.content}
    `;

    // Define the strict JSON schema expected by Gemini
    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        overallScore: { type: SchemaType.INTEGER, description: 'Score out of 100' },
        summary: { type: SchemaType.STRING, description: '2-3 sentences summarizing structural quality' },
        criteria: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              criterion: { type: SchemaType.STRING, description: 'Name of the LLD principle evaluated' },
              score: { type: SchemaType.INTEGER, description: 'Score out of 10' },
              evidence: { type: SchemaType.STRING, description: 'Quote specific code or structural choices from the submission' },
              concern: { type: SchemaType.STRING, description: 'What is fundamentally wrong or fragile?' },
              suggestion: { type: SchemaType.STRING, description: 'Actionable step to fix the design' }
            },
            required: ['criterion', 'score', 'evidence', 'concern', 'suggestion']
          }
        }
      },
      required: ['overallScore', 'summary', 'criteria']
    };

    // Initialize the Gemini model with the system instructions and strict JSON config
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-3.6-flash', // Fast and excellent at structured data
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    // Execute the call
    const result = await model.generateContent(userPrompt);
    const output = result.response.text();
    
    if (!output) {
      throw new Error('Gemini API returned an empty response.');
    }

    // Since responseMimeType is application/json, it is safe to parse
    return JSON.parse(output);
  }
}