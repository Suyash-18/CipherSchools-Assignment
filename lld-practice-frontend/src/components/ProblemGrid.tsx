import { type Problem } from '../types';

interface ProblemGridProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
}

export default function ProblemGrid({ problems, onSelectProblem }: ProblemGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {problems.map((problem) => (
        <div 
          key={problem._id} 
          onClick={() => onSelectProblem(problem)}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-400 hover:-translate-y-1 cursor-pointer transition-all duration-200 flex flex-col"
        >
          <div className="flex-grow">
            <h3 className="text-lg font-bold text-slate-800 mb-3">
              {problem.title}
            </h3>
            {/* line-clamp-3 ensures descriptions don't make cards wildly different heights */}
            <p className="text-sm text-slate-600 line-clamp-3">
              {problem.description}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-blue-600 font-medium text-sm flex items-center group-hover:text-blue-700">
              Solve Challenge 
              <span className="ml-2 transform transition-transform group-hover:translate-x-1">&rarr;</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}