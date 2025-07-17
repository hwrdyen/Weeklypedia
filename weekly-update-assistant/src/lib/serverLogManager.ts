// Server-side log manager for API routes
// This is a simplified version that can be extended to send logs to the frontend

export interface ServerLogMessage {
  id: string;
  timestamp: Date;
  level: "info" | "success" | "warning" | "error";
  message: string;
  source?: string;
}

class ServerLogManager {
  private logs: ServerLogMessage[] = [];
  private maxLogs = 50; // Keep only last 50 logs on server

  /**
   * Add a new log message
   */
  addLog(
    level: ServerLogMessage["level"],
    message: string,
    source?: string
  ): void {
    const log: ServerLogMessage = {
      id: `server-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      source,
    };

    this.logs.push(log);

    // Keep only the last maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console for debugging
    const consoleMethod =
      level === "error" ? "error" : level === "warning" ? "warn" : "log";
    const emoji =
      level === "success"
        ? "✅"
        : level === "warning"
        ? "⚠️"
        : level === "error"
        ? "❌"
        : "ℹ️";
    console[consoleMethod](`${emoji} [${source || "Server"}] ${message}`);
  }

  /**
   * Add an info log
   */
  info(message: string, source?: string): void {
    this.addLog("info", message, source);
  }

  /**
   * Add a success log
   */
  success(message: string, source?: string): void {
    this.addLog("success", message, source);
  }

  /**
   * Add a warning log
   */
  warning(message: string, source?: string): void {
    this.addLog("warning", message, source);
  }

  /**
   * Add an error log
   */
  error(message: string, source?: string): void {
    this.addLog("error", message, source);
  }

  /**
   * Get all logs
   */
  getLogs(): ServerLogMessage[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: ServerLogMessage["level"]): ServerLogMessage[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Get logs by source
   */
  getLogsBySource(source: string): ServerLogMessage[] {
    return this.logs.filter((log) => log.source === source);
  }

  /**
   * Get recent logs (last N logs)
   */
  getRecentLogs(count: number): ServerLogMessage[] {
    return this.logs.slice(-count);
  }

  /**
   * Get log statistics
   */
  getStats(): {
    total: number;
    byLevel: Record<ServerLogMessage["level"], number>;
    bySource: Record<string, number>;
  } {
    const byLevel: Record<ServerLogMessage["level"], number> = {
      info: 0,
      success: 0,
      warning: 0,
      error: 0,
    };

    const bySource: Record<string, number> = {};

    this.logs.forEach((log) => {
      byLevel[log.level]++;
      if (log.source) {
        bySource[log.source] = (bySource[log.source] || 0) + 1;
      }
    });

    return {
      total: this.logs.length,
      byLevel,
      bySource,
    };
  }
}

// Create singleton instance
export const serverLogManager = new ServerLogManager();

// Export the class for testing
export { ServerLogManager };
