import { useState, useEffect } from "react";
import { LogMessage } from "@/components/AIAgentLogBubble";

export function useLogManager() {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch logs from server
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Clear logs on server
  const clearLogs = async () => {
    try {
      const response = await fetch("/api/logs", { method: "DELETE" });
      if (response.ok) {
        setLogs([]);
      }
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  };

  // Poll for new logs every 2 seconds
  useEffect(() => {
    fetchLogs(); // Initial fetch

    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  return {
    logs,
    loading,
    fetchLogs,
    clearLogs,
    // Client-side logging methods (for immediate feedback)
    addLog: (level: LogMessage["level"], message: string, source?: string) => {
      const newLog: LogMessage = {
        id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        level,
        message,
        source,
      };
      setLogs((prev) => [...prev, newLog]);
    },
    info: (message: string, source?: string) => {
      const newLog: LogMessage = {
        id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        level: "info",
        message,
        source,
      };
      setLogs((prev) => [...prev, newLog]);
    },
    success: (message: string, source?: string) => {
      const newLog: LogMessage = {
        id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        level: "success",
        message,
        source,
      };
      setLogs((prev) => [...prev, newLog]);
    },
    warning: (message: string, source?: string) => {
      const newLog: LogMessage = {
        id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        level: "warning",
        message,
        source,
      };
      setLogs((prev) => [...prev, newLog]);
    },
    error: (message: string, source?: string) => {
      const newLog: LogMessage = {
        id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        level: "error",
        message,
        source,
      };
      setLogs((prev) => [...prev, newLog]);
    },
  };
}
