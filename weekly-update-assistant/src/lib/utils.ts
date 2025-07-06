import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function formatGitHubUrl(url: string): string {
  // Ensure GitHub URL is properly formatted
  if (!url.startsWith("http")) {
    return `https://github.com/${url}`;
  }
  return url;
}

export function extractRepoFromUrl(
  url: string
): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (match) {
    return { owner: match[1], repo: match[2] };
  }
  return null;
}
