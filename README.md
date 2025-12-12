# DevPilot 🚀

> **AI-Powered Full-Stack Developer Assistant**

DevPilot is an intelligent coding companion that leverages Google's **Gemini 2.5** models to accelerate the software development lifecycle. From analyzing complex repositories to generating production-ready pull requests, DevPilot acts as a senior engineer pair-programmer that understands your codebase.

## ✨ Key Features

### 🔍 Deep Repository Analysis
- **Instant Onboarding**: Paste any GitHub URL to get an immediate breakdown of the tech stack, architecture, and code health.
- **Context Awareness**: Analyzes key configuration files and structure to understand the project's DNA.

### 🗺️ Architecture Visualization
- **Mermaid.js Diagrams**: Automatically generates live flowcharts and diagrams representing the system architecture.
- **System Explanations**: Provides natural language descriptions of data flow and component interactions.

### 📋 Intelligent Task Management
- **Smart Roadmap**: Generates prioritized technical tasks based on codebase analysis.
- **Goal-Oriented**: Create tasks based on specific goals like "Improve Security" or "Migrate to TypeScript".

### 🐛 Bug & Security Scanner
- **Static Analysis**: Scans code for security vulnerabilities, race conditions, and anti-patterns.
- **Fix Suggestions**: Provides concrete refactoring advice and severity ratings.

### 🛠️ Auto PR Generator
- **Patch Creation**: Generates complete git patches (diffs) for tasks or bugs.
- **Commit Metadata**: writes professional commit messages and PR descriptions automatically.

### 🚑 AutoPacify (Merge Doctor)
- **Conflict Resolution**: Pasting a file with git conflict markers (`<<<<<<<`) prompts DevPilot to analyze intent and generate a merged version.

### 🐞 Issues Intelligence
- **GitHub Integration**: Fetches open issues and performs root cause analysis.
- **Fix Strategies**: Suggests step-by-step fixes and code snippets for existing issues.

## 🛠️ Technology Stack

- **Core**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Engine**: Google GenAI SDK (`@google/genai`)
  - Uses `gemini-2.5-flash` for high-speed analysis and reasoning.
- **Routing**: React Router DOM
- **Visualization**: Mermaid.js

## 🚀 Getting Started

1. **Configuration**: The app requires a valid Google Gemini API Key provided via `process.env.API_KEY`.
2. **Launch**: Open the application in your preferred environment.
3. **Analyze**: Navigate to the **Repo Analyzer** tab and enter a GitHub repository URL (e.g., `facebook/react`).

## 📄 License

MIT License. Built with ❤️.