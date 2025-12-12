import React, { useState } from 'react';
import { useAppStore } from '../store';
import { scanForBugs } from '../services/geminiService';
import { fetchFileContent } from '../services/githubService';
import { Bug, ShieldAlert, Zap, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

export const BugScanner: React.FC = () => {
  const { currentRepo, bugs, setBugs } = useAppStore();
  const [scanning, setScanning] = useState(false);

  const startScan = async () => {
    if (!currentRepo) return;
    setScanning(true);
    
    try {
      // Pick random 5 files for the demo scan to keep it fast
      const sampleFiles = currentRepo.files
        .sort(() => 0.5 - Math.random())
        .slice(0, 5)
        .filter(f => f.path.match(/\.(ts|tsx|js|jsx|py|java|go)$/)); // Only code files

      const filesWithContent = [];
      for (const file of sampleFiles) {
        try {
          const content = await fetchFileContent(currentRepo.owner, currentRepo.repo, file.path);
          filesWithContent.push({ path: file.path, content });
        } catch (e) { console.warn(e); }
      }

      const results = await scanForBugs(filesWithContent);
      setBugs(results);
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  if (!currentRepo) return <div className="text-center mt-20 text-slate-500">Analyze a repo first.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Bug & Security Scanner</h2>
          <p className="text-slate-500">Deep scan of codebase for vulnerabilities and anti-patterns</p>
        </div>
        <button 
          onClick={startScan}
          disabled={scanning}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
        >
          {scanning ? <Loader2 className="animate-spin" size={18} /> : <Bug size={18} />}
          {scanning ? 'Scanning...' : 'Start New Scan'}
        </button>
      </div>

      <div className="grid gap-4">
        {bugs.map((bug, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex gap-4">
             <div className="mt-1">
               {bug.issueType === 'Security' ? <ShieldAlert className="text-red-500" /> : 
                bug.issueType === 'Bug' ? <Bug className="text-orange-500" /> : <Zap className="text-yellow-500" />}
             </div>
             <div className="flex-1">
               <div className="flex justify-between items-start">
                 <h3 className="font-bold text-slate-800 text-lg mb-1">{bug.issueType}: {bug.filePath}</h3>
                 <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                   bug.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                   bug.severity === 'Major' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                 }`}>
                   {bug.severity}
                 </span>
               </div>
               <p className="text-slate-600 mb-3">{bug.description}</p>
               
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                 <div className="text-xs font-bold text-slate-500 uppercase mb-1">Suggestion</div>
                 <div className="text-slate-700 text-sm">{bug.suggestion}</div>
               </div>

               <div className="flex justify-end">
                 <Link 
                   to={`${ROUTES.PR}?bugId=${idx}`} 
                   state={{ bug }}
                   className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-800"
                 >
                   Generate Fix PR <ArrowRight size={16} />
                 </Link>
               </div>
             </div>
          </div>
        ))}

        {!scanning && bugs.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <ShieldAlert size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-500">No issues found (or scan not started)</h3>
            <p className="text-slate-400">Click the button above to analyze code files.</p>
          </div>
        )}
      </div>
    </div>
  );
};