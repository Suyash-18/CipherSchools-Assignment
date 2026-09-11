import { useState, useEffect } from 'react';
import { submitAttempt, getAttemptStatus, getProblems, getProblemAttempts } from './api/api';
import type { EvaluationStatus, Attempt, Problem } from './types/index';
import Header from './components/Header';
import ProblemGrid from './components/ProblemGrid';

type FilterTab = 'ALL' | 'COMPLETED' | 'FAILED';

function App() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  // History View State
  const [showHistory, setShowHistory] = useState(false);
  const [historyAttempts, setHistoryAttempts] = useState<Attempt[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterTab>('ALL');
  // NEW: Track which history items are expanded (Key: attempt ID, Value: boolean)
  const [expandedAttempts, setExpandedAttempts] = useState<Record<string, boolean>>({});
  
  // Evaluation State
  const [content, setContent] = useState('');
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [status, setStatus] = useState<EvaluationStatus | null>(null);
  const [attemptData, setAttemptData] = useState<Attempt | null>(null);
  const [error, setError] = useState('');

  // Fetch problems on initial load
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await getProblems();
        setProblems(data);
      } catch (err) {
        console.error('Failed to load problems', err);
      }
    };
    fetchProblems();
  }, []);

  // Polling Logic
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (attemptId && (status === 'SUBMITTED' || status === 'EVALUATING')) {
      intervalId = setInterval(async () => {
        try {
          const data = await getAttemptStatus(attemptId);
          setStatus(data.status);
          setAttemptData(data);
          if (data.status === 'COMPLETED' || data.status === 'FAILED') {
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error('Failed to poll status', err);
        }
      }, 3000);
    }
    return () => {
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, [attemptId, status]);

  const handleSubmit = async () => {
    if (!selectedProblem) return;
    if (content.trim().length < 20) {
      setError('Please provide a more detailed design submission.');
      return;
    }
    
    setError('');
    try {
      const response = await submitAttempt(selectedProblem._id, content);
      setAttemptId(response.attemptId);
      setStatus(response.status);
    } catch (err: unknown) {
      const responseError =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(responseError || 'Failed to submit attempt.');
    }
  };

  const handleFetchHistory = async () => {
    if (!selectedProblem) return;
    setLoadingHistory(true);
    setShowHistory(true);
    setFilterStatus('ALL'); 
    setExpandedAttempts({}); // Reset expanded states when loading history
    try {
      const data = await getProblemAttempts(selectedProblem._id);
      setHistoryAttempts(data);
    } catch (err) {
      console.error('Failed to fetch attempt history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleReset = () => {
    setSelectedProblem(null);
    setStatus(null);
    setAttemptId(null);
    setContent('');
    setAttemptData(null);
    setShowHistory(false);
    setHistoryAttempts([]);
    setExpandedAttempts({});
  };

  // NEW: Toggle function for expanding/collapsing individual history cards
  const toggleExpand = (id: string) => {
    setExpandedAttempts((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredAttempts = historyAttempts.filter(
    attempt => filterStatus === 'ALL' || attempt.status === filterStatus
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-800">
      <div className="max-w-6xl mx-auto">
        <Header />

        {!selectedProblem && (
          <main>
            <h2 className="text-xl font-semibold mb-6">Available Challenges</h2>
            {problems.length === 0 ? (
              <p className="text-slate-500 animate-pulse">Loading challenges...</p>
            ) : (
              <ProblemGrid 
                problems={problems} 
                onSelectProblem={setSelectedProblem} 
              />
            )}
          </main>
        )}

        {selectedProblem && (
          <main className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <button 
                onClick={handleReset}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center transition-colors"
              >
                &larr; Back to Challenges
              </button>

              {!showHistory ? (
                <button
                  onClick={handleFetchHistory}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-1.5 rounded-md transition-all shadow-sm"
                >
                  View Attempt History &rarr;
                </button>
              ) : (
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 px-4 py-1.5 rounded-md transition-all shadow-sm"
                >
                  &larr; Close History
                </button>
              )}
            </div>

            <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold mb-2">{selectedProblem.title}</h2>
              <p className="text-slate-600">{selectedProblem.description}</p>
            </section>

            {showHistory ? (
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-200 pb-3 gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Previous Attempts</h3>
                    <span className="text-sm text-slate-500">{filteredAttempts.length} attempt(s)</span>
                  </div>
                  
                  <div className="flex space-x-2 bg-slate-100 p-1 rounded-md">
                    {(['ALL', 'COMPLETED', 'FAILED'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setFilterStatus(tab)}
                        className={`px-4 py-1 rounded text-sm font-semibold transition-all ${
                          filterStatus === tab
                            ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {tab === 'ALL' ? 'All' : tab === 'COMPLETED' ? 'Completed' : 'Failed'}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingHistory ? (
                  <p className="text-slate-500 py-8 text-center animate-pulse">Loading previous attempts...</p>
                ) : filteredAttempts.length === 0 ? (
                  <div className="bg-white p-8 text-center rounded-lg border border-slate-200">
                    <p className="text-slate-500">No attempts found for the selected filter.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAttempts.map((attempt) => (
                      <div 
                        key={attempt._id} 
                        className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3 transition-all"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 font-mono">
                            Attempt ID: {attempt._id}
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            attempt.status === 'COMPLETED' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : attempt.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {attempt.status}
                          </span>
                        </div>

                        {attempt.result && (
                          <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-slate-700 font-medium">Evaluation Summary</p>
                                <p className="text-xs text-slate-500 mt-1">{attempt.result.summary}</p>
                              </div>
                              <div className="text-right pl-4">
                                <span className="text-2xl font-black text-slate-800">
                                  {attempt.result.overallScore}
                                </span>
                                <span className="text-xs text-slate-500">/100</span>
                              </div>
                            </div>
                            
                            {/* Expand / Collapse Button */}
                            <button
                              onClick={() => toggleExpand(attempt._id)}
                              className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                            >
                              {expandedAttempts[attempt._id] ? '↑ Show Less' : '↓ Read Full Feedback'}
                            </button>

                            {/* Expanded Criteria Data */}
                            {expandedAttempts[attempt._id] && (
                              <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 animate-in fade-in duration-300">
                                {attempt.result.criteria.map((c, i) => (
                                  <div key={i} className="bg-white p-4 rounded border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-2 border-b border-slate-100 pb-2">
                                      <span className="font-bold text-slate-700 text-sm">{c.criterion}</span>
                                      <span className={`font-bold px-2 py-0.5 rounded text-xs ${c.score >= 8 ? 'bg-green-100 text-green-700' : c.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                        {c.score}/10
                                      </span>
                                    </div>
                                    <div className="space-y-2 mt-2">
                                      <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded">
                                        <strong className="text-slate-900">Evidence:</strong> {c.evidence}
                                      </p>
                                      {c.concern && (
                                        <p className="text-xs text-red-700 bg-red-50 p-2 rounded">
                                          <strong className="text-red-900">Concern:</strong> {c.concern}
                                        </p>
                                      )}
                                      <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded">
                                        <strong className="text-amber-900">Suggestion:</strong> {c.suggestion}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {attempt.failureReason && (
                          <p className="text-xs text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
                            <strong>Failure Reason:</strong> {attempt.failureReason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <>
                <section className="space-y-4">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={status === 'SUBMITTED' || status === 'EVALUATING' || status === 'COMPLETED'}
                    placeholder={`class ${selectedProblem.title.replace(/\s+/g, '')} {\n  // Code your design here\n}`}
                    className="w-full h-80 p-5 font-mono text-sm border border-slate-300 rounded-md shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50"
                  />
                  {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                  
                  {!status || status === 'FAILED' ? (
                    <button
                      onClick={handleSubmit}
                      className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 hover:shadow-lg transition-all"
                    >
                      Submit Architecture for Review
                    </button>
                  ) : (
                    <div className="flex items-center space-x-3 text-blue-600 font-medium p-4 bg-blue-50 rounded-md border border-blue-100">
                      {status !== 'COMPLETED' && (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Evaluating architecture patterns...
                        </span>
                      )}
                    </div>
                  )}
                </section>

                {status === 'COMPLETED' && attemptData?.result && (
                  <section className="bg-emerald-50 p-6 sm:p-8 rounded-xl border border-emerald-200 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b border-emerald-200 pb-4">
                      <h3 className="text-2xl font-bold text-emerald-900">Evaluation Complete</h3>
                      <div className="text-right">
                        <span className="text-4xl font-black text-emerald-600 tracking-tight">
                          {attemptData.result.overallScore}
                        </span>
                        <span className="text-emerald-800 font-medium ml-1">/ 100</span>
                      </div>
                    </div>
                    <p className="text-emerald-900 text-lg leading-relaxed">{attemptData.result.summary}</p>
                    
                    <div className="space-y-4 mt-6">
                      {attemptData.result.criteria.map((c, i) => (
                        <div key={i} className="bg-white p-5 rounded-lg shadow-sm border border-emerald-100">
                          <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
                            <span className="font-bold text-slate-800 text-lg">{c.criterion}</span>
                            <span className={`font-bold px-3 py-1 rounded-full text-sm ${c.score >= 8 ? 'bg-green-100 text-green-700' : c.score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                              Score: {c.score}/10
                            </span>
                          </div>
                          <div className="space-y-2 mt-3">
                            <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">
                              <strong className="text-slate-900">Evidence:</strong> {c.evidence}
                            </p>
                            {c.concern && (
                              <p className="text-sm text-red-700 bg-red-50 p-2 rounded">
                                <strong className="text-red-900">Concern:</strong> {c.concern}
                              </p>
                            )}
                            <p className="text-sm text-amber-800 bg-amber-50 p-2 rounded">
                              <strong className="text-amber-900">Actionable Suggestion:</strong> {c.suggestion}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </main>
        )}
      </div>
    </div>
  );
}

export default App;