// Notion processor for preprocessing Notion input and other documents

import { GoogleGenerativeAI } from "@google/generative-ai";
import { PromptTemplates } from "./promptTemplates";

export interface ProcessedContent {
  achievements: string[];
  insights: string[];
  learnings: string[];
  metadata: {
    wordCount: number;
    processingTimestamp: string;
    contentType: "notion" | "markdown" | "text" | "pdf";
  };
}

export class NotionProcessor {
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
   * Process Notion content and extract meaningful accomplishments
   */
  async processNotionContent(content: string): Promise<ProcessedContent> {
    if (!content || content.trim().length === 0) {
      return this.createEmptyResult("notion");
    }

    const cleanedContent = this.cleanNotionContent(content);

    try {
      const achievements = await this.extractAchievements(cleanedContent);
      const insights = await this.extractInsights(cleanedContent);
      const learnings = await this.extractLearnings(cleanedContent);

      return {
        achievements,
        insights,
        learnings,
        metadata: {
          wordCount: cleanedContent.split(/\s+/).length,
          processingTimestamp: new Date().toISOString(),
          contentType: "notion",
        },
      };
    } catch (error) {
      console.error("Error processing Notion content:", error);
      // Fallback to basic extraction
      return this.fallbackProcessing(cleanedContent, "notion");
    }
  }

  /**
   * Process markdown content
   */
  async processMarkdownContent(content: string): Promise<ProcessedContent> {
    if (!content || content.trim().length === 0) {
      return this.createEmptyResult("markdown");
    }

    const cleanedContent = this.cleanMarkdownContent(content);

    try {
      const achievements = await this.extractAchievements(cleanedContent);
      const insights = await this.extractInsights(cleanedContent);
      const learnings = await this.extractLearnings(cleanedContent);

      return {
        achievements,
        insights,
        learnings,
        metadata: {
          wordCount: cleanedContent.split(/\s+/).length,
          processingTimestamp: new Date().toISOString(),
          contentType: "markdown",
        },
      };
    } catch (error) {
      console.error("Error processing markdown content:", error);
      return this.fallbackProcessing(cleanedContent, "markdown");
    }
  }

  /**
   * Process plain text content
   */
  async processTextContent(content: string): Promise<ProcessedContent> {
    if (!content || content.trim().length === 0) {
      return this.createEmptyResult("text");
    }

    const cleanedContent = this.cleanTextContent(content);

    try {
      const achievements = await this.extractAchievements(cleanedContent);
      const insights = await this.extractInsights(cleanedContent);
      const learnings = await this.extractLearnings(cleanedContent);

      return {
        achievements,
        insights,
        learnings,
        metadata: {
          wordCount: cleanedContent.split(/\s+/).length,
          processingTimestamp: new Date().toISOString(),
          contentType: "text",
        },
      };
    } catch (error) {
      console.error("Error processing text content:", error);
      return this.fallbackProcessing(cleanedContent, "text");
    }
  }

  /**
   * Process multiple content sources and combine results
   */
  async processMultipleContents(
    contents: { type: string; content: string }[]
  ): Promise<ProcessedContent> {
    const allAchievements: string[] = [];
    const allInsights: string[] = [];
    const allLearnings: string[] = [];
    let totalWordCount = 0;

    for (const { type, content } of contents) {
      let processed: ProcessedContent;

      switch (type.toLowerCase()) {
        case "notion":
          processed = await this.processNotionContent(content);
          break;
        case "markdown":
        case "md":
          processed = await this.processMarkdownContent(content);
          break;
        case "pdf":
          // PDF content is already extracted as text, process as text
          processed = await this.processTextContent(content);
          break;
        default:
          processed = await this.processTextContent(content);
      }

      allAchievements.push(...processed.achievements);
      allInsights.push(...processed.insights);
      allLearnings.push(...processed.learnings);
      totalWordCount += processed.metadata.wordCount;
    }

    // Deduplicate and prioritize results
    const uniqueAchievements = this.deduplicateAndPrioritize(allAchievements);
    const uniqueInsights = this.deduplicateAndPrioritize(allInsights);
    const uniqueLearnings = this.deduplicateAndPrioritize(allLearnings);

    return {
      achievements: uniqueAchievements,
      insights: uniqueInsights,
      learnings: uniqueLearnings,
      metadata: {
        wordCount: totalWordCount,
        processingTimestamp: new Date().toISOString(),
        contentType: "text",
      },
    };
  }

