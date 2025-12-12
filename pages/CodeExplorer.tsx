import React, { useState } from 'react';
import { useAppStore } from '../store';
import { fetchFileContent } from '../services/githubService';
import { explainFile } from '../services/geminiService';
import { CodeExplanation } from '../types';
import { File, Folder, ChevronRight, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

export const CodeExplorer: React.FC = () => {
  const { currentRepo } = useAppStore();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [explanation, setExplanation] = useState<CodeExplanation | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const handleFileSelect = async (path: string) => {
    if (!currentRepo) return;
    setSelectedFile(path);
    setFileContent('');
    setExplanation(null);
    setLoadingContent(true);

    try {
      const content = await fetchFileContent(currentRepo.owner, currentRepo.repo, path);
      setFileContent(content);
      setLoadingContent(false);
    } catch (err) {
      console.error(err);
      setLoadingContent(false);
    }
  };

  const handleExplain = async () => {
    if (!selectedFile || !fileContent) return;
    setLoadingExplanation(true);
    try {
      const result = await explainFile(selectedFile, fileContent);
      setExplanation(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExplanation(false);
    }
  };

  if (!currentRepo) return <div className="text-center mt-20 text-slate-500">Analyze a repo first.</div>;

  return (
    <div className="h-[calc(100vh-140px)] flex border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* File Tree (Simplified List) */}
      <div className="w-1/4 border-r border-slate-200 overflow-y-auto bg-slate-50">
        <div className="p-4 font-bold text-slate-700 border-b border-slate-200">Files</div>
        <div className="p-2">
          {currentRepo.files.map((file) => (
            <button
              key={file.path}
              onClick={() => handleFileSelect(file.path)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 truncate ${
                selectedFile === file.path ? 'bg-brand-100 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <File size={14} className="flex-shrink-0" />
              <span className="truncate">{file.path}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Code Viewer */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedFile ? (
          <>
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
              <h3 className="font-mono text-sm font-semibold">{selectedFile}</h3>
              <button 
                onClick={handleExplain}
                disabled={loadingExplanation || !fileContent}
                className="bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {loadingExplanation ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Explain Code
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-[#0d1117] text-slate-300 p-4 font-mono text-sm">
               {loadingContent ? (
                 <div className="flex items-center gap-2 text-slate-500">
                   <Loader2 className="animate-spin" size={20} /> Loading content...
                 </div>
               ) : (
                 <pre>{fileContent}</pre>
               )}
            </div>
          </>
        ) : (
           <div className="flex-1 flex items-center justify-center text-slate-400">
             Select a file to view code
           </div>
        )}
      </div>

      {/* Explanation Panel */}
      {explanation && (
        <div className="w-1/3 border-l border-slate-200 bg-white overflow-y-auto p-6 shadow-xl z-10 absolute right-0 top-0 bottom-0 lg:static lg:shadow-none">
           <h3 className="text-xl font-bold text-slate-800 mb-4">AI Explanation</h3>
           
           <div className="space-y-6">
             <div>
               <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Summary</h4>
               <p className="text-slate-700 text-sm leading-relaxed">{explanation.summary}</p>
             </div>

             <div>
               <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Functions</h4>
               <ul className="space-y-3">
                 {explanation.functions.map((fn, i) => (
                   <li key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                     <div className="font-mono text-sm font-bold text-brand-600 mb-1">{fn.name}</div>
                     <div className="text-xs text-slate-600">{fn.purpose}</div>
                   </li>
                 ))}
               </ul>
             </div>

             {explanation.potentialIssues.length > 0 && (
               <div>
                 <h4 className="text-sm font-bold text-red-500 uppercase mb-2 flex items-center gap-2">
                   <AlertTriangle size={14}/> Issues
                 </h4>
                 <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                   {explanation.potentialIssues.map((issue, i) => (
                     <li key={i}>{issue}</li>
                   ))}
                 </ul>
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
};