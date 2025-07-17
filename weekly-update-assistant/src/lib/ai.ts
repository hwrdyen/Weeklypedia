import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiAgent, WeeklySummary } from "@/ai-agent";

export interface Achievement {
  id: string;
  text: string;
  selected: boolean;
  source: "github" | "manual";
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

interface GitHubPR {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: string;
  created_at: string;
  merged_at: string | null;
}

interface GitHubData {
  commits: GitHubCommit[];
  pullRequests: GitHubPR[];
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export async function analyzeGitHubActivity(
  githubData: GitHubData,
  additionalContext?: string,
  pdfFiles?: File[]
): Promise<Achievement[]> {
  try {
    console.log("🔄 Using enhanced AI agent for analysis...");

    // Debug: Log the additional context and files
    if (additionalContext) {
      console.log(
        "Additional context received:",
        additionalContext.substring(0, 500) + "..."
      );
      console.log("Additional context length:", additionalContext.length);
    } else {
      console.log("No additional context provided");
    }

    if (pdfFiles && pdfFiles.length > 0) {
      console.log(
        `📎 Processing ${pdfFiles.length} PDF files:`,
        pdfFiles.map((f) => f.name)
      );
    }

    // Note: PDF file processing is handled by the AI agent
    // For now, we'll acknowledge PDF files but process as text placeholders
    if (pdfFiles && pdfFiles.length > 0) {
      console.log(
        `📎 PDF files detected: ${pdfFiles
          .map((f) => f.name)
          .join(", ")} - will be processed by AI agent`
      );
    }

    // Use the new AI agent for analysis
    const achievements = await aiAgent.quickAnalyze(
      githubData,
      additionalContext,
      pdfFiles
    );

    console.log("✅ Enhanced AI agent analysis complete");
    return achievements;
  } catch (error) {
    console.error("Error analyzing GitHub activity with AI agent:", error);

    // Fallback to basic analysis if AI agent fails
    console.log("🔄 Falling back to basic analysis...");
    return await fallbackAnalysis(githubData, additionalContext);
  }
}

// Fallback analysis function for when the AI agent fails
async function fallbackAnalysis(
  githubData: GitHubData,
  additionalContext?: string
): Promise<Achievement[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Simple fallback prompt
    const commits = githubData.commits
      .map((commit) => `- ${commit.commit.message}`)
      .join("\n");

    const pullRequests = githubData.pullRequests
      .map(
        (pr) =>
          `- PR #${pr.number}: ${pr.title}${pr.body ? ` - ${pr.body}` : ""}`
      )
      .join("\n");

    const prompt = `
Analyze the following GitHub activity and create professional achievements:

Commits:
${commits}

Pull Requests:
${pullRequests}

${additionalContext ? `Additional Context: ${additionalContext}` : ""}

Create 3-8 professional achievements. Each should:
- Start with an action verb
- Be business-friendly
- Avoid technical jargon
- Focus on value delivered

Return as JSON array: ["Achievement 1", "Achievement 2"]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse response
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const achievements = JSON.parse(cleanedText.trim()) as string[];

    return achievements.map((achievement, index) => ({
      id: `ai-fallback-${Date.now()}-${index}`,
      text: achievement,
      selected: true,
      source: "github" as const,
    }));
  } catch (error) {
    console.error("Fallback analysis also failed:", error);

    // Final fallback - return basic descriptive achievements
    const achievements: Achievement[] = [];

    if (githubData.commits.length > 0) {
      achievements.push({
        id: `basic-${Date.now()}-0`,
        text: `Completed ${githubData.commits.length} code commits with various improvements and fixes.`,
        selected: true,
        source: "github" as const,
      });
    }

    if (githubData.pullRequests.length > 0) {
      achievements.push({
        id: `basic-${Date.now()}-1`,
        text: `Submitted ${githubData.pullRequests.length} pull request(s) for code review and integration.`,
        selected: true,
        source: "github" as const,
      });
    }

    if (additionalContext) {
      achievements.push({
        id: `basic-${Date.now()}-2`,
        text: "Documented research findings and additional project context.",
        selected: true,
        source: "github" as const,
      });
    }

    return achievements;
  }
}

export async function generateWeeklyEmail(
  achievementTexts: string[],
  startDate?: string,
  endDate?: string
): Promise<string> {
  try {
    console.log("🔄 Using enhanced AI agent for email generation...");
    console.log("Starting email generation with:", {
      achievementTexts,
      startDate,
      endDate,
    });

    if (!achievementTexts || achievementTexts.length === 0) {
      console.error("No achievements provided!");
      throw new Error("No achievements provided for email generation");
    }

    const dateRangeText =
      startDate && endDate
        ? `for the period from ${new Date(
            startDate
          ).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
        : "for this week";

    // Convert achievements back to WeeklySummary format for enhanced processing
    const weeklySummary: WeeklySummary = {
      Features: achievementTexts.filter(
        (text) =>
          text.includes("develop") ||
          text.includes("implement") ||
          text.includes("create") ||
          text.includes("enhance") ||
          text.includes("🌟") // Highlights often start with star emoji
      ),
      Fixes: achievementTexts.filter(
        (text) =>
          text.includes("fix") ||
          text.includes("resolve") ||
          text.includes("correct") ||
          text.includes("debug")
      ),
      Refactors: achievementTexts.filter(
        (text) =>
          text.includes("refactor") ||
          text.includes("improve") ||
          text.includes("optimize") ||
          text.includes("clean")
      ),
      Highlights: achievementTexts.filter((text) => text.startsWith("🌟")),
      Notes: [],
    };

    // If categorization resulted in empty categories, put all achievements in Features
    if (
      weeklySummary.Features.length === 0 &&
      weeklySummary.Fixes.length === 0 &&
      weeklySummary.Refactors.length === 0
    ) {
      weeklySummary.Features = achievementTexts;
    }

    // Use the AI agent for enhanced email generation
    const emailContent = await aiAgent.generateEmailContent(
      weeklySummary,
      dateRangeText
    );

    console.log("✅ Enhanced AI agent email generation complete");
    console.log("Generated email content length:", emailContent?.length || 0);
    console.log(
      "Generated email preview:",
      emailContent?.substring(0, 200) + "..."
    );

    if (!emailContent || emailContent.trim().length === 0) {
      throw new Error("AI generated empty content");
    }

    return emailContent;
  } catch (error) {
    console.error("Error with enhanced email generation:", error);
    console.log("🔄 Falling back to basic email generation...");

    // Fallback to basic email generation
    return await fallbackEmailGeneration(achievementTexts, startDate, endDate);
  }
}

// Fallback email generation function
async function fallbackEmailGeneration(
  achievementTexts: string[],
  startDate?: string,
  endDate?: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const dateRangeText =
      startDate && endDate
        ? `for the period from ${new Date(
            startDate
          ).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
        : "for this week";

    const prompt = `
Create a professional weekly update email ${dateRangeText}:

Achievements:
${achievementTexts
  .map((achievement, i) => `${i + 1}. ${achievement}`)
  .join("\n")}

Format as plain text with:
- Professional but friendly tone
- Clear bullet points
- Brief opening and closing

Return only the email content.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const emailContent = response.text();

    if (!emailContent || emailContent.trim().length === 0) {
      throw new Error("Fallback email generation failed");
    }

    return emailContent;
  } catch (error) {
    console.error("Fallback email generation failed:", error);

    // Final fallback - create basic email manually
    const dateRangeText =
      startDate && endDate
        ? `for the period from ${new Date(
            startDate
          ).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
        : "for this week";

    return `Subject: Weekly Update - ${dateRangeText}

Hi [Manager],

I wanted to share a quick update on my progress ${dateRangeText}:

${achievementTexts.map((achievement) => `• ${achievement}`).join("\n")}

Please let me know if you have any questions or need additional details.

Best regards,
[Your name]`;
  }
}
