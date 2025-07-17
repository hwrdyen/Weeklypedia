// Prompt templates for AI agent interactions

import { PromptContext, ActivityCategory } from "./types";

export class PromptTemplates {
  /**
   * Main analysis prompt for categorizing and summarizing activities
   */
  static getAnalysisPrompt(context: PromptContext): string {
    return `
You are an AI assistant specialized in analyzing software development activity and creating professional weekly summaries.

Analyze the following developer activity ${
      context.dateRange
    } and categorize each meaningful change into one of these categories:
- Features: New functionality, enhancements, or major improvements
- Fixes: Bug fixes, error corrections, or issue resolutions  
- Refactors: Code restructuring, performance improvements, or technical debt reduction

DEVELOPER ACTIVITY DATA:

=== COMMITS ===
${
  context.commits.length > 0
    ? context.commits.join("\n")
    : "No commits found in this period"
}

=== PULL REQUESTS ===
${
  context.pullRequests.length > 0
    ? context.pullRequests.join("\n")
    : "No pull requests found in this period"
}

${
  context.notionContent
    ? `=== RESEARCH & DOCUMENTATION ===
${context.notionContent}`
    : ""
}

${
  context.additionalContext
    ? `=== ADDITIONAL CONTEXT ===
${context.additionalContext}`
    : ""
}

ANALYSIS REQUIREMENTS:
1. Categorize each significant activity into Features, Fixes, or Refactors
2. Convert technical language into business-friendly descriptions
3. Focus on value delivered rather than technical implementation details
4. Combine related activities to avoid redundancy
5. Identify any high-impact accomplishments for the Highlights section

OUTPUT FORMAT (JSON):
{
  "Features": ["Feature description 1", "Feature description 2"],
  "Fixes": ["Fix description 1", "Fix description 2"],
  "Refactors": ["Refactor description 1"],
  "Highlights": ["High-impact accomplishment"],
  "Notes": ["Additional context or achievements"]
}

WRITING GUIDELINES:
- Use past tense, professional language
- Start with action verbs (Developed, Implemented, Fixed, Improved)
- Avoid first-person pronouns and technical jargon
- Focus on business impact and value delivered
- Be specific but concise

Return ONLY the JSON object, no markdown formatting or additional text.
`;
  }

  /**
   * Prompt for classifying individual activities
   */
  static getClassificationPrompt(activity: string): string {
    return `
Classify the following software development activity into one of these categories:

CATEGORIES:
- feature: New functionality, enhancements, user-facing improvements
- fix: Bug fixes, error corrections, issue resolutions
- refactor: Code restructuring, performance improvements, technical debt
- docs: Documentation updates, README changes, comments
- test: Test additions, test improvements, testing infrastructure
- chore: Build system, dependencies, configuration changes
- performance: Speed optimizations, efficiency improvements
- security: Security fixes, vulnerability patches, access control

ACTIVITY: "${activity}"

Respond with only the category name (lowercase).
`;
  }

  /**
   * Prompt for creating business-friendly summaries
   */
  static getSummarizationPrompt(
    activities: string[],
    category: string
  ): string {
    return `
Convert the following technical ${category} activities into a single, business-friendly summary:

ACTIVITIES:
${activities.map((activity, i) => `${i + 1}. ${activity}`).join("\n")}

Create a professional summary that:
- Uses past tense and starts with an action verb
- Focuses on business value and impact
- Avoids technical jargon
- Is suitable for a non-technical manager
- Combines related work into one coherent statement

Return only the summary text, no additional formatting.
`;
  }

  /**
   * Prompt for extracting high-impact activities
   */
  static getHighlightsPrompt(allActivities: string[]): string {
    return `
From the following list of activities, identify the top 1-3 most impactful accomplishments that deserve special highlighting in a weekly update:

ACTIVITIES:
${allActivities.map((activity, i) => `${i + 1}. ${activity}`).join("\n")}

Select activities that:
- Deliver significant business value
- Represent major milestones or breakthroughs
- Solve critical problems or pain points
- Enable future work or unlock new capabilities
- Have broad impact across teams or users

Return a JSON array of the most impactful activities:
["Highlight 1", "Highlight 2", "Highlight 3"]

If no activities meet the high-impact criteria, return an empty array: []
`;
  }

  /**
   * Prompt for processing Notion content
   */
  static getNotionProcessingPrompt(notionContent: string): string {
    return `
Extract meaningful work accomplishments from the following Notion content/research notes:

CONTENT:
${notionContent}

Identify and extract:
- Research findings and insights
- Learning objectives completed
- Documentation work
- Analysis and investigation results
- Knowledge acquisition and skill development
- Planning and strategic work

Convert each accomplishment into professional, business-friendly language suitable for a weekly update.

Return a JSON array of accomplishments:
["Accomplishment 1", "Accomplishment 2", "Accomplishment 3"]

If no meaningful accomplishments are found, return an empty array: []
`;
  }

  /**
   * Prompt for generating final email content
   */
  static getEmailGenerationPrompt(summary: any, dateRange: string): string {
    return `
Create a professional weekly update email using the following structured summary ${dateRange}:

WEEKLY SUMMARY:
Features: ${JSON.stringify(summary.Features || [])}
Fixes: ${JSON.stringify(summary.Fixes || [])}
Refactors: ${JSON.stringify(summary.Refactors || [])}
${summary.Highlights ? `Highlights: ${JSON.stringify(summary.Highlights)}` : ""}
${summary.Notes ? `Notes: ${JSON.stringify(summary.Notes)}` : ""}

The email should:
- Have a friendly but professional tone
- Be addressed to a manager or team lead
- Include a brief opening and closing
- Present accomplishments in clear, bulleted sections
- Be concise but informative
- Include the time period

Format as plain text (no HTML or markdown).

Example structure:
Subject: Weekly Update - [Date Range]

Hi [Manager],

I wanted to share a quick update on my progress ${dateRange}:

New Features & Enhancements:
• [Feature items]

Bug Fixes & Corrections:
• [Fix items]

Code Improvements & Refactoring:
• [Refactor items]

[Include Highlights section if present]
[Include Notes section if present]

[Closing remarks]

Best regards,
[Your name]
`;
  }
}
