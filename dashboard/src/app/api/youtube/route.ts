import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const outputDir = join(process.cwd(), "..", "tools", "output");
    const filePath = join(outputDir, "youtube_analytics.json");
    if (existsSync(filePath)) {
      const data = JSON.parse(readFileSync(filePath, "utf-8"));
      return NextResponse.json(data);
    }
    return NextResponse.json({ channel: { name: "Anshuman Parmar", subscribers: 359, total_views: 15000, video_count: 12 }, videos: [] });
  } catch { return NextResponse.json({ error: "Failed to load" }, { status: 500 }); }
}
