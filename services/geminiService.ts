import { GoogleGenAI, Type } from "@google/genai";
import { 
  RepoAnalysis, 
  Task, 
  ArchitectureDiagram, 
  CodeExplanation, 
  BugReport, 
  GeneratedPatch,
  MergeConflictResolution,
  IssueAnalysis,
  GithubIssue
} from "../types";
import { GEMINI_MODEL_FAST, GEMINI_MODEL_THINKING } from "../constants";

// Helper to get client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY not found in environment");
  return new GoogleGenAI({ apiKey });
};

// 1. Analyze Repository
export const analyzeRepository = async (
  fileList: string[], 
  contextFiles: { path: string, content: string }[]
): Promise<RepoAnalysis> => {
  const ai = getAiClient();
  
  const fileTreeStr = fileList.join('\n');
  const contextStr = contextFiles.map(f => `--- ${f.path} ---\n${f.content.substring(0, 5000)}`).join('\n\n');

  const prompt = `
    Analyze this GitHub repository structure and key file contents.
    
    File Tree:
    ${fileTreeStr}

    Key File Contents:
    ${contextStr}

    Provide a JSON response with:
    - techStack (array of strings)
    - summary (short paragraph)
    - architecture (description of high level architecture)
    - painPoints (list of potential issues)
    - improvements (list of suggested improvements)
  `;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL_FAST,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING },
          architecture: { type: Type.STRING },
          painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["techStack", "summary", "architecture", "painPoints", "improvements"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

// 2. Generate Tasks
export const generateTasks = async (analysis: RepoAnalysis, goal?: string): Promise<Task[]> => {
  const ai = getAiClient();
  const prompt = `
    Based on this repository analysis:
    ${JSON.stringify(analysis)}
    
    And this user goal (if any): "${goal || 'General improvements and cleanup'}"

    Generate a list of technical tasks for a developer.
  `;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL_FAST,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            complexity: { type: Type.STRING, enum: ["Simple", "Moderate", "Complex"] },
            status: { type: Type.STRING, enum: ["To Do"] }
          },
          required: ["id", "title", "description", "priority", "complexity", "status"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

// 3. Architecture Diagram (Mermaid)
export const generateArchitecture = async (fileList: string[], analysis: RepoAnalysis): Promise<ArchitectureDiagram> => {
  const ai = getAiClient();
  
  const prompt = `
    Create a high-level architecture diagram using Mermaid JS syntax based on this file structure and analysis.
    
    Analysis: ${analysis.summary}
    Files: ${fileList.slice(0, 100).join(', ')}...

    Guidelines:
    - Use "graph TD" only.
    - ENSURE a newline separates "graph TD" from the rest of the nodes.
    - NODE SYNTAX: Use id["Label Text"]. Example: API["API Server"]
    - EDGE SYNTAX: Use --> for arrow.
    - LABELED EDGES: Use -- "Label" -->. Example: A -- "Requests" --> B
    - PROHIBITED: Do NOT use colons for labels (e.g. A --> B : Label is INVALID).
    - STRICTLY avoid special characters in node IDs (use simple alphanumeric like Node1, API, DB).
    - Labels MUST be wrapped in double quotes.
    - Do not use parentheses () inside labels unless strictly necessary, and they MUST be inside quotes.
    - Do not use subgraph unless necessary.
    - Output valid Mermaid syntax ONLY in the mermaidCode field.

    Return JSON with:
    - mermaidCode: The valid mermaid graph definition.
    - explanation: A brief text explaining the diagram.
  `;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL_FAST,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mermaidCode: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["mermaidCode", "explanation"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

// 4. Code Explainer
export const explainFile = async (path: string, content: string): Promise<CodeExplanation> => {
  const ai = getAiClient();
  const prompt = `
    Explain this source code file: ${path}
    
    Content:
    ${content.substring(0, 15000)} // Truncate to avoid limits if huge
    
    Return JSON structure detailed below.
  `;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL_THINKING,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          filePath: { type: Type.STRING },
          summary: { type: Type.STRING },
          dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
          functions: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: { name: { type: Type.STRING }, purpose: { type: Type.STRING } }
            } 
          },
          potentialIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

// 5. Bug Scanner
export const scanForBugs = async (files: {path: string, content: string}[]): Promise<BugReport[]> => {
  const ai = getAiClient();
  
  const filesStr = files.map(f => `File: ${f.path}\n${f.content.substring(0, 3000)}`).join('\n\n---\n\n');

  const prompt = `
    Scan these files for bugs, security risks, code smells, or anti-patterns.
    
    Files:
    ${filesStr}

    Return a list of specific issues found.
  `;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL_THINKING,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            filePath: { type: Type.STRING },
            lineNumber: { type: Type.INTEGER },
            issueType: { type: Type.STRING, enum: ["Bug", "Security", "Code Smell", "Anti-Pattern"] },
            description: { type: Type.STRING },
            suggestion: { type: Type.STRING },
            severity: { type: Type.STRING, enum: ["Critical", "Major", "Minor"] }
          },
          required: ["id", "filePath", "issueType", "description", "suggestion", "severity"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

// 6. Auto PR Creator
export const createPRPatch = async (task: Task | BugReport, relatedFileContent: string, relatedFilePath: string): Promise<GeneratedPatch> => {
  const ai = getAiClient();
  
  const issueTitle = 'title' in task ? task.title : task.issueType;

  const prompt = `
    Generate a git patch to fix/implement the following:
    
    Task/Issue: ${issueTitle} - ${task.description}
    File to modify: ${relatedFilePath}
    Current Content:
    ${relatedFileContent}

    Output JSON with:
    - description: PR Body text
    - commitMessage: Short commit message
    - diff: The Unified Diff string ready to be applied.
  `;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL_THINKING,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          commitMessage: { type: Type.STRING },
          diff: { type: Type.STRING }
        },
        required: ["description", "commitMessage", "diff"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

// 7. AI Merge Conflict Resolver
export const resolveMergeConflict = async (fileContent: string): Promise<MergeConflictResolution> => {
  const ai = getAiClient();

  const prompt = `
    You are an expert software engineer resolving a git merge conflict.
    
    The input text contains Git conflict markers (<<<<<<<, =======, >>>>>>>).
    
    Your task:
    1. Identify the conflicting sections.
    2. Understand the intent of both the HEAD changes and the incoming changes.
    3. Create a resolved version that logically combines both changes if possible, or chooses the safest path if they are mutually exclusive.
    4. Provide a human-readable explanation of the conflict and your resolution strategy.

    Input Code:
    ${fileContent}

    Output JSON:
    - explanation: Clear text explaining the conflict and how you resolved it.
    - suggestedResolution: The isolated code block of the resolution (without markers).
    - safePreview: The FULL file content with the conflict markers replaced by your resolution.
  `;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL_THINKING,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          suggestedResolution: { type: Type.STRING },
          safePreview: { type: Type.STRING }
        },
        required: ["explanation", "suggestedResolution", "safePreview"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

// 8. Analyze GitHub Issue
export const analyzeGithubIssue = async (issue: GithubIssue, repoContext: string): Promise<IssueAnalysis> => {
  const ai = getAiClient();

  const prompt = `
    Analyze this GitHub Issue for a software repository.
    
    Issue Title: ${issue.title}
    Issue Body: ${issue.body}
    
    Repo Context Summary: ${repoContext}

    Your goal is to help a developer fix this.
    1. Explain what the issue likely means in simple terms.
    2. Identify the likely Root Cause of the issue based on standard software patterns.
    3. Provide step-by-step instructions on how to investigate and fix it.
    4. Assess the priority.
    5. Provide a specific, actionable code patch or git diff if enough context is available. If not, provide a code snippet illustrating the fix.

    Output JSON:
    - explanation: The human readable explanation.
    - rootCause: A specific sentence identifying the technical root cause (e.g. "Race condition in state management").
    - fixSteps: Array of strings, each being a step.
    - suggestedPatch: A code block or description of code changes (or "N/A" if not code related).
    - priority: High, Medium, or Low.
  `;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL_THINKING,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          rootCause: { type: Type.STRING },
          fixSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedPatch: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
        },
        required: ["explanation", "rootCause", "fixSteps", "priority"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

// 9. Generate New Repo Issues
export const generateRepoIssues = async (repoContext: string, goal: string): Promise<GithubIssue[]> => {
  const ai = getAiClient();
  
  const prompt = `
    Scan the following repository analysis and generate new potential GitHub Issues.
    
    Repo Context: ${repoContext}
    Goal: ${goal} (e.g. "Find missing docs", "Detect bugs", "Cleanup code")

    Create realistic, high-quality GitHub issues that a maintainer would appreciate.

    Output a JSON array of issues.
    For each issue:
    - title: Clear title
    - body: Detailed markdown description
    - labels: Array of label objects with 'name' and 'color' (e.g. {name: "bug", color: "ff0000"})
  `;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL_FAST,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            body: { type: Type.STRING },
            labels: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: { name: { type: Type.STRING }, color: { type: Type.STRING } }
              } 
            }
          },
          required: ["title", "body", "labels"]
        }
      }
    }
  });

  const partialIssues = JSON.parse(response.text || "[]");
  
  // Hydrate with mock data for display
  return partialIssues.map((p: any, i: number) => ({
    ...p,
    number: 9000 + i, // Fake number
    state: 'open',
    html_url: '#',
    user: { login: 'DevPilotAI', avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' },
    created_at: new Date().toISOString()
  }));
};