import React, { useState } from 'react';
import { useAppStore } from '../store';
import { parseRepoUrl, fetchRepoStructure, fetchFileContent } from '../services/githubService';
import { analyzeRepository, generateTasks } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { ROUTES } from '../constants';

export const RepoAnalyzer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(''); // For loading messages
  const { setCurrentRepo, setAnalysis, setTasks, isLoading, setIsLoading } = useAppStore();
  const navigate = useNavigate();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const repoInfo = parseRepoUrl(url);
    
    if (!repoInfo) {
      setError("Invalid GitHub URL. Use format: https://github.com/owner/repo");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus('Fetching repository structure...');

    try {
      // 1. Fetch Tree
      const repoStructure = await fetchRepoStructure(repoInfo.owner, repoInfo.repo);
      setCurrentRepo(repoStructure);

      // 2. Fetch Key Context Files (README, package.json, etc.)
      setStatus('Reading key configuration files...');
      const contextFiles = [];
      const importantFiles = ['README.md', 'package.json', 'tsconfig.json', 'requirements.txt', 'go.mod', 'Cargo.toml'];
      
      for (const file of repoStructure.files) {
        if (importantFiles.includes(file.path.split('/').pop() || '') || file.path.length < 20) {
            // Limited fetch for demo speed
            if (contextFiles.length < 5) {
                try {
                    const content = await fetchFileContent(repoInfo.owner, repoInfo.repo, file.path);
                    contextFiles.push({ path: file.path, content });
                } catch (err) { console.warn(`Skipped ${file.path}`); }
            }
        }
      }

      // 3. Gemini Analysis
      setStatus('AI is analyzing codebase architecture...');
      const filePaths = repoStructure.files.map(f => f.path);
      const analysisResult = await analyzeRepository(filePaths, contextFiles);
      setAnalysis(analysisResult);

      // 4. Generate Initial Tasks
      setStatus('Generating initial project tasks...');
      const tasksResult = await generateTasks(analysisResult);
      setTasks(tasksResult);

      setStatus('Complete!');
      setTimeout(() => {
        setIsLoading(false);
        navigate(ROUTES.DASHBOARD);
      }, 500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Analyze Repository</h2>
        <p className="text-slate-500">
          Enter a public GitHub repository URL to let Gemini map the architecture, find bugs, and plan tasks.
        </p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">GitHub Repository URL</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/munazzaghazali7-hash/DevPilot"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading || !url}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
            {isLoading ? status : 'Start Analysis'}
          </button>
        </form>
      </div>

      <div className="mt-8">
        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 text-center">Examples</h4>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => setUrl("https://github.com/munazzaghazali7-hash/DevPilot")} className="px-3 py-1 bg-brand-50 border border-brand-200 rounded-full text-sm text-brand-700 hover:bg-brand-100 transition-colors font-medium">Your Repo</button>
          <button onClick={() => setUrl("https://github.com/facebook/react")} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-brand-300 hover:text-brand-600 transition-colors">facebook/react</button>
          <button onClick={() => setUrl("https://github.com/axios/axios")} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-brand-300 hover:text-brand-600 transition-colors">axios/axios</button>
          <button onClick={() => setUrl("https://github.com/airbnb/javascript")} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-brand-300 hover:text-brand-600 transition-colors">airbnb/javascript</button>
        </div>
      </div>
    </div>
  );
};