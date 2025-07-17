import { Octokit } from "@octokit/rest";

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

export interface GitHubData {
  commits: GitHubCommit[];
  pullRequests: GitHubPR[];
}

export async function fetchGitHubData(
  accessToken: string,
  repoUrl: string,
  startDate: string,
  endDate: string,
  specificPRUrls?: string[]
): Promise<GitHubData> {
  const octokit = new Octokit({
    auth: accessToken,
  });

  // Parse repository URL
  const urlParts = repoUrl.replace("https://github.com/", "").split("/");
  const owner = urlParts[0];
  const repo = urlParts[1];

  // Fetch commits within date range
  const { data: commits } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    since: new Date(startDate).toISOString(),
    until: new Date(endDate).toISOString(),
  });

  // Fetch pull requests within date range
  const { data: allPRs } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: "all",
    sort: "updated",
    direction: "desc",
  });

  // Filter PRs by date range
  const pullRequests = allPRs.filter((pr) => {
    const prDate = new Date(pr.created_at);
    return prDate >= new Date(startDate) && prDate <= new Date(endDate);
  });

  // If specific PR URLs are provided, fetch those as well
  if (specificPRUrls && specificPRUrls.length > 0) {
    const specificPRs: any[] = [];

    for (const url of specificPRUrls) {
      const prNumber = extractPRNumber(url);
      if (prNumber) {
        try {
          const { data: pr } = await octokit.rest.pulls.get({
            owner,
            repo,
            pull_number: prNumber,
          });
          specificPRs.push(pr);
        } catch (error) {
          console.error(`Failed to fetch PR ${prNumber}:`, error);
        }
      }
    }

    // Merge specific PRs with date-filtered PRs (avoid duplicates)
    const allPRNumbers = new Set(pullRequests.map((pr: any) => pr.number));
    specificPRs.forEach((pr) => {
      if (!allPRNumbers.has(pr.number)) {
        pullRequests.push(pr);
      }
    });
  }

  return {
    commits: commits as GitHubCommit[],
    pullRequests: pullRequests as GitHubPR[],
  };
}

function extractPRNumber(url: string): number | null {
  const match = url.match(/\/pull\/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export function validateGitHubUrl(url: string): boolean {
  const githubUrlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/;
  return githubUrlPattern.test(url);
}

export function validatePRUrl(url: string): boolean {
  const prUrlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/\d+\/?$/;
  return prUrlPattern.test(url);
}
