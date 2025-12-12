import React, { useState } from 'react';
import { resolveMergeConflict } from '../services/geminiService';
import { MergeConflictResolution } from '../types';
import { GitMerge, Loader2, Copy, Check, ArrowRight, RefreshCw, UploadCloud } from 'lucide-react';

export const MergeConflictResolver: React.FC = () => {
  const [inputCode, setInputCode] = useState('');
  const [result, setResult] = useState<MergeConflictResolution | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleResolve = async () => {
    if (!inputCode) return;
    if (!inputCode.includes('<<<<<<<')) {
      alert("No merge markers found (<<<<<<<) in the text. Please paste the content containing the conflict.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const resolution = await resolveMergeConflict(inputCode);
      setResult(resolution);
    } catch (error) {
      console.error(error);
      alert("Failed to resolve conflict. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.safePreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setInputCode(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GitMerge className="text-brand-600" /> AutoPacify: Merge Conflict Resolver
          </h2>
          <p className="text-slate-500">Paste conflicted file content (with &lt;&lt;&lt;&lt;&lt;&lt;&lt; markers) and let AI resolve it.</p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left Column: Input */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white p-4 rounded-t-xl border border-slate-200 border-b-0 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">Conflicted Source</h3>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors">
                <UploadCloud size={14} /> Upload File
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
              <button 
                onClick={() => setInputCode('')} 
                className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder={`<<<<<<< HEAD
const currentVal = 10;
=======
const currentVal = 20;
>>>>>>> feature-branch`}
            className="flex-1 w-full p-4 font-mono text-sm bg-slate-900 text-slate-300 resize-none outline-none rounded-b-xl focus:ring-2 focus:ring-brand-500 transition-all border border-slate-200"
            spellCheck={false}
          />
          <button
            onClick={handleResolve}
            disabled={loading || !inputCode}
            className="mt-4 w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-sm"
          >
            {loading ? <Loader2 className="animate-spin" /> : <GitMerge size={20} />}
            {loading ? 'Analyzing Conflict...' : 'Resolve Conflict'}
          </button>
        </div>

        {/* Right Column: Output */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <RefreshCw size={48} className={`text-slate-300 ${loading ? 'animate-spin' : ''}`} />
              </div>
              <h3 className="text-lg font-medium text-slate-600">Waiting for input</h3>
              <p className="text-sm max-w-xs mt-2">Paste your code containing conflict markers on the left and hit Resolve.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-brand-600 mb-2 flex items-center gap-2">
                  <Check size={18} /> Analysis & Resolution
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">{result.explanation}</p>
              </div>

              <div className="flex-1 bg-[#0d1117] p-4 overflow-auto relative group">
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white rounded text-xs font-medium hover:bg-slate-600 transition-colors shadow-lg"
                  >
                    {copied ? <Check size={14} className="text-green-400"/> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy Full File"}
                  </button>
                </div>
                
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 sticky top-0 bg-[#0d1117] pb-2">Safe Preview</h4>
                <pre className="text-green-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {result.safePreview}
                </pre>
              </div>

              <div className="p-4 bg-white border-t border-slate-200 text-center">
                 <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                   <Check size={14} className="text-green-500" /> Ready to be applied. Copy the code above and replace your file content.
                 </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};