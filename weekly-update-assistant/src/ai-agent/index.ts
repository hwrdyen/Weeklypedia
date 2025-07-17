// Main AI Agent entry point for Weekly Update Assistant

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AIAgentInput,
  AIAgentOutput,
  WeeklySummary,
  CategorizedActivity,
} from "./types";
import { PromptTemplates } from "./promptTemplates";
import { Categorizer } from "./categorizer";
import { Summarizer } from "./summarizer";
import { NotionProcessor } from "./notionProcessor";
import { geminiRateLimiter } from "./utils/rateLimiter";
import { Achievement } from "@/lib/ai";
import { serverLogManager } from "@/lib/serverLogManager";

export class WeeklyUpdateAIAgent {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private categorizer: Categorizer;
  private summarizer: Summarizer;
  private notionProcessor: NotionProcessor;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Google AI API key is not configured");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.categorizer = new Categorizer();
    this.summarizer = new Summarizer();
    this.notionProcessor = new NotionProcessor();
  }

  /**
   * Main analysis method - the primary interface for the AI agent
   */
  async analyzeActivity(input: AIAgentInput): Promise<AIAgentOutput> {
    try {
      serverLogManager.info("🤖 Starting AI Agent analysis...", "AI Agent");
      console.log("🤖 Starting AI Agent analysis...");

      // Step 1: Process all input sources
      serverLogManager.info("Processing all input sources", "AI Agent");
      const processedActivities = await this.processAllSources(input);

      // Step 2: Create comprehensive weekly summary
      serverLogManager.info(
        "Creating comprehensive weekly summary",
        "AI Agent"
      );
      const weeklySummary = await this.createComprehensiveSummary(
        input,
        processedActivities
      );

      // Step 3: Generate final output with metadata
      const output: AIAgentOutput = {
        weeklySummary,
        categorizedActivities: processedActivities,
        metadata: {
          totalActivities: processedActivities.length,
          analysisTimestamp: new Date().toISOString(),
          confidenceScore: this.calculateConfidenceScore(processedActivities),
        },
      };

      serverLogManager.success("✅ AI Agent analysis complete", "AI Agent");
      console.log("✅ AI Agent analysis complete");
      return output;
    } catch (error) {
      serverLogManager.error(
        `❌ AI Agent analysis failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "AI Agent"
      );
      console.error("❌ AI Agent analysis failed:", error);
      throw new Error(
        `AI Agent analysis failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Generate email content from the weekly summary - rate limited
   */
  async generateEmailContent(
    weeklySummary: WeeklySummary,
    dateRange: string
  ): Promise<string> {
    try {
      serverLogManager.info(
        "📧 Generating email content with rate limiting...",
        "Email Generation"
      );
      console.log("📧 Generating email content with rate limiting...");

      // Check rate limiter before making request
      const stats = geminiRateLimiter.getUsageStats();
      serverLogManager.info(
        `📊 Rate limiter stats: ${stats.current}/${stats.max} requests used`,
        "Rate Limiter"
      );
      console.log(
        `📊 Email generation - Rate limiter stats: ${stats.current}/${stats.max} requests used`
      );

      const prompt = PromptTemplates.getEmailGenerationPrompt(
        weeklySummary,
        dateRange
      );

      // Use rate limiter for the API call
      const result = await geminiRateLimiter.execute(async () => {
        serverLogManager.info(
          "Making AI API call for email generation",
          "AI Agent"
        );
        const response = await this.model.generateContent(prompt);
        return response.response.text().trim();
      });

      serverLogManager.success(
        "Email content generated successfully",
        "Email Generation"
      );
      return result;
    } catch (error) {
      serverLogManager.error(
        `Error generating email content: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "Email Generation"
      );
      console.error("Error generating email content:", error);

      // Fallback to basic email generation without AI
      serverLogManager.warning(
        "Using fallback email generation",
        "Email Generation"
      );
      return this.createBasicEmailFallback(weeklySummary, dateRange);
    }
  }

  /**
   * Create basic email without AI when rate limited
   */
  private createBasicEmailFallback(
    weeklySummary: WeeklySummary,
    dateRange: string
  ): string {
    const allAchievements = [
      ...weeklySummary.Features,
      ...weeklySummary.Fixes,
      ...weeklySummary.Refactors,
      ...(weeklySummary.Highlights || []),
      ...(weeklySummary.Notes || []),
    ];

    return `Subject: Weekly Update - ${dateRange}

Hi [Manager],

I wanted to share a quick update on my progress ${dateRange}:

${allAchievements.map((achievement) => `• ${achievement}`).join("\n")}

Please let me know if you have any questions or need additional details.

Best regards,
[Your name]`;
  }

  /**
   * Quick analysis method compatible with existing interface - optimized for rate limits
   */
  async quickAnalyze(
    githubData: any,
    additionalContext?: string,
    pdfFiles?: File[]
  ): Promise<Achievement[]> {
    try {
      serverLogManager.info(
        "🎯 Using optimized single-call analysis to avoid rate limits...",
        "AI Agent"
      );
      console.log(
        "🎯 Using optimized single-call analysis to avoid rate limits..."
      );

      // Check rate limiter status
      const stats = geminiRateLimiter.getUsageStats();
      serverLogManager.info(
        `📊 Rate limiter stats: ${stats.current}/${stats.max} requests used, ${stats.remaining} remaining`,
        "Rate Limiter"
      );
      console.log(
        `📊 Rate limiter stats: ${stats.current}/${stats.max} requests used, ${stats.remaining} remaining`
      );

      // Use single comprehensive AI call instead of multiple calls
      const result = await this.optimizedSingleCallAnalysis(
        githubData,
        additionalContext,
        pdfFiles
      );

      serverLogManager.success(
        "Quick analysis completed successfully",
        "AI Agent"
      );
      return result;
    } catch (error) {
      serverLogManager.error(
        `Quick analysis failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "AI Agent"
      );
      console.error("Quick analysis failed:", error);
      throw error;
    }
  }

  /**
   * Optimized analysis that uses a single AI call instead of multiple sequential calls
   */
  private async optimizedSingleCallAnalysis(
    githubData: any,
    additionalContext?: string,
    pdfFiles?: File[]
  ): Promise<Achievement[]> {
    try {
      serverLogManager.info("Preparing input data for AI analysis", "AI Agent");

      // Prepare all input data
      const commits =
        githubData.commits?.map((commit: any) => commit.commit.message) || [];
      const pullRequests =
        githubData.pullRequests?.map((pr: any) => {
          const title = pr.title || "";
          const body = pr.body || "";
          return `PR #${pr.number}: ${title}${body ? ` - ${body}` : ""}`;
        }) || [];

      serverLogManager.info(
        `Prepared ${commits.length} commits and ${pullRequests.length} pull requests for analysis`,
        "AI Agent"
      );

      // Create comprehensive prompt that does categorization and summarization in one go
      const comprehensivePrompt = `
Analyze the following developer activity and create a comprehensive weekly summary with categorized achievements.

=== GITHUB COMMITS ===
${
  commits.length > 0
    ? commits.map((c: string) => `- ${c}`).join("\n")
    : "No commits found"
}

=== PULL REQUESTS ===
${
  pullRequests.length > 0
    ? pullRequests.map((pr: string) => `- ${pr}`).join("\n")
    : "No pull requests found"
}

${
  additionalContext
    ? `=== ADDITIONAL CONTEXT ===
${additionalContext}`
    : ""
}

${
  pdfFiles && pdfFiles.length > 0
    ? `=== UPLOADED FILES ===
PDF files: ${pdfFiles.map((f) => f.name).join(", ")}
Note: Acknowledge these files in your analysis as research/documentation work.`
    : ""
}

TASK: Create 5-12 professional achievements that:
1. Are written in past tense starting with action verbs
2. Use business-friendly language (no technical jargon)
3. Focus on value delivered to the organization
4. Cover different types of work (features, fixes, improvements, research)

IMPORTANT: If there are research documents or additional context, ensure to extract achievements from those sources as well.

OUTPUT FORMAT: Return ONLY a JSON array of achievement strings:
["Achievement 1", "Achievement 2", "Achievement 3", ...]

Each achievement should be clear, professional, and suitable for sharing with management.
`;

      // Make single rate-limited API call
      serverLogManager.info(
        "Making AI API call for comprehensive analysis",
        "AI Agent"
      );
      const result = await geminiRateLimiter.execute(async () => {
        const response = await this.model.generateContent(comprehensivePrompt);
        return response.response.text();
      });

      // Parse the response
      serverLogManager.info("Parsing AI response", "AI Agent");
      let cleanedText = result.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText
          .replace(/^```json\s*/, "")
          .replace(/\s*```$/, "");
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const achievements = JSON.parse(cleanedText) as string[];

      serverLogManager.success(
        `Successfully parsed ${achievements.length} achievements from AI response`,
        "AI Agent"
      );

      // Convert to required format
      return achievements.map((achievement, index) => ({
        id: `ai-optimized-${Date.now()}-${index}`,
        text: achievement,
        selected: true,
        source: "github" as const,
      }));
    } catch (error) {
      serverLogManager.error(
        `Optimized analysis failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "AI Agent"
      );
      console.error("Optimized analysis failed:", error);

      // Fallback to basic summary without additional AI calls
      serverLogManager.warning(
        "Using fallback achievement generation",
        "AI Agent"
      );
      return this.createBasicFallbackAchievements(
        githubData,
        additionalContext
      );
    }
  }

  /**
   * Create basic achievements without AI when all else fails
   */
  private createBasicFallbackAchievements(
    githubData: any,
    additionalContext?: string
  ): Achievement[] {
    const achievements: Achievement[] = [];
    let index = 0;

    if (githubData.commits && githubData.commits.length > 0) {
      achievements.push({
        id: `basic-${Date.now()}-${index++}`,
        text: `Completed ${githubData.commits.length} code commits with various improvements and updates.`,
        selected: true,
        source: "github" as const,
      });
    }

    if (githubData.pullRequests && githubData.pullRequests.length > 0) {
      achievements.push({
        id: `basic-${Date.now()}-${index++}`,
        text: `Submitted ${githubData.pullRequests.length} pull request(s) for code review and integration.`,
        selected: true,
        source: "github",
      });
    }

    if (additionalContext) {
      achievements.push({
        id: `basic-${Date.now()}-${index++}`,
        text: "Documented research findings and additional project context for team reference.",
        selected: true,
        source: "github",
      });
    }

    // Add at least one achievement if we have no data
    if (achievements.length === 0) {
      achievements.push({
        id: `basic-${Date.now()}-${index++}`,
        text: "Maintained ongoing development work and project documentation.",
        selected: true,
        source: "github",
      });
    }

    return achievements;
  }

  /**
   * Process all input sources (GitHub, Notion, additional content)
   */
  private async processAllSources(
    input: AIAgentInput
  ): Promise<CategorizedActivity[]> {
    const allActivities: CategorizedActivity[] = [];

    // Process GitHub commits
    if (input.githubData.commits && input.githubData.commits.length > 0) {
      const commitMessages = input.githubData.commits.map(
        (commit: any) => commit.commit.message
      );
      const commitActivities = await this.categorizer.classifyActivities(
        commitMessages,
        "commit"
      );
      allActivities.push(...commitActivities);
    }

    // Process GitHub pull requests
    if (
      input.githubData.pullRequests &&
      input.githubData.pullRequests.length > 0
    ) {
      const prDescriptions = input.githubData.pullRequests.map((pr: any) => {
        const title = pr.title || "";
        const body = pr.body || "";
        return `PR #${pr.number}: ${title}${body ? ` - ${body}` : ""}`;
      });
      const prActivities = await this.categorizer.classifyActivities(
        prDescriptions,
        "pr"
      );
      allActivities.push(...prActivities);
    }

    // Process Notion content
    if (input.notionContent) {
      const processed = await this.notionProcessor.processTextContent(
        input.notionContent
      );
      const notionAchievements =
        this.notionProcessor.convertToAchievements(processed);
      const notionActivities = await this.categorizer.classifyActivities(
        notionAchievements,
        "notion"
      );
      allActivities.push(...notionActivities);
    }

    // Process additional context
    if (input.additionalContext) {
      const processed = await this.notionProcessor.processTextContent(
        input.additionalContext
      );
      const contextAchievements =
        this.notionProcessor.convertToAchievements(processed);
      const contextActivities = await this.categorizer.classifyActivities(
        contextAchievements,
        "manual"
      );
      allActivities.push(...contextActivities);
    }

    return allActivities;
  }

  /**
   * Create comprehensive weekly summary
   */
  private async createComprehensiveSummary(
    input: AIAgentInput,
    activities: CategorizedActivity[]
  ): Promise<WeeklySummary> {
    const dateRange = `from ${new Date(
      input.dateRange.startDate
    ).toLocaleDateString()} to ${new Date(
      input.dateRange.endDate
    ).toLocaleDateString()}`;

    // Use the summarizer to create the main summary
    const summary = await this.summarizer.createWeeklySummary(
      input.githubData,
      input.notionContent,
      input.additionalContext,
      dateRange
    );

    // Enhance with additional processing
    const allActivityTexts = activities.map((a) => a.originalText);
    const highlights = await this.summarizer.extractHighlights(
      allActivityTexts
    );

    // Combine highlights if not already present
    if (
      highlights.length > 0 &&
      (!summary.Highlights || summary.Highlights.length === 0)
    ) {
      summary.Highlights = highlights;
    }

    // Add metadata notes if significant processing occurred
    if (activities.length > 10) {
      summary.Notes = summary.Notes || [];
      summary.Notes.push(
        `Analyzed ${activities.length} activities across multiple sources including GitHub commits, pull requests, and documentation.`
      );
    }

    return summary;
  }

  /**
   * Calculate confidence score based on data quality and quantity
   */
  private calculateConfidenceScore(activities: CategorizedActivity[]): number {
    if (activities.length === 0) return 0;

    let score = 0;
    const weights = {
      commit: 0.6,
      pr: 0.8,
      notion: 0.7,
      manual: 0.5,
    };

    // Base score from activity count
    score += Math.min(activities.length * 10, 60);

    // Quality score from source diversity
    const sources = new Set(activities.map((a) => a.source));
    score += sources.size * 10;

    // Impact score
    const highImpactCount = activities.filter(
      (a) => a.impact === "high"
    ).length;
    score += highImpactCount * 5;

    // Source quality weighting
    activities.forEach((activity) => {
      score += weights[activity.source] || 0.5;
    });

    return Math.min(Math.round(score), 100);
  }

  /**
   * Convert WeeklySummary to legacy Achievement format for backward compatibility
   */
  private convertToLegacyFormat(
    summary: WeeklySummary
  ): { id: string; text: string; selected: boolean; source: string }[] {
    const achievements: {
      id: string;
      text: string;
      selected: boolean;
      source: string;
    }[] = [];
    let index = 0;

    // Add Features
    summary.Features.forEach((feature) => {
      achievements.push({
        id: `ai-feature-${Date.now()}-${index++}`,
        text: feature,
        selected: true,
        source: "github",
      });
    });

    // Add Fixes
    summary.Fixes.forEach((fix) => {
      achievements.push({
        id: `ai-fix-${Date.now()}-${index++}`,
        text: fix,
        selected: true,
        source: "github",
      });
    });

    // Add Refactors
    summary.Refactors.forEach((refactor) => {
      achievements.push({
        id: `ai-refactor-${Date.now()}-${index++}`,
        text: refactor,
        selected: true,
        source: "github",
      });
    });

    // Add Highlights with special marking
    if (summary.Highlights) {
      summary.Highlights.forEach((highlight) => {
        achievements.push({
          id: `ai-highlight-${Date.now()}-${index++}`,
          text: `🌟 ${highlight}`,
          selected: true,
          source: "github",
        });
      });
    }

    // Add Notes
    if (summary.Notes) {
      summary.Notes.forEach((note) => {
        achievements.push({
          id: `ai-note-${Date.now()}-${index++}`,
          text: note,
          selected: true,
          source: "github",
        });
      });
    }

    return achievements;
  }

  /**
   * Get analysis statistics
   */
  getAnalysisStats(output: AIAgentOutput): {
    totalActivities: number;
    byCategory: Record<string, number>;
    bySource: Record<string, number>;
    byImpact: Record<string, number>;
  } {
    const byCategory: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byImpact: Record<string, number> = {};

    output.categorizedActivities.forEach((activity) => {
      byCategory[activity.category] = (byCategory[activity.category] || 0) + 1;
      bySource[activity.source] = (bySource[activity.source] || 0) + 1;
      byImpact[activity.impact] = (byImpact[activity.impact] || 0) + 1;
    });

    return {
      totalActivities: output.metadata.totalActivities,
      byCategory,
      bySource,
      byImpact,
    };
  }
}

// Export instances for easy use
export const aiAgent = new WeeklyUpdateAIAgent();

// Export all types and classes for advanced usage
export * from "./types";
export { PromptTemplates } from "./promptTemplates";
export { Categorizer } from "./categorizer";
export { Summarizer } from "./summarizer";
export { NotionProcessor } from "./notionProcessor";
