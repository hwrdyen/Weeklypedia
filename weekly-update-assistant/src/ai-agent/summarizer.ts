// Summarizer module for commit & PR summarization logic

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GitHubData } from "@/lib/github";
import {
  WeeklySummary,
  CategorizedActivity,
  SummarizationResult,
} from "./types";
import { PromptTemplates } from "./promptTemplates";
import { Categorizer } from "./categorizer";

export class Summarizer {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private categorizer: Categorizer;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Google AI API key is not configured");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.categorizer = new Categorizer();
  }

  /**
   * Summarize GitHub commits into business-friendly descriptions
   */
  async summarizeCommits(commits: any[]): Promise<string[]> {
    if (!commits || commits.length === 0) {
      return [];
    }

    const commitMessages = commits.map((commit: any) => commit.commit.message);

    // Use categorizer to group similar commits
    const categorizedActivities = await this.categorizer.classifyActivities(
      commitMessages,
      "commit"
    );

    // Group by category and summarize each group
    const grouped = this.categorizer.groupByCategory(categorizedActivities);
    const summaries: string[] = [];

    for (const [category, activities] of Object.entries(grouped)) {
      if (activities.length > 0) {
        const summary = await this.summarizeActivityGroup(
          activities.map((a) => a.originalText),
          category
        );
        if (summary) {
          summaries.push(summary);
        }
      }
    }

    return summaries;
  }

  /**
   * Summarize GitHub pull requests into business-friendly descriptions
   */
  async summarizePullRequests(pullRequests: any[]): Promise<string[]> {
    if (!pullRequests || pullRequests.length === 0) {
      return [];
    }

    const prDescriptions = pullRequests.map((pr) => {
      const title = pr.title || "";
      const body = pr.body || "";
      return `PR #${pr.number}: ${title}${body ? ` - ${body}` : ""}`;
    });

    // Use categorizer to group similar PRs
    const categorizedActivities = await this.categorizer.classifyActivities(
      prDescriptions,
      "pr"
    );

    // Group by category and summarize each group
    const grouped = this.categorizer.groupByCategory(categorizedActivities);
    const summaries: string[] = [];

    for (const [category, activities] of Object.entries(grouped)) {
      if (activities.length > 0) {
        const summary = await this.summarizeActivityGroup(
          activities.map((a) => a.originalText),
          category
        );
        if (summary) {
          summaries.push(summary);
        }
      }
    }

    return summaries;
  }

  /**
   * Create a comprehensive weekly summary from all activities
   */
  async createWeeklySummary(
    githubData: GitHubData,
    notionContent?: string,
    additionalContext?: string,
    dateRange?: string
  ): Promise<WeeklySummary> {
    const commits = githubData.commits || [];
    const pullRequests = githubData.pullRequests || [];

    // Extract activities
    const commitMessages = commits.map((commit: any) => commit.commit.message);
    const prDescriptions = pullRequests.map((pr: any) => {
      const title = pr.title || "";
      const body = pr.body || "";
      return `PR #${pr.number}: ${title}${body ? ` - ${body}` : ""}`;
    });

    // Combine all activities
    const allActivities = [...commitMessages, ...prDescriptions];

    // If we have additional content, extract activities from it
    if (notionContent || additionalContext) {
      const additionalActivities = await this.extractActivitiesFromContent(
        notionContent || additionalContext || ""
      );
      allActivities.push(...additionalActivities);
    }

    // Use AI to create structured summary
    const summary = await this.generateStructuredSummary(
      allActivities,
      dateRange || "this week"
    );

    return summary;
  }

  /**
   * Combine and deduplicate similar activities
   */
  async combineRelatedActivities(
    activities: CategorizedActivity[]
  ): Promise<string[]> {
    const grouped = this.categorizer.groupByCategory(activities);
    const combined: string[] = [];

    for (const [category, categoryActivities] of Object.entries(grouped)) {
      if (categoryActivities.length === 0) continue;

      if (categoryActivities.length === 1) {
        combined.push(categoryActivities[0].description);
      } else {
        // Combine multiple activities of the same category
        const summary = await this.summarizeActivityGroup(
          categoryActivities.map((a) => a.originalText),
          category
        );
        if (summary) {
          combined.push(summary);
        }
      }
    }

    return combined;
  }

  /**
   * Extract the most impactful activities for highlights
   */
  async extractHighlights(allActivities: string[]): Promise<string[]> {
    if (allActivities.length === 0) {
      return [];
    }

    try {
      const prompt = PromptTemplates.getHighlightsPrompt(allActivities);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      // Parse JSON response
      const highlights = JSON.parse(text) as string[];
      return highlights.filter((h) => h && h.trim().length > 0);
    } catch (error) {
      console.error("Error extracting highlights:", error);

      // Fallback: select high-impact activities based on keywords
      return this.fallbackHighlightExtraction(allActivities);
    }
  }

  /**
   * Summarize a group of similar activities
   */
  private async summarizeActivityGroup(
    activities: string[],
    category: string
  ): Promise<string | null> {
    if (activities.length === 0) return null;
    if (activities.length === 1)
      return this.cleanActivityDescription(activities[0]);

    try {
      const prompt = PromptTemplates.getSummarizationPrompt(
        activities,
        category
      );
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("Error summarizing activity group:", error);
      // Fallback: return first activity, cleaned up
      return this.cleanActivityDescription(activities[0]);
    }
  }

  /**
   * Generate structured summary using AI
   */
  private async generateStructuredSummary(
    activities: string[],
    dateRange: string
  ): Promise<WeeklySummary> {
    if (activities.length === 0) {
      return {
        Features: [],
        Fixes: [],
        Refactors: [],
        Highlights: [],
        Notes: [],
      };
    }

    try {
      // Create prompt context
      const promptContext = {
        commits: activities.filter((a) => !a.startsWith("PR #")),
        pullRequests: activities.filter((a) => a.startsWith("PR #")),
        dateRange: dateRange,
      };

      const prompt = PromptTemplates.getAnalysisPrompt(promptContext);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      // Clean up response and parse JSON
      let cleanedText = text;
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText
          .replace(/^```json\s*/, "")
          .replace(/\s*```$/, "");
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const summary = JSON.parse(cleanedText) as WeeklySummary;

      // Validate and clean the summary
      return this.validateAndCleanSummary(summary);
    } catch (error) {
      console.error("Error generating structured summary:", error);

      // Fallback: use categorizer to create basic summary
      return this.fallbackStructuredSummary(activities);
    }
  }

  /**
   * Extract activities from additional content (Notion, text files, etc.)
   */
  private async extractActivitiesFromContent(
    content: string
  ): Promise<string[]> {
    if (!content || content.trim().length === 0) {
      return [];
    }

    try {
      const prompt = PromptTemplates.getNotionProcessingPrompt(content);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      const activities = JSON.parse(text) as string[];
      return activities.filter((a) => a && a.trim().length > 0);
    } catch (error) {
      console.error("Error extracting activities from content:", error);
      // Fallback: split content into logical chunks
      return this.fallbackContentExtraction(content);
    }
  }

  /**
   * Clean and format activity description
   */
  private cleanActivityDescription(activity: string): string {
    let cleaned = activity
      .replace(
        /^(feat|fix|refactor|docs|test|chore|style|perf|security):\s*/i,
        ""
      )
      .replace(/^PR #\d+:\s*/, "")
      .trim();

    // Capitalize first letter
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

    // Ensure proper punctuation
    if (
      !cleaned.endsWith(".") &&
      !cleaned.endsWith("!") &&
      !cleaned.endsWith("?")
    ) {
      cleaned += ".";
    }

    return cleaned;
  }

  /**
   * Fallback method for extracting highlights
   */
  private fallbackHighlightExtraction(activities: string[]): string[] {
    const highlights: string[] = [];
    const highImpactKeywords = [
      "major",
      "significant",
      "critical",
      "important",
      "milestone",
      "launch",
      "release",
      "performance",
      "security",
      "breaking",
    ];

    for (const activity of activities) {
      const text = activity.toLowerCase();
      if (highImpactKeywords.some((keyword) => text.includes(keyword))) {
        highlights.push(this.cleanActivityDescription(activity));
        if (highlights.length >= 3) break; // Limit to top 3
      }
    }

    return highlights;
  }

  /**
   * Fallback method for creating structured summary
   */
  private async fallbackStructuredSummary(
    activities: string[]
  ): Promise<WeeklySummary> {
    const categorizedActivities = await this.categorizer.classifyActivities(
      activities
    );
    const mapped = this.categorizer.mapToWeeklySummaryCategories(
      this.categorizer.groupByCategory(categorizedActivities)
    );

    return {
      Features: mapped.Features,
      Fixes: mapped.Fixes,
      Refactors: mapped.Refactors,
      Highlights: await this.extractHighlights(activities),
      Notes: [],
    };
  }

  /**
   * Fallback method for content extraction
   */
  private fallbackContentExtraction(content: string): string[] {
    // Split content by common separators and extract meaningful chunks
    const chunks = content
      .split(/\n+|\. |\! |\? |;/)
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 20) // Filter out very short chunks
      .slice(0, 5); // Limit to first 5 chunks

    return chunks.map((chunk) => this.cleanActivityDescription(chunk));
  }

  /**
   * Validate and clean the AI-generated summary
   */
  private validateAndCleanSummary(summary: any): WeeklySummary {
    return {
      Features: Array.isArray(summary.Features)
        ? summary.Features.filter((f: string) => f && f.trim())
        : [],
      Fixes: Array.isArray(summary.Fixes)
        ? summary.Fixes.filter((f: string) => f && f.trim())
        : [],
      Refactors: Array.isArray(summary.Refactors)
        ? summary.Refactors.filter((f: string) => f && f.trim())
        : [],
      Highlights: Array.isArray(summary.Highlights)
        ? summary.Highlights.filter((f: string) => f && f.trim())
        : [],
      Notes: Array.isArray(summary.Notes)
        ? summary.Notes.filter((f: string) => f && f.trim())
        : [],
    };
  }
}
