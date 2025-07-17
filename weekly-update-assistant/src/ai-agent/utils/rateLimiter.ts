// Rate limiter utility for managing AI API requests

export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number; // in milliseconds

  constructor(maxRequests: number = 10, timeWindowMinutes: number = 1) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMinutes * 60 * 1000; // convert to milliseconds
  }

  /**
   * Check if we can make a request without exceeding rate limits
   */
  canMakeRequest(): boolean {
    const now = Date.now();

    // Remove requests older than the time window
    this.requests = this.requests.filter(
      (timestamp) => now - timestamp < this.timeWindow
    );

    return this.requests.length < this.maxRequests;
  }

  /**
   * Record a request and wait if necessary to avoid rate limits
   */
  async waitForAvailability(): Promise<void> {
    const now = Date.now();

    // Remove old requests
    this.requests = this.requests.filter(
      (timestamp) => now - timestamp < this.timeWindow
    );

    if (this.requests.length >= this.maxRequests) {
      // Calculate how long to wait
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (now - oldestRequest) + 1000; // Add 1 second buffer

      console.log(
        `⏳ Rate limit reached. Waiting ${Math.ceil(
          waitTime / 1000
        )} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // Record this request
    this.requests.push(Date.now());
  }

  /**
   * Execute a function with rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForAvailability();
    return await fn();
  }

  /**
   * Get current usage statistics
   */
  getUsageStats(): { current: number; max: number; remaining: number } {
    const now = Date.now();
    this.requests = this.requests.filter(
      (timestamp) => now - timestamp < this.timeWindow
    );

    return {
      current: this.requests.length,
      max: this.maxRequests,
      remaining: this.maxRequests - this.requests.length,
    };
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.requests = [];
  }
}

// Global rate limiter instance for Gemini API
export const geminiRateLimiter = new RateLimiter(10, 1); // 10 requests per minute (conservative)
