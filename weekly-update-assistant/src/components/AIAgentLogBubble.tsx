"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Bot,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";

export interface LogMessage {
  id: string;
  timestamp: Date;
  level: "info" | "success" | "warning" | "error";
  message: string;
  source?: string;
}

interface AIAgentLogBubbleProps {
  isVisible: boolean;
  onToggle: () => void;
  logs: LogMessage[];
  isAnalyzing: boolean;
}

export function AIAgentLogBubble({
  isVisible,
  onToggle,
  logs,
  isAnalyzing,
}: AIAgentLogBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [logs]);

  const getLevelIcon = (level: LogMessage["level"]) => {
    switch (level) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level: LogMessage["level"]) => {
    switch (level) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90"
        >
          <MessageSquare className="h-6 w-6" />
          {isAnalyzing && (
            <div className="absolute -top-1 -right-1">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            </div>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="shadow-xl border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">AI Agent Logs</CardTitle>
              {isAnalyzing && (
                <div className="flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Analyzing...
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div
            ref={scrollAreaRef}
            className={`overflow-y-auto transition-all duration-300 ${
              isExpanded ? "max-h-96" : "max-h-64"
            }`}
          >
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No logs yet</p>
                <p className="text-xs">
                  AI agent logs will appear here during analysis
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg border ${getLevelColor(
                      log.level
                    )}`}
                  >
                    <div className="flex items-start gap-2">
                      {getLevelIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono opacity-75">
                            {formatTime(log.timestamp)}
                          </span>
                          {log.source && (
                            <Badge variant="outline" className="text-xs">
                              {log.source}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed">{log.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {logs.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {logs.length} log{logs.length !== 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    Last updated:{" "}
                    {logs.length > 0
                      ? formatTime(logs[logs.length - 1].timestamp)
                      : "Never"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
