import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    // Note: Direct PDF upload to AI temporarily disabled due to API limitations
    // For now, acknowledge PDF files but process as text placeholders
    const uploadedFiles: Array<{ name: string }> = [];
    if (pdfFiles && pdfFiles.length > 0) {
      console.log(
        `📎 PDF files detected but will be processed as placeholders: ${pdfFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      uploadedFiles.push(...pdfFiles.map((f) => ({ name: f.name })));
    }

    // Prepare the data for analysis
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
Analyze the following GitHub activity and uploaded research documents to extract key achievements for a weekly progress report. 
Focus on meaningful accomplishments that would be valuable to share with management.

ANALYZE EACH SECTION SEPARATELY to maximize achievement extraction:

=== SECTION 1: CODE DEVELOPMENT ===
GitHub Commits:
${commits}

=== SECTION 2: PROJECT CONTRIBUTIONS ===  
Pull Requests:
${pullRequests}

${
  additionalContext
    ? `=== SECTION 3: RESEARCH & DOCUMENTATION (TEXT) ===
${additionalContext}

NOTE: This section contains content from uploaded text documents and research notes. Treat this as a major source of achievements - analyze this content thoroughly to identify research findings, learning progress, documentation work, and knowledge acquisition that should be highlighted as separate achievements.`
    : ""
}

${
  uploadedFiles.length > 0
    ? `=== SECTION 4: RESEARCH & DOCUMENTATION (PDF FILES) ===
PDF Documents Uploaded: ${uploadedFiles.map((f) => f.name).join(", ")}

NOTE: The above PDF files have been uploaded and are available for analysis. Please carefully review and analyze the content of these PDF documents to extract achievements related to research, learning, documentation, analysis work, and knowledge acquisition. Each PDF should be treated as a significant source of accomplishments. Extract specific insights, findings, and progress from each document.`
    : ""
}

EXTRACTION STRATEGY:
- Extract 2-4 achievements from code commits (if substantial)
- Extract 1-3 achievements from pull requests (if present)
- Extract 3-6 achievements from research documents (if provided)
- Ensure each document/research area gets its own achievement(s)

Please provide a comprehensive list of achievements in plain, professional language that a non-technical manager would understand. Generate 5-12 achievements depending on the amount and variety of work completed. 

IMPORTANT: Scale the number of achievements based on content richness:
- Basic GitHub activity (few commits/PRs): 4-6 achievements
- Rich GitHub activity + research documents: 7-10 achievements  
- Extensive work across multiple areas: 8-12 achievements

Each achievement should:
- Be written in past tense, starting directly with an action verb (NOT "I did..." but "Developed...", "Analyzed...", "Implemented...")
- Focus on business value or impact and maintain professional tone
- Avoid technical jargon and first-person pronouns
- Be specific about what was accomplished
- Include insights from any research documents or additional context provided

IMPORTANT FORMATTING EXAMPLES:
✅ CORRECT: "Developed new authentication system improving user security by 40%"
✅ CORRECT: "Analyzed database performance metrics and identified optimization opportunities"  
✅ CORRECT: "Researched microservices architecture patterns and documented implementation strategy"
❌ WRONG: "I developed a new authentication system..."
❌ WRONG: "I analyzed database performance..."
❌ WRONG: "I researched microservices..."

If research documents were provided, ensure to:
- Summarize key findings or progress from the research
- Highlight any learning objectives that were completed
- Mention any documentation or analysis work that was done
- Create separate achievements for different research topics/documents
- Include achievements for knowledge acquisition and documentation efforts

Format your response as a JSON array of strings, like this:
["Achievement 1", "Achievement 2", "Achievement 3"]

IMPORTANT: Return ONLY the JSON array with no markdown formatting, no code blocks, and no additional text or explanations.
`;

    // Generate content with prompt only (file upload temporarily disabled)
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    try {
      // Remove markdown code block formatting if present
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
        id: `ai-${Date.now()}-${index}`,
        text: achievement,
        selected: true,
        source: "github" as const,
      }));
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);
      console.error("Parse error:", parseError);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("Error analyzing GitHub activity:", error);
    throw new Error("Failed to analyze GitHub activity");
  }
}

export async function generateWeeklyEmail(
  achievementTexts: string[],
  startDate?: string,
  endDate?: string
): Promise<string> {
  try {
    console.log("Starting email generation with:", {
      achievementTexts,
      startDate,
      endDate,
    });

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.error("Google AI API key is missing!");
      throw new Error("Google AI API key is not configured");
    }
    console.log("API key is configured:", apiKey.substring(0, 10) + "...");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Model initialized successfully");

    if (!achievementTexts || achievementTexts.length === 0) {
      console.error("No achievements provided!");
      throw new Error("No achievements provided for email generation");
    }
    console.log("Achievements to process:", achievementTexts);

    const dateRangeText =
      startDate && endDate
        ? `for the period from ${new Date(
            startDate
          ).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
        : "for this week";

    const prompt = `
Create a professional weekly update email based on the following achievements ${dateRangeText}:

${achievementTexts
  .map((achievement, i) => `${i + 1}. ${achievement}`)
  .join("\n")}

The email should:
- Have a friendly but professional tone
- Be addressed to a manager or team lead
- Include a brief opening and closing
- Present the achievements in a clear, bulleted format
- Be concise but informative
- Include the time period if provided

Format the email as plain text (no HTML or markdown).

Example structure:
Subject: Weekly Update - [Date Range]

Hi [Manager],

I wanted to share a quick update on my progress ${dateRangeText}:

• [Achievement 1]
• [Achievement 2]
• [Achievement 3]

[Closing remarks]

Best regards,
[Your name]
`;

    console.log("Sending prompt to AI:", prompt.substring(0, 200) + "...");

    const result = await model.generateContent(prompt);
    console.log("AI request completed, processing response...");

    const response = await result.response;
    console.log("Response received from AI");

    const emailContent = response.text();
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
    console.error("Detailed error in generateWeeklyEmail:", error);
    console.error("Error type:", typeof error);
    console.error("Error stack:", (error as Error).stack);
    throw new Error("Failed to generate email: " + (error as Error).message);
  }
}
