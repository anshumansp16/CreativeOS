import { NextResponse } from "next/server";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const outputDir = join(process.cwd(), "..", "tools", "output");
    if (existsSync(outputDir)) {
      const files = readdirSync(outputDir);
      const viralFile = files.find(f => f.startsWith("viral_") && f.endsWith(".json"));
      if (viralFile) {
        const data = JSON.parse(readFileSync(join(outputDir, viralFile), "utf-8"));
        return NextResponse.json(data);
      }
    }
    return NextResponse.json({ viral_content: null });
  } catch { return NextResponse.json({ error: "Failed to load" }, { status: 500 }); }
}
