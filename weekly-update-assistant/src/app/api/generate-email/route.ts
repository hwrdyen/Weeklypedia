import { NextRequest, NextResponse } from "next/server";
import { generateWeeklyEmail } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const { achievements, startDate, endDate } = await request.json();

    if (!achievements || !Array.isArray(achievements)) {
      return NextResponse.json(
        { error: "Invalid achievements data" },
        { status: 400 }
      );
    }

    console.log("Generating email for achievements:", achievements);
    const emailContent = await generateWeeklyEmail(
      achievements,
      startDate,
      endDate
    );
    console.log("Generated email content:", emailContent);

    return NextResponse.json({ email: emailContent });
  } catch (error) {
    console.error("Error generating email:", error);
    return NextResponse.json(
      { error: "Failed to generate email" },
      { status: 500 }
    );
  }
}