  /**
   * Convert processed content to weekly achievements format
   */
  convertToAchievements(processed: ProcessedContent): string[] {
    const achievements: string[] = [];

    // Add direct achievements
    achievements.push(...processed.achievements);

    // Convert insights to achievements
    processed.insights.forEach((insight) => {
      achievements.push(`Researched and documented ${insight.toLowerCase()}`);
    });

    // Convert learnings to achievements
    processed.learnings.forEach((learning) => {
      achievements.push(`Learned and applied ${learning.toLowerCase()}`);
    });

    return achievements.filter(
      (achievement, index, arr) => arr.indexOf(achievement) === index // Remove duplicates
    );
  }

  /**
   * Extract achievements from content using AI
   */
  private async extractAchievements(content: string): Promise<string[]> {
    if (!content || content.trim().length === 0) {
      return [];
    }

    try {
      const prompt = PromptTemplates.getNotionProcessingPrompt(content);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      const achievements = JSON.parse(text) as string[];
      return achievements.filter((a) => a && a.trim().length > 0);
    } catch (error) {
      console.error("Error extracting achievements:", error);
      return this.fallbackAchievementExtraction(content);
    }
  }

  /**
   * Extract insights from content
   */
  private async extractInsights(content: string): Promise<string[]> {
    if (!content || content.trim().length === 0) {
      return [];
    }

    const insightPrompt = `
Extract key insights, findings, or discoveries from the following content. Focus on:
- Research findings
- Important realizations
- Key takeaways
- Strategic insights
- Technical discoveries

CONTENT:
${content}

Return a JSON array of insights:
["Insight 1", "Insight 2", "Insight 3"]

If no meaningful insights are found, return an empty array: []
`;

    try {
      const result = await this.model.generateContent(insightPrompt);
      const response = await result.response;
      const text = response.text().trim();

      const insights = JSON.parse(text) as string[];
      return insights.filter((i) => i && i.trim().length > 0);
    } catch (error) {
      console.error("Error extracting insights:", error);
      return this.fallbackInsightExtraction(content);
    }
  }

  /**
   * Extract learnings from content
   */
  private async extractLearnings(content: string): Promise<string[]> {
    if (!content || content.trim().length === 0) {
      return [];
    }

    const learningPrompt = `
Extract learning accomplishments and skill development from the following content. Focus on:
- New skills acquired
- Knowledge gained
- Concepts mastered
- Tools learned
- Methodologies understood

CONTENT:
${content}

Return a JSON array of learnings:
["Learning 1", "Learning 2", "Learning 3"]

If no meaningful learnings are found, return an empty array: []
`;

    try {
      const result = await this.model.generateContent(learningPrompt);
      const response = await result.response;
      const text = response.text().trim();

      const learnings = JSON.parse(text) as string[];
      return learnings.filter((l) => l && l.trim().length > 0);
    } catch (error) {
      console.error("Error extracting learnings:", error);
      return this.fallbackLearningExtraction(content);
    }
  }

