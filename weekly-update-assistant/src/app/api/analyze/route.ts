import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubData } from "@/lib/github";
import { analyzeGitHubActivity } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    console.log("=== API /analyze called ===");

    // Handle both JSON and FormData
    let body: any;
    let pdfFiles: File[] = [];

    const contentType = request.headers.get("content-type");

    if (contentType?.includes("multipart/form-data")) {
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
          console.log(
            `📎 PDF file received: ${value.name} (${value.size} bytes)`
          );
        }
      }
    } else {
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
      console.log("❌ Missing required parameters");
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Fetch GitHub data
    console.log("🐙 Fetching GitHub data...");
    const githubData = await fetchGitHubData(
      accessToken,
      repoUrl,
      startDate,
      endDate,
      prUrls
    );

    console.log("✅ GitHub data fetched:", {
      commitsCount: githubData.commits?.length || 0,
      pullRequestsCount: githubData.pullRequests?.length || 0,
    });

    // Log sample of actual GitHub data
    if (githubData.commits?.length > 0) {
      console.log(
        "Sample commits:",
        githubData.commits.slice(0, 3).map((c) => ({
          sha: c.sha?.substring(0, 7),
          message: c.commit?.message,
          date: c.commit?.author?.date,
        }))
      );
    } else {
      console.log("❌ No commits found in date range");
    }

    if (githubData.pullRequests?.length > 0) {
      console.log(
        "Sample PRs:",
        githubData.pullRequests.slice(0, 3).map((pr) => ({
          number: pr.number,
          title: pr.title,
          state: pr.state,
        }))
      );
    } else {
      console.log("❌ No pull requests found in date range");
    }

    // Check if we have any meaningful data to analyze
    const hasCommits = githubData.commits && githubData.commits.length > 0;
    const hasPRs =
      githubData.pullRequests && githubData.pullRequests.length > 0;
    const hasNotionContent = notionContent && notionContent.trim().length > 0;

    if (!hasCommits && !hasPRs && !hasNotionContent) {
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

    console.log("✅ AI analysis complete:", {
      achievementsCount: achievements?.length || 0,
    });

    return NextResponse.json({ achievements });
  } catch (error) {
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
