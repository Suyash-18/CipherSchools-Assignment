# AI Usage Documentation

This document outlines how Artificial Intelligence was utilized both as a **development partner** during the creation of this project and as a **core feature** within the application itself.

## 1. AI as a Development Assistant (Pair Programming)

Throughout the 2-day MVP development cycle, an AI assistant (Google Gemini) was used to accelerate development, enforce best practices, and maintain a high standard of code quality across the MERN stack. 

Specific areas of assistance included:
* **Architecture & System Design:** Brainstorming the asynchronous evaluation flow (polling mechanism) to handle LLM latency without requiring heavy message brokers like Kafka.
* **Test-Driven Development (TDD):** Generating Vitest and Supertest suites to verify API endpoints and domain logic before implementing the frontend.
* **React & Tailwind CSS:** Rapidly scaffolding responsive UI components (`Header`, `ProblemGrid`, and the `History` dashboard) using Tailwind utility classes.
* **Debugging & Refactoring:** Masking internal server errors with user-friendly messages and utilizing regex to sanitize third-party API error strings.

## 2. AI as a Core Product Feature (Evaluation Engine)

The core value proposition of this platform is instant, structured feedback on Low-Level Design (LLD) architectures. This is powered by the **Google Gemini 1.5 Pro** model.

### Prompt Engineering Strategy
To ensure the AI acts as a strict Senior Software Engineer rather than a generic chatbot, the prompt was heavily contextualized and constrained:

1. **Role Playing:** The AI is instructed to act as a "strict Senior Software Engineer evaluating a Low-Level Design (LLD) submission."
2. **Context Injection:** The prompt dynamically injects the specific `Problem Context` and the associated `Constraints/Rubric` rules seeded in the database.
3. **Negative Constraints:** The AI is explicitly told, "Do NOT evaluate syntax. Evaluate architectural choices, abstraction, and encapsulation."

### Enforcing Deterministic Outputs (JSON Schema)
A common issue with LLMs is unstructured output. To guarantee the React frontend can reliably map the AI's response to the UI, the backend utilizes Gemini's `responseSchema` configuration. 

The AI is forced to return a strict JSON object matching this TypeScript interface:
```typescript
interface EvaluationResult {
  overallScore: number;
  summary: string;
  criteria: Array<{
    criterion: string;
    score: number;
    evidence: string;
    concern?: string;
    suggestion: string;
  }>;
}