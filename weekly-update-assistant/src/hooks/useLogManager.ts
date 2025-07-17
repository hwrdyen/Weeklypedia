import { useState, useEffect, useRef } from "react";
import { LogMessage } from "@/components/AIAgentLogBubble";

export function useLogManager() {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Start polling for logs
  const startPolling = () => {
    if (isPolling) return;
    setIsPolling(true);
    fetchLogs(); // Initial fetch

    // Poll every 5 seconds instead of 2 seconds
    intervalRef.current = setInterval(fetchLogs, 5000);
  };

  // Stop polling for logs
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    logs,
    loading,
    isPolling,
    fetchLogs,
    clearLogs,
    startPolling,
    stopPolling,
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
