import { NextResponse } from "next/server";

function maskKey(key: string | undefined): { masked: string; configured: boolean } {
  if (!key || key.trim() === "") return { masked: "", configured: false };
  const k = key.trim();
  if (k.length <= 12) return { masked: "•".repeat(k.length), configured: true };
  return {
    masked: k.slice(0, 6) + "•".repeat(Math.min(20, k.length - 10)) + k.slice(-4),
    configured: true,
  };
}

export async function GET() {
  return NextResponse.json({
    claude:   maskKey(process.env.CLAUDE_API_KEY),
    youtube:  maskKey(process.env.YOUTUBE_API_KEY),
    openai:   maskKey(process.env.OPENAI_API_KEY),
    notion:   maskKey(process.env.NOTION_API_KEY),
  });
}
