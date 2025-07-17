// Shared types for the AI Agent module

import { GitHubData } from "@/lib/github";

export type WeeklySummary = {
  Features: string[];
  Fixes: string[];
  Refactors: string[];
  Highlights?: string[]; // Optional high-impact work
  Notes?: string[]; // Free-form AI remarks
};

export type ActivityCategory =
  | "feature"
  | "fix"
  | "refactor"
  | "docs"
  | "test"
  | "chore"
  | "performance"
  | "security";

export interface CategorizedActivity {
  category: ActivityCategory;
  description: string;
  impact: "low" | "medium" | "high";
  source: "commit" | "pr" | "notion" | "manual";
  originalText: string;
}

export interface AIAgentInput {
  githubData: GitHubData;
  notionContent?: string;
  additionalContext?: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface AIAgentOutput {
  weeklySummary: WeeklySummary;
  categorizedActivities: CategorizedActivity[];
  metadata: {
    totalActivities: number;
    analysisTimestamp: string;
    confidenceScore?: number;
  };
}

export interface PromptContext {
  commits: string[];
  pullRequests: string[];
  notionContent?: string;
  additionalContext?: string;
  dateRange: string;
}

export interface ClassificationResult {
  category: ActivityCategory;
  confidence: number;
  reasoning: string;
}

export interface SummarizationResult {
  businessValue: string;
  technicalDetails: string;
  impact: "low" | "medium" | "high";
}
