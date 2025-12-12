import React, { createContext, useContext, useState, useEffect } from 'react';
import { RepoStructure, RepoAnalysis, Task, BugReport, GithubIssue } from './types';

interface AppState {
  currentRepo: RepoStructure | null;
  analysis: RepoAnalysis | null;
  tasks: Task[];
  bugs: BugReport[];
  issues: GithubIssue[];
  setCurrentRepo: (repo: RepoStructure) => void;
  setAnalysis: (analysis: RepoAnalysis) => void;
  setTasks: (tasks: Task[]) => void;
  setBugs: (bugs: BugReport[]) => void;
  setIssues: (issues: GithubIssue[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRepo, setCurrentRepo] = useState<RepoStructure | null>(() => {
    const saved = localStorage.getItem('devpilot_repo');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(() => {
    const saved = localStorage.getItem('devpilot_analysis');
    return saved ? JSON.parse(saved) : null;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('devpilot_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [bugs, setBugs] = useState<BugReport[]>(() => {
    const saved = localStorage.getItem('devpilot_bugs');
    return saved ? JSON.parse(saved) : [];
  });

  const [issues, setIssues] = useState<GithubIssue[]>(() => {
    const saved = localStorage.getItem('devpilot_issues');
    return saved ? JSON.parse(saved) : [];
  });

  const [isLoading, setIsLoading] = useState(false);

  // Persistence
  useEffect(() => {
    if (currentRepo) localStorage.setItem('devpilot_repo', JSON.stringify(currentRepo));
  }, [currentRepo]);

  useEffect(() => {
    if (analysis) localStorage.setItem('devpilot_analysis', JSON.stringify(analysis));
  }, [analysis]);

  useEffect(() => {
    localStorage.setItem('devpilot_tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    localStorage.setItem('devpilot_bugs', JSON.stringify(bugs));
  }, [bugs]);

  useEffect(() => {
    localStorage.setItem('devpilot_issues', JSON.stringify(issues));
  }, [issues]);


  return (
    <AppContext.Provider value={{
      currentRepo,
      analysis,
      tasks,
      bugs,
      issues,
      setCurrentRepo,
      setAnalysis,
      setTasks,
      setBugs,
      setIssues,
      isLoading,
      setIsLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within AppProvider");
  return context;
};