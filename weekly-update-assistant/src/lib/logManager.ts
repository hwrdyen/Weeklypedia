import { LogMessage } from "@/components/AIAgentLogBubble";

class LogManager {
  private logs: LogMessage[] = [];
  private listeners: ((logs: LogMessage[]) => void)[] = [];
  private maxLogs = 100; // Keep only last 100 logs

  /**
   * Add a new log message
   */
  addLog(level: LogMessage["level"], message: string, source?: string): void {
    const log: LogMessage = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

    // Notify all listeners
    this.notifyListeners();
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
  getLogs(): LogMessage[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    this.notifyListeners();
  }

  /**
   * Subscribe to log updates
   */
  subscribe(listener: (logs: LogMessage[]) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getLogs()));
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogMessage["level"]): LogMessage[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Get logs by source
   */
  getLogsBySource(source: string): LogMessage[] {
    return this.logs.filter((log) => log.source === source);
  }

  /**
   * Get recent logs (last N logs)
   */
  getRecentLogs(count: number): LogMessage[] {
    return this.logs.slice(-count);
  }

  /**
   * Get log statistics
   */
  getStats(): {
    total: number;
    byLevel: Record<LogMessage["level"], number>;
    bySource: Record<string, number>;
  } {
    const byLevel: Record<LogMessage["level"], number> = {
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
export const logManager = new LogManager();

// Export the class for testing
export { LogManager };
