// Data Models

export interface FileNode {
  path: string;
  type: 'file' | 'dir';
  url: string; // API URL to fetch content
  content?: string; // Loaded lazily
}

export interface RepoStructure {
  owner: string;
  repo: string;
  files: FileNode[];
  rawTree: any[];
}

export interface RepoAnalysis {
  techStack: string[];
  summary: string;
  architecture: string;
  painPoints: string[];
  improvements: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  complexity: 'Simple' | 'Moderate' | 'Complex';
  status: 'To Do' | 'In Progress' | 'Done';
}

export interface BugReport {
  id: string;
  filePath: string;
  lineNumber?: number;
  issueType: 'Bug' | 'Security' | 'Code Smell' | 'Anti-Pattern';
  description: string;
  suggestion: string;
  severity: 'Critical' | 'Major' | 'Minor';
}

export interface ArchitectureDiagram {
  mermaidCode: string;
  explanation: string;
}

export interface CodeExplanation {
  filePath: string;
  summary: string;
  dependencies: string[];
  functions: { name: string; purpose: string }[];
  potentialIssues: string[];
}

export interface GeneratedPatch {
  description: string;
  commitMessage: string;
  diff: string;
}

export interface MergeConflictResolution {
  explanation: string;
  suggestedResolution: string; // The specific merged block
  safePreview: string; // The full file content
}

export interface GithubIssue {
  number: number;
  title: string;
  body: string;
  state: string;
  html_url: string;
  labels: { name: string; color: string }[];
  user: { login: string; avatar_url: string };
  created_at: string;
  aiAnalysis?: IssueAnalysis; // Optional field for AI data
}

export interface IssueAnalysis {
  explanation: string;
  rootCause: string;
  fixSteps: string[];
  suggestedPatch: string;
  priority: 'High' | 'Medium' | 'Low';
}

// Service Response Types
export interface AnalyzeRepoResponse {
  analysis: RepoAnalysis;
  initialTasks: Task[];
}