  /**
   * Clean Notion-specific formatting
   */
  private cleanNotionContent(content: string): string {
    return content
      .replace(/\[\[([^\]]+)\]\]/g, "$1") // Remove Notion page links
      .replace(/{{([^}]+)}}/g, "") // Remove Notion templates
      .replace(/---+/g, "") // Remove horizontal rules
      .replace(/^\s*[-*+]\s+/gm, "") // Remove bullet points
      .replace(/^\s*\d+\.\s+/gm, "") // Remove numbered lists
      .replace(/\n{3,}/g, "\n\n") // Normalize line breaks
      .trim();
  }

  /**
   * Clean markdown formatting
   */
  private cleanMarkdownContent(content: string): string {
    return content
      .replace(/^#{1,6}\s+/gm, "") // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
      .replace(/\*([^*]+)\*/g, "$1") // Remove italic
      .replace(/`([^`]+)`/g, "$1") // Remove inline code
      .replace(/```[\s\S]*?```/g, "") // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
      .replace(/^\s*[-*+]\s+/gm, "") // Remove bullet points
      .replace(/^\s*\d+\.\s+/gm, "") // Remove numbered lists
      .replace(/\n{3,}/g, "\n\n") // Normalize line breaks
      .trim();
  }

  /**
   * Clean plain text content
   */
  private cleanTextContent(content: string): string {
    return content
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\n{3,}/g, "\n\n") // Normalize line breaks
      .trim();
  }

  /**
   * Fallback processing when AI fails
   */
  private fallbackProcessing(
    content: string,
    contentType: ProcessedContent["metadata"]["contentType"]
  ): ProcessedContent {
    const achievements = this.fallbackAchievementExtraction(content);
    const insights = this.fallbackInsightExtraction(content);
    const learnings = this.fallbackLearningExtraction(content);

    return {
      achievements,
      insights,
      learnings,
      metadata: {
        wordCount: content.split(/\s+/).length,
        processingTimestamp: new Date().toISOString(),
        contentType,
      },
    };
  }

  /**
   * Fallback achievement extraction using keywords
   */
  private fallbackAchievementExtraction(content: string): string[] {
    const achievementKeywords = [
      "completed",
      "finished",
      "implemented",
      "created",
      "developed",
      "built",
      "delivered",
      "achieved",
      "accomplished",
      "solved",
    ];

    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 10);
    const achievements: string[] = [];

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (
        achievementKeywords.some((keyword) => lowerSentence.includes(keyword))
      ) {
        achievements.push(sentence.trim());
        if (achievements.length >= 5) break;
      }
    }

    return achievements;
  }

  /**
   * Fallback insight extraction using keywords
   */
  private fallbackInsightExtraction(content: string): string[] {
    const insightKeywords = [
      "discovered",
      "found",
      "realized",
      "learned",
      "understood",
      "insight",
      "finding",
      "conclusion",
      "observation",
    ];

    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 10);
    const insights: string[] = [];

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (insightKeywords.some((keyword) => lowerSentence.includes(keyword))) {
        insights.push(sentence.trim());
        if (insights.length >= 3) break;
      }
    }

    return insights;
  }

  /**
   * Fallback learning extraction using keywords
   */
  private fallbackLearningExtraction(content: string): string[] {
    const learningKeywords = [
      "learned",
      "studied",
      "mastered",
      "acquired",
      "gained",
      "skill",
      "knowledge",
      "concept",
      "technique",
      "methodology",
    ];

    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 10);
    const learnings: string[] = [];

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (learningKeywords.some((keyword) => lowerSentence.includes(keyword))) {
        learnings.push(sentence.trim());
        if (learnings.length >= 3) break;
      }
    }

    return learnings;
  }

  /**
   * Create empty result structure
   */
  private createEmptyResult(
    contentType: ProcessedContent["metadata"]["contentType"]
  ): ProcessedContent {
    return {
      achievements: [],
      insights: [],
      learnings: [],
      metadata: {
        wordCount: 0,
        processingTimestamp: new Date().toISOString(),
        contentType,
      },
    };
  }

  /**
   * Deduplicate and prioritize items by length and content quality
   */
  private deduplicateAndPrioritize(items: string[]): string[] {
    // Remove duplicates and very short items
    const unique = items
      .filter((item, index, arr) => arr.indexOf(item) === index)
      .filter((item) => item.trim().length > 10);

    // Sort by length (longer items are often more detailed)
    return unique.sort((a, b) => b.length - a.length).slice(0, 10); // Limit to top 10 items
  }
}
