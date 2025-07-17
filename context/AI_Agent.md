# AI Agent – Weekly Update Assistant

This module implements the AI agent responsible for analyzing developer activity (e.g., GitHub commits, PRs, and Notion docs) and generating structured summaries suitable for weekly update emails.

## 🧠 Purpose

Automates the transformation of raw Git activity and developer notes into digestible, non-technical summaries that form the core of a professional weekly update email.

---

## 📁 Folder Structure

/ai-agent
├── index.ts # Entry point for AI logic
├── promptTemplates.ts # Prompt templates for LLM input
├── summarizer.ts # Commit & PR summarization logic
├── categorizer.ts # Classifies changes into Features, Fixes, Refactors, etc.
├── notionProcessor.ts # Preprocesses Notion input (optional)
└── types.ts # Shared types/interfaces

---

## ⚙️ Tech Stack

- **Framework:** Node.js with TypeScript
- **AI Model:** Google Gemini Pro (via `@google/generative-ai`)
- **Prompt Framework:** Optional LangChain.js for orchestration
- **Used in:** A Next.js-based full-stack web application

---

## 🧩 Agent Responsibilities

### ✅ Input

- GitHub commits and pull request descriptions
- Optional: Notion page content or pasted weekly notes

### 🎯 Output

```ts
type WeeklySummary = {
  Features: string[];
  Fixes: string[];
  Refactors: string[];
  Highlights?: string[]; // Optional high-impact work
  Notes?: string[]; // Free-form AI remarks
};
```
