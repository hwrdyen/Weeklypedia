import { NextRequest, NextResponse } from "next/server";
import { serverLogManager } from "@/lib/serverLogManager";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const level = searchParams.get("level") as any;
    const limit = parseInt(searchParams.get("limit") || "50");

    let logs = serverLogManager.getLogs();

    // Filter by source if specified
    if (source) {
      logs = logs.filter((log) => log.source === source);
    }

    // Filter by level if specified
    if (level && ["info", "success", "warning", "error"].includes(level)) {
      logs = logs.filter((log) => log.level === level);
    }

    // Limit the number of logs
    if (limit > 0) {
      logs = logs.slice(-limit);
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    serverLogManager.clearLogs();
    return NextResponse.json({ message: "Logs cleared successfully" });
  } catch (error) {
    console.error("Error clearing logs:", error);
    return NextResponse.json(
      { error: "Failed to clear logs" },
      { status: 500 }
    );
  }
}
