// Categorizer module for classifying developer activities

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  ActivityCategory,
  ClassificationResult,
  CategorizedActivity,
} from "./types";
import { PromptTemplates } from "./promptTemplates";

export class Categorizer {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Google AI API key is not configured");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Classify a single activity into a category
   */
  async classifyActivity(activity: string): Promise<ActivityCategory> {
    try {
      const prompt = PromptTemplates.getClassificationPrompt(activity);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const classification = response.text().trim().toLowerCase();

      // Validate the classification result
      const validCategories: ActivityCategory[] = [
        "feature",
        "fix",
        "refactor",
        "docs",
        "test",
        "chore",
        "performance",
        "security",
      ];

      if (validCategories.includes(classification as ActivityCategory)) {
        return classification as ActivityCategory;
      }

      // Fallback classification based on keywords
      return this.fallbackClassification(activity);
    } catch (error) {
      console.error("Error classifying activity:", error);
      // Fallback to keyword-based classification
      return this.fallbackClassification(activity);
    }
  }

  /**
   * Classify multiple activities in batch
   */
  async classifyActivities(
    activities: string[],
    source: "commit" | "pr" | "notion" | "manual" = "commit"
  ): Promise<CategorizedActivity[]> {
    const categorizedActivities: CategorizedActivity[] = [];

    for (const activity of activities) {
      try {
        const category = await this.classifyActivity(activity);
        const impact = this.assessImpact(activity, category);
        const description = this.createBusinessDescription(activity, category);

        categorizedActivities.push({
          category,
          description,
          impact,
          source,
          originalText: activity,
        });
      } catch (error) {
        console.error(`Error processing activity: ${activity}`, error);
        // Add with fallback classification
        categorizedActivities.push({
          category: this.fallbackClassification(activity),
          description: this.createBusinessDescription(activity, "chore"),
          impact: "low",
          source,
          originalText: activity,
        });
      }
    }

    return categorizedActivities;
  }

  /**
   * Group categorized activities by their category
   */
  groupByCategory(
    activities: CategorizedActivity[]
  ): Record<ActivityCategory, CategorizedActivity[]> {
    const grouped: Record<ActivityCategory, CategorizedActivity[]> = {
      feature: [],
      fix: [],
      refactor: [],
      docs: [],
      test: [],
      chore: [],
      performance: [],
      security: [],
    };

    activities.forEach((activity) => {
      grouped[activity.category].push(activity);
    });

    return grouped;
  }

  /**
   * Map categories to WeeklySummary categories
   */
  mapToWeeklySummaryCategories(
    grouped: Record<ActivityCategory, CategorizedActivity[]>
  ): {
    Features: string[];
    Fixes: string[];
    Refactors: string[];
  } {
    return {
      Features: [
        ...grouped.feature.map((a) => a.description),
        ...grouped.performance.map((a) => a.description),
        ...grouped.security.map((a) => a.description),
      ],
      Fixes: grouped.fix.map((a) => a.description),
      Refactors: [
        ...grouped.refactor.map((a) => a.description),
        ...grouped.docs.map((a) => a.description),
        ...grouped.test.map((a) => a.description),
        ...grouped.chore.map((a) => a.description),
      ],
    };
  }

  /**
   * Fallback classification based on keywords when AI fails
   */
  private fallbackClassification(activity: string): ActivityCategory {
    const text = activity.toLowerCase();

    // Feature keywords
    if (
      text.includes("add") ||
      text.includes("implement") ||
      text.includes("create") ||
      text.includes("new") ||
      text.includes("feature") ||
      text.includes("enhance")
    ) {
      return "feature";
    }

    // Fix keywords
    if (
      text.includes("fix") ||
      text.includes("bug") ||
      text.includes("error") ||
      text.includes("issue") ||
      text.includes("resolve") ||
      text.includes("correct")
    ) {
      return "fix";
    }

    // Refactor keywords
    if (
      text.includes("refactor") ||
      text.includes("clean") ||
      text.includes("improve") ||
      text.includes("optimize") ||
      text.includes("restructure") ||
      text.includes("update")
    ) {
      return "refactor";
    }

    // Documentation keywords
    if (
      text.includes("doc") ||
      text.includes("readme") ||
      text.includes("comment") ||
      text.includes("documentation")
    ) {
      return "docs";
    }

    // Test keywords
    if (
      text.includes("test") ||
      text.includes("spec") ||
      text.includes("unit") ||
      text.includes("integration")
    ) {
      return "test";
    }

    // Performance keywords
    if (
      text.includes("performance") ||
      text.includes("speed") ||
      text.includes("cache") ||
      text.includes("memory")
    ) {
      return "performance";
    }

    // Security keywords
    if (
      text.includes("security") ||
      text.includes("auth") ||
      text.includes("permission") ||
      text.includes("vulnerability")
    ) {
      return "security";
    }

    // Default to chore
    return "chore";
  }

  /**
   * Assess the impact level of an activity
   */
  private assessImpact(
    activity: string,
    category: ActivityCategory
  ): "low" | "medium" | "high" {
    const text = activity.toLowerCase();

    // High impact indicators
    if (
      text.includes("major") ||
      text.includes("significant") ||
      text.includes("breaking") ||
      text.includes("critical") ||
      text.includes("important") ||
      text.includes("milestone") ||
      category === "security" ||
      category === "performance"
    ) {
      return "high";
    }

    // Medium impact indicators
    if (
      text.includes("improve") ||
      text.includes("enhance") ||
      text.includes("optimize") ||
      text.includes("feature") ||
      category === "feature" ||
      category === "fix"
    ) {
      return "medium";
    }

    // Default to low impact
    return "low";
  }

  /**
   * Create business-friendly description from technical activity
   */
  private createBusinessDescription(
    activity: string,
    category: ActivityCategory
  ): string {
    // Remove common technical prefixes and make more business-friendly
    let description = activity
      .replace(
        /^(feat|fix|refactor|docs|test|chore|style|perf|security):\s*/i,
        ""
      )
      .replace(/^(add|implement|create|update|fix|remove|delete):\s*/i, "")
      .trim();

    // Capitalize first letter
    description = description.charAt(0).toUpperCase() + description.slice(1);

    // Ensure it ends with appropriate punctuation
    if (
      !description.endsWith(".") &&
      !description.endsWith("!") &&
      !description.endsWith("?")
    ) {
      description += ".";
    }

    return description;
  }
}
