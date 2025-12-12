import React, { useState } from 'react';
import { useAppStore } from '../store';
import { fetchRepoIssues } from '../services/githubService';
import { analyzeGithubIssue, generateRepoIssues } from '../services/geminiService';
import { GithubIssue } from '../types';
import { 
  CircleDot, 
  Loader2, 
  RefreshCw, 
  Bot, 
  ArrowRight, 
  Copy, 
  Check, 
  Sparkles,
  AlertCircle,
  Microscope
} from 'lucide-react';

export const IssuesIntelligence: React.FC = () => {
  const { currentRepo, analysis, issues, setIssues } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<GithubIssue | null>(null);
  const [copied, setCopied] = useState(false);
  const [generateMode, setGenerateMode] = useState(false);
  const [generateGoal, setGenerateGoal] = useState("Find missing documentation");
  const [generating, setGenerating] = useState(false);

  const loadIssues = async () => {
    if (!currentRepo) return;
    setLoading(true);
    try {
      const data = await fetchRepoIssues(currentRepo.owner, currentRepo.repo);
      setIssues(data);
      if (data.length > 0 && !selectedIssue) {
        setSelectedIssue(data[0]);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to fetch issues.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeIssue = async (issue: GithubIssue) => {
    if (!analysis) {
      alert("Please analyze the repository first (Repo Analyzer) to give AI context.");
      return;
    }
    setAnalyzingId(issue.number);
    try {
      const result = await analyzeGithubIssue(issue, analysis.summary);
      const updatedIssues = issues.map(i => 
        i.number === issue.number ? { ...i, aiAnalysis: result } : i
      );
      setIssues(updatedIssues);
      // Update selection reference
      if (selectedIssue?.number === issue.number) {
        setSelectedIssue({ ...issue, aiAnalysis: result });
      }
    } catch (e) {
      console.error(e);
      alert("AI analysis failed.");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleGenerateIssues = async () => {
    if (!analysis) return;
    setGenerating(true);
    try {
      const newIssues = await generateRepoIssues(analysis.summary, generateGoal);
      // Prepend new issues
      setIssues([...newIssues, ...issues]);
      setGenerateMode(false);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const copyPatch = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentRepo) {
    return <div className="text-center mt-20 text-slate-500">Please connect a repository in Dashboard first.</div>;
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CircleDot className="text-brand-600" /> Issues Intelligence
          </h2>
          <p className="text-slate-500">Manage, analyze, and generate GitHub issues with AI.</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={loadIssues}
             disabled={loading}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
           >
             <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
             Fetch Open Issues
           </button>
           <button 
             onClick={() => setGenerateMode(!generateMode)}
             className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium transition-colors"
           >
             <Bot size={18} />
             Generate AI Issues
           </button>
        </div>
      </div>

      {/* Generation Panel */}
      {generateMode && (
        <div className="mb-6 bg-brand-50 border border-brand-200 p-4 rounded-xl flex items-center gap-4 animate-fade-in">
           <div className="flex-1">
             <label className="block text-xs font-bold text-brand-700 uppercase mb-1">Goal</label>
             <select 
               value={generateGoal}
               onChange={(e) => setGenerateGoal(e.target.value)}
               className="w-full p-2 rounded border border-brand-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
             >
               <option value="Find missing documentation">Find missing documentation</option>
               <option value="Detect potential bugs and edge cases">Detect potential bugs & edge cases</option>
               <option value="Identify unoptimized code or performance bottlenecks">Identify unoptimized code</option>
               <option value="Spot anti-patterns and clean code violations">Spot anti-patterns</option>
             </select>
           </div>
           <button 
             onClick={handleGenerateIssues}
             disabled={generating}
             className="h-10 px-6 bg-brand-600 text-white rounded-lg font-bold text-sm hover:bg-brand-700 disabled:opacity-70 flex items-center gap-2"
           >
             {generating ? <Loader2 className="animate-spin" /> : <Sparkles size={16} />}
             Run Scan
           </button>
        </div>
      )}

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Issue List */}
        <div className="w-1/3 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700 flex justify-between">
            <span>Issues List</span>
            <span className="text-slate-400 text-xs font-normal">{issues.length} items</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {issues.length === 0 && !loading && (
              <div className="text-center py-10 text-slate-400">
                <p>No issues found.</p>
                <button onClick={loadIssues} className="text-brand-600 underline mt-2 text-sm">Fetch from GitHub</button>
              </div>
            )}
            {issues.map((issue) => (
              <div 
                key={issue.number}
                onClick={() => setSelectedIssue(issue)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedIssue?.number === issue.number 
                  ? 'border-brand-500 bg-brand-50 shadow-sm' 
                  : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                   <span className="text-xs font-mono text-slate-500">#{issue.number}</span>
                   {issue.aiAnalysis && (
                     <span className={`text-[10px] px-1.5 rounded font-bold ${
                       issue.aiAnalysis.priority === 'High' ? 'bg-red-100 text-red-600' :
                       issue.aiAnalysis.priority === 'Medium' ? 'bg-orange-100 text-orange-600' :
                       'bg-green-100 text-green-600'
                     }`}>
                       {issue.aiAnalysis.priority}
                     </span>
                   )}
                </div>
                <h4 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-2">{issue.title}</h4>
                <div className="flex flex-wrap gap-1">
                  {issue.labels.map((l, i) => (
                    <span 
                      key={i} 
                      className="px-1.5 py-0.5 rounded text-[10px] text-slate-600 bg-slate-100"
                      style={{ borderLeft: `2px solid #${l.color}` }}
                    >
                      {l.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail View */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          {selectedIssue ? (
            <>
              <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                 <div>
                   <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                     <span className="text-slate-400">#{selectedIssue.number}</span> {selectedIssue.title}
                   </h2>
                   <div className="flex items-center gap-4 text-sm text-slate-500">
                     <span className="flex items-center gap-1">
                       <img src={selectedIssue.user.avatar_url} className="w-5 h-5 rounded-full" alt="avatar" />
                       {selectedIssue.user.login}
                     </span>
                     <span>Opened on {new Date(selectedIssue.created_at).toLocaleDateString()}</span>
                     <a href={selectedIssue.html_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline flex items-center gap-1">
                       View on GitHub <ArrowRight size={12}/>
                     </a>
                   </div>
                 </div>
                 
                 {!selectedIssue.aiAnalysis && (
                   <button 
                     onClick={() => handleAnalyzeIssue(selectedIssue)}
                     disabled={!!analyzingId}
                     className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                   >
                     {analyzingId === selectedIssue.number ? <Loader2 className="animate-spin" /> : <Sparkles size={16} />}
                     Analyze with AI
                   </button>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                {/* Original Body */}
                <div className="mb-6 bg-white p-4 rounded-lg border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Description</h3>
                  <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                    {selectedIssue.body}
                  </div>
                </div>

                {/* AI Analysis Result */}
                {selectedIssue.aiAnalysis && (
                  <div className="animate-fade-in space-y-6">
                    <div className="bg-purple-50 border border-purple-100 p-5 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                         <Bot className="text-purple-600" />
                         <h3 className="font-bold text-purple-900">AI Insight</h3>
                      </div>
                      <p className="text-purple-800 text-sm leading-relaxed mb-4">
                        {selectedIssue.aiAnalysis.explanation}
                      </p>
                      
                      {selectedIssue.aiAnalysis.rootCause && (
                        <div className="flex items-start gap-2 bg-white/50 p-3 rounded-lg border border-purple-100 mb-4">
                          <Microscope className="text-purple-600 shrink-0 mt-0.5" size={16} />
                          <div>
                            <span className="text-xs font-bold text-purple-900 uppercase">Root Cause Analysis</span>
                            <p className="text-sm text-purple-800 mt-0.5">{selectedIssue.aiAnalysis.rootCause}</p>
                          </div>
                        </div>
                      )}

                      <h4 className="font-bold text-purple-900 text-sm mb-2">Recommended Steps</h4>
                      <ol className="list-decimal list-inside space-y-1 mb-0">
                        {selectedIssue.aiAnalysis.fixSteps.map((step, i) => (
                          <li key={i} className="text-purple-800 text-sm">{step}</li>
                        ))}
                      </ol>
                    </div>

                    {selectedIssue.aiAnalysis.suggestedPatch && (
                       <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                         <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                           <span className="text-xs font-bold text-slate-600 uppercase">Suggested Fix / Patch</span>
                           <button 
                             onClick={() => copyPatch(selectedIssue.aiAnalysis?.suggestedPatch || "")}
                             className="text-slate-500 hover:text-brand-600 transition-colors"
                           >
                             {copied ? <Check size={16}/> : <Copy size={16}/>}
                           </button>
                         </div>
                         <pre className="p-4 bg-[#0d1117] text-green-400 font-mono text-sm overflow-x-auto">
                           {selectedIssue.aiAnalysis.suggestedPatch}
                         </pre>
                       </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <AlertCircle size={48} className="mb-4 text-slate-200" />
               <p>Select an issue from the list to view details.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};