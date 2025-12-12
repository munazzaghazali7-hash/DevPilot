import React, { useState } from 'react';
import { useAppStore } from '../store';
import { generateTasks } from '../services/geminiService';
import { Loader2, Plus, ArrowRight } from 'lucide-react';
import { Task } from '../types';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

export const TaskManager: React.FC = () => {
  const { analysis, tasks, setTasks } = useAppStore();
  const [generating, setGenerating] = useState(false);
  const [goal, setGoal] = useState('');

  const handleGenerateMore = async () => {
    if (!analysis) return;
    setGenerating(true);
    try {
      const newTasks = await generateTasks(analysis, goal);
      setTasks([...tasks, ...newTasks]);
      setGoal('');
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getComplexityColor = (c: string) => {
    switch (c) {
      case 'Complex': return 'text-purple-600';
      case 'Moderate': return 'text-blue-600';
      default: return 'text-slate-600';
    }
  };

  if (!analysis) {
     return <div className="text-center mt-20 text-slate-500">Please analyze a repository first.</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Task Generator</h2>
          <p className="text-slate-500">AI-suggested roadmap based on codebase analysis</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex gap-4">
        <input 
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Enter a specific goal (e.g., 'Improve test coverage' or 'Migrate to TypeScript')"
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
        />
        <button 
          onClick={handleGenerateMore}
          disabled={generating}
          className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:opacity-70"
        >
          {generating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
          Generate Tasks
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
        {tasks.map((task, idx) => (
          <div key={idx} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex justify-between items-start mb-3">
               <span className={`text-xs font-bold px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                 {task.priority} Priority
               </span>
               <span className={`text-xs font-medium ${getComplexityColor(task.complexity)}`}>
                 {task.complexity}
               </span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">{task.title}</h3>
            <p className="text-sm text-slate-600 mb-4 flex-1">{task.description}</p>
            
            <div className="pt-4 border-t border-slate-100 mt-auto flex justify-end">
               <Link 
                 to={`${ROUTES.PR}?taskId=${task.id || idx}`} 
                 state={{ task }}
                 className="text-sm text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1"
               >
                 Draft PR <ArrowRight size={14} />
               </Link>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
           <div className="col-span-3 text-center py-10 text-slate-400">
             No tasks generated yet. Try adding a goal above.
           </div>
        )}
      </div>
    </div>
  );
};