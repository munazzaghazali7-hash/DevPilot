import { FileNode, RepoStructure, GithubIssue } from '../types';

const BASE_URL = 'https://api.github.com/repos';

// Helper to parse GitHub URL
export const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const cleaned = url.replace('https://github.com/', '').replace(/\/$/, '');
    const parts = cleaned.split('/');
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  } catch (e) {
    return null;
  }
  return null;
};

// Fetch repository file structure (Recursive tree)
// Note: recursive=1 allows us to get the whole tree.
export const fetchRepoStructure = async (owner: string, repo: string): Promise<RepoStructure> => {
  const response = await fetch(`${BASE_URL}/${owner}/${repo}/git/trees/main?recursive=1`);
  
  if (!response.ok) {
     // Try master if main fails
     const retry = await fetch(`${BASE_URL}/${owner}/${repo}/git/trees/master?recursive=1`);
     if (!retry.ok) {
       throw new Error(`Failed to fetch repository: ${retry.statusText}`);
     }
     return processTree(retry, owner, repo);
  }

  return processTree(response, owner, repo);
};

const processTree = async (response: Response, owner: string, repo: string): Promise<RepoStructure> => {
  const data = await response.json();
  
  // Filter and map to our FileNode structure
  // Limit to 200 files to avoid context window explosion in this demo
  const files: FileNode[] = (data.tree || [])
    .filter((item: any) => item.type === 'blob') // only files
    .slice(0, 300) 
    .map((item: any) => ({
      path: item.path,
      type: 'file',
      url: item.url, // This is the git blob URL, we need raw content usually
    }));

  return {
    owner,
    repo,
    files,
    rawTree: data.tree
  };
};

export const fetchFileContent = async (owner: string, repo: string, path: string): Promise<string> => {
  // Use raw.githubusercontent.com for raw text to avoid API JSON wrapping
  const response = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/${path}`);
  if (!response.ok) {
     // Try main
     const retry = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`);
     if (!retry.ok) throw new Error("Could not fetch file content");
     return await retry.text();
  }
  return await response.text();
};

export const fetchRepoIssues = async (owner: string, repo: string): Promise<GithubIssue[]> => {
  const response = await fetch(`${BASE_URL}/${owner}/${repo}/issues?state=open&per_page=50`);
  if (!response.ok) {
    throw new Error(`Failed to fetch issues: ${response.statusText}`);
  }
  const data = await response.json();
  
  // Filter out Pull Requests (GitHub API returns PRs as issues)
  return data.filter((issue: any) => !issue.pull_request).map((issue: any) => ({
    number: issue.number,
    title: issue.title,
    body: issue.body || "No description provided.",
    state: issue.state,
    html_url: issue.html_url,
    labels: issue.labels.map((l: any) => ({ name: l.name, color: l.color })),
    user: { login: issue.user.login, avatar_url: issue.user.avatar_url },
    created_at: issue.created_at,
  }));
};