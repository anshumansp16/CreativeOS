import { NextResponse } from "next/server";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
const CACHE_FILE = join(process.cwd(), "..", "tools", "output", "insights_cache.json");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function safeWriteCache(file: string, data: unknown) {
  try {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(data, null, 2));
  } catch { /* ignore */ }
}

function safeReadCache(file: string) {
  try {
    if (!existsSync(file)) return null;
    const parsed = JSON.parse(readFileSync(file, "utf-8"));
    if (!parsed || typeof parsed.generatedAt !== "number") return null;
    return parsed;
  } catch { return null; }
}

async function callAI(prompt: string): Promise<string> {
  const claudeKey = process.env.CLAUDE_API_KEY;
  if (claudeKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": claudeKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.content?.[0]?.text;
        if (text) return text;
      }
    } catch { /* fall through */ }
  }

  // Ollama fallback
  try {
    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama3.2", prompt, stream: false }),
    });
    if (ollamaRes.ok) {
      const od = await ollamaRes.json();
      if (od.response) return od.response;
    }
  } catch { /* Ollama not running */ }

  throw new Error("AI unavailable: check CLAUDE_API_KEY or run Ollama with llama3.2");
}

interface AiInsight {
  category: string;
  title: string;
  insight: string;
  action: string;
  impact: string;
  emoji: string;
}

export async function GET() {
  // Check 24h cache
  const cached = safeReadCache(CACHE_FILE);
  if (cached && Date.now() - cached.generatedAt < CACHE_TTL_MS && cached.insights?.length > 0) {
    return NextResponse.json({ insights: cached.insights, cached: true, generatedAt: cached.generatedAt });
  }

  // Load YouTube data
  let ytData: Record<string, unknown> = {};
  const ytPaths = [
    join(process.cwd(), "..", "tools", "output", "youtube_analytics.json"),
    join(process.cwd(), "..", "shared", "data", "youtube_analytics.json"),
  ];
  for (const p of ytPaths) {
    try {
      if (existsSync(p)) { ytData = JSON.parse(readFileSync(p, "utf-8")); break; }
    } catch { /* skip */ }
  }

  const channelInfo = (ytData.channel_info as Record<string, unknown>) || {};
  const videos = (ytData.videos as Record<string, unknown>[]) || [];
  const topVideos = [...videos]
    .sort((a, b) => ((b.view_count as number) || 0) - ((a.view_count as number) || 0))
    .slice(0, 5)
    .map((v) => `"${v.title}" — ${v.view_count} views, ${v.like_count} likes`);

  const subs = (channelInfo.subscriber_count as number) || 359;
  const totalViews = (channelInfo.view_count as number) || 9600;
  const videoCount = (channelInfo.video_count as number) || 22;
  const watchHours = 430;

  const prompt = `You are a YouTube growth analyst providing daily insights for creator Anshuman Parmar.

CHANNEL STATS (${new Date().toDateString()}):
- Subscribers: ${subs} (need 500 for YPP — ${500 - subs} to go)
- Total Views: ${totalViews}
- Total Videos: ${videoCount}
- Watch Hours: ${watchHours} (need 4000 — ${4000 - watchHours} to go)
- YPP: ${Math.round((subs / 500) * 100)}% subs, ${Math.round((watchHours / 4000) * 100)}% watch hours

TOP VIDEOS:
${topVideos.join("\n") || "No video data"}

Creator: Indian tech creator, English content, AI/coding/automation niche
Goal: YPP monetization + ₹1L+ MRR

Generate exactly 6 sharp, brutally honest insights. Focus on:
1. What the data reveals about what's working
2. Critical path to YPP
3. Content gaps
4. Growth pattern analysis
5. Actionable next step

Return ONLY valid JSON array, no markdown:
[{"category":"Growth","title":"insight title","insight":"2-3 sentence data-backed insight","action":"one thing to do today","impact":"High","emoji":"🎯"}]`;

  try {
    const raw = await callAI(prompt);
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON in response");
    const insights: AiInsight[] = JSON.parse(match[0]);
    safeWriteCache(CACHE_FILE, { insights, generatedAt: Date.now() });
    return NextResponse.json({ insights, cached: false, generatedAt: Date.now() });
  } catch (e) {
    return NextResponse.json({ error: String(e), insights: [] }, { status: 500 });
  }
}
