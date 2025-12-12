import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { RepoAnalyzer } from './pages/RepoAnalyzer';
import { TaskManager } from './pages/TaskManager';
import { Architecture } from './pages/Architecture';
import { CodeExplorer } from './pages/CodeExplorer';
import { BugScanner } from './pages/BugScanner';
import { PRGenerator } from './pages/PRGenerator';
import { MergeConflictResolver } from './pages/MergeConflictResolver';
import { IssuesIntelligence } from './pages/IssuesIntelligence';
import { ROUTES } from './constants';

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.ANALYZER} element={<RepoAnalyzer />} />
            <Route path={ROUTES.TASKS} element={<TaskManager />} />
            <Route path={ROUTES.ARCHITECTURE} element={<Architecture />} />
            <Route path={ROUTES.CODE} element={<CodeExplorer />} />
            <Route path={ROUTES.BUGS} element={<BugScanner />} />
            <Route path={ROUTES.ISSUES} element={<IssuesIntelligence />} />
            <Route path={ROUTES.PR} element={<PRGenerator />} />
            <Route path={ROUTES.MERGE_DOCTOR} element={<MergeConflictResolver />} />
            <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}

export default App;