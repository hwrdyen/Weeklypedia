import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubData } from "@/lib/github";
import { analyzeGitHubActivity } from "@/lib/ai";
import { serverLogManager } from "@/lib/serverLogManager";

export async function POST(request: NextRequest) {
  try {
    serverLogManager.info("Starting GitHub data analysis", "API");
    console.log("=== API /analyze called ===");

    // Handle both JSON and FormData
    let body: any;
    let pdfFiles: File[] = [];

    const contentType = request.headers.get("content-type");

    if (contentType?.includes("multipart/form-data")) {
      serverLogManager.info(
        "Processing multipart form data with PDF files",
        "API"
      );
      const formData = await request.formData();

      // Extract basic form data
      body = {
        accessToken: formData.get("accessToken"),
        repoUrl: formData.get("repoUrl"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        prUrls: formData.get("prUrls")
          ? JSON.parse(formData.get("prUrls") as string)
          : undefined,
        notionContent: formData.get("notionContent"),
      };

      // Extract PDF files
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("pdf_") && value instanceof File) {
          pdfFiles.push(value);
          serverLogManager.info(
            `Processing PDF file: ${value.name} (${value.size} bytes)`,
            "File Processing"
          );
          console.log(
            `📎 PDF file received: ${value.name} (${value.size} bytes)`
          );
        }
      }
    } else {
      serverLogManager.info("Processing JSON request data", "API");
      body = await request.json();
    }

    const { accessToken, repoUrl, startDate, endDate, prUrls, notionContent } =
      body;

    console.log("Request parameters:", {
      repoUrl,
      startDate,
      endDate,
      hasAccessToken: !!accessToken,
      prUrlsCount: prUrls?.length || 0,
      hasNotionContent: !!notionContent,
    });

    if (!accessToken || !repoUrl || !startDate || !endDate) {
      serverLogManager.error("Missing required parameters", "API");
      console.log("❌ Missing required parameters");
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Fetch GitHub data
    serverLogManager.info("Fetching GitHub data from repository", "GitHub");
    console.log("🐙 Fetching GitHub data...");
    const githubData = await fetchGitHubData(
      accessToken,
      repoUrl,
      startDate,
      endDate,
      prUrls
    );

    serverLogManager.success(
      `GitHub data fetched: ${githubData.commits?.length || 0} commits, ${
        githubData.pullRequests?.length || 0
      } pull requests`,
      "GitHub"
    );
    console.log("✅ GitHub data fetched:", {
      commitsCount: githubData.commits?.length || 0,
      pullRequestsCount: githubData.pullRequests?.length || 0,
    });

    // Log sample of actual GitHub data
    if (githubData.commits?.length > 0) {
      serverLogManager.info(
        `Found ${githubData.commits.length} commits in date range`,
        "GitHub"
      );
      console.log(
        "Sample commits:",
        githubData.commits.slice(0, 3).map((c) => ({
          sha: c.sha?.substring(0, 7),
          message: c.commit?.message,
          date: c.commit?.author?.date,
        }))
      );
    } else {
      serverLogManager.warning("No commits found in date range", "GitHub");
      console.log("❌ No commits found in date range");
    }

    if (githubData.pullRequests?.length > 0) {
      serverLogManager.info(
        `Found ${githubData.pullRequests.length} pull requests in date range`,
        "GitHub"
      );
      console.log(
        "Sample PRs:",
        githubData.pullRequests.slice(0, 3).map((pr) => ({
          number: pr.number,
          title: pr.title,
          state: pr.state,
        }))
      );
    } else {
      serverLogManager.warning(
        "No pull requests found in date range",
        "GitHub"
      );
      console.log("❌ No pull requests found in date range");
    }

    // Check if we have any meaningful data to analyze
    const hasCommits = githubData.commits && githubData.commits.length > 0;
    const hasPRs =
      githubData.pullRequests && githubData.pullRequests.length > 0;
    const hasNotionContent = notionContent && notionContent.trim().length > 0;

    if (!hasCommits && !hasPRs && !hasNotionContent) {
      serverLogManager.warning(
        "No data found for analysis - returning informational message",
        "Analysis"
      );
      console.log("❌ No data found - returning informational message");

      const noDataAchievement = {
        id: "no-data-found",
        text: `No code changes, pull requests, or additional notes were found within the specified timeframe (${startDate} to ${endDate}). Consider expanding your date range or checking if there was any repository activity during this period.`,
        selected: true,
        source: "system" as const,
      };

      return NextResponse.json({ achievements: [noDataAchievement] });
    }

    // Analyze with AI
    serverLogManager.info("Starting AI analysis of GitHub data", "AI Agent");
    console.log("🤖 Analyzing with AI...");
    console.log(
      `📊 Analysis input: ${githubData.commits?.length || 0} commits, ${
        githubData.pullRequests?.length || 0
      } PRs, ${pdfFiles.length} PDF files, ${
        notionContent ? "text content" : "no text content"
      }`
    );

    const achievements = await analyzeGitHubActivity(
      githubData,
      notionContent,
      pdfFiles
    );

    serverLogManager.success(
      `AI analysis complete: ${
        achievements?.length || 0
      } achievements generated`,
      "AI Agent"
    );
    console.log("✅ AI analysis complete:", {
      achievementsCount: achievements?.length || 0,
    });

    return NextResponse.json({ achievements });
  } catch (error) {
    serverLogManager.error(
      `Analysis failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      "Analysis"
    );
    console.error("❌ Analysis error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      {
        error: "Failed to analyze GitHub data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
