import React from 'react';
import { useAppStore } from '../store';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import { Github, PlayCircle, BarChart, CircleDot } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentRepo, analysis, tasks, bugs } = useAppStore();

  if (!currentRepo) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <div className="bg-brand-50 p-6 rounded-full mb-6">
          <Github size={64} className="text-brand-600" />
        </div>
        <h2 className="text-4xl font-bold text-slate-900 mb-4">Welcome to DevPilot</h2>
        <p className="text-lg text-slate-600 max-w-2xl mb-8">
          Your AI-powered coding companion. Connect a GitHub repository to analyze architecture, generate tasks, find bugs, and auto-create PRs.
        </p>
        <Link 
          to={ROUTES.ANALYZER} 
          className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <PlayCircle size={24} />
          <span>Start Analysis</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500">Overview of <span className="font-mono text-brand-600 font-bold">{currentRepo.owner}/{currentRepo.repo}</span></p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1">Total Files Scanned</div>
          <div className="text-3xl font-bold text-slate-800">{currentRepo.files.length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1">Generated Tasks</div>
          <div className="text-3xl font-bold text-blue-600">{tasks.length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1">Detected Issues</div>
          <div className="text-3xl font-bold text-red-600">{bugs.length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1">Tech Stack</div>
          <div className="flex flex-wrap gap-1 mt-2">
             {analysis?.techStack.slice(0, 3).map(t => (
               <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{t}</span>
             ))}
             {(analysis?.techStack.length || 0) > 3 && <span className="text-xs text-slate-400">+{ (analysis?.techStack.length || 0) - 3}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Analysis Summary */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
             <BarChart size={20} className="text-brand-500"/> Analysis Summary
           </h3>
           <p className="text-slate-600 leading-relaxed text-sm">
             {analysis?.summary || "No analysis available yet."}
           </p>
           <div className="mt-4 pt-4 border-t border-slate-100">
             <h4 className="text-sm font-semibold text-slate-700 mb-2">Key Pain Points</h4>
             <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
               {analysis?.painPoints.slice(0, 3).map((p, i) => (
                 <li key={i}>{p}</li>
               ))}
             </ul>
           </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
             <Link to={ROUTES.ISSUES} className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-100 transition-colors text-center col-span-2">
               <div className="flex justify-center mb-1"><CircleDot size={24} className="text-purple-600" /></div>
               <div className="text-purple-600 font-semibold">Issues Intelligence</div>
               <div className="text-purple-400 text-xs">AI Root Cause & Fixes</div>
             </Link>
             <Link to={ROUTES.TASKS} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors text-center">
               <div className="text-blue-600 font-semibold">View Tasks</div>
               <div className="text-blue-400 text-xs">Manage project roadmap</div>
             </Link>
             <Link to={ROUTES.BUGS} className="p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 transition-colors text-center">
               <div className="text-red-600 font-semibold">Fix Bugs</div>
               <div className="text-red-400 text-xs">Review {bugs.length} issues</div>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};