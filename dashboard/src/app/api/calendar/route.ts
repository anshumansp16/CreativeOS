import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const outputDir = join(process.cwd(), "..", "tools", "output");
    const filePath = join(outputDir, "content_calendar.json");
    if (existsSync(filePath)) {
      const data = JSON.parse(readFileSync(filePath, "utf-8"));
      return NextResponse.json(data);
    }
    return NextResponse.json({ calendar: [] });
  } catch { return NextResponse.json({ error: "Failed to load" }, { status: 500 }); }
}
