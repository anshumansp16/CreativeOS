import { NextResponse } from "next/server";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
const CACHE_FILE = join(process.cwd(), "..", "tools", "output", "ideas_cache.json");
const CALENDAR_FILE = join(process.cwd(), "..", "tools", "output", "content_calendar.json");
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface TrendData { title: string; viewCount: number; channelTitle: string; }
interface HNItem { id: number; title: string; url?: string; score: number; descendants?: number; time: number; }
interface GHRepo { full_name: string; description: string | null; stargazers_count: number; language: string | null; topics: string[]; html_url: string; created_at: string; }
interface CalendarEntry { date: string; title: string; type?: string; priority?: string; }
interface IdeaResult {
  title: string; hook: string; category: string;
  searchDemand: "High" | "Medium" | "Low"; competition: "Low" | "Medium" | "High";
  successProbability: number; estimatedViews: string; targetAudience: string;
  whyNow: string; seoKeywords: string[]; trendScore: number;
  source?: "trend" | "calendar" | "creative" | "launch";
}

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------
function safeWriteCache(file: string, data: unknown) {
  try { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(data, null, 2)); }
  catch { /* ignore */ }
}
function safeReadCache(file: string) {
  try {
    if (!existsSync(file)) return null;
    const parsed = JSON.parse(readFileSync(file, "utf-8"));
    if (!parsed || typeof parsed.generatedAt !== "number") return null;
    return parsed;
  } catch { return null; }
}
function readCalendar(): CalendarEntry[] {
  try {
    if (!existsSync(CALENDAR_FILE)) return [];
    const data = JSON.parse(readFileSync(CALENDAR_FILE, "utf-8"));
    const entries: CalendarEntry[] = data?.calendar || data?.videos || (Array.isArray(data) ? data : []);
    const today = new Date().toISOString().split("T")[0];
    return entries.filter(e => e.date >= today).slice(0, 8);
  } catch { return []; }
}

// ---------------------------------------------------------------------------
// Data sources — all public, no auth required
// ---------------------------------------------------------------------------

/** Hacker News: top + newest stories filtered to AI/dev relevance */
async function fetchHackerNews(): Promise<string[]> {
  const keywords = [
    "gpt","claude","openai","anthropic","gemini","llm","ai","agent","cursor","copilot",
    "langchain","rag","vector","embedding","inference","mcp","vibe coding","serverless",
    "aws","terraform","docker","kubernetes","rust","typescript","nextjs","react","devops",
    "launch","release","new","open source","github","tool","framework","api","sdk",
    "model","fine-tun","hugging face","mistral","groq","ollama","local ai",
  ];
  const devTopics = new RegExp(keywords.join("|"), "i");

  try {
    const [topIds, newIds] = await Promise.all([
      fetch("https://hacker-news.firebaseio.com/v0/topstories.json").then(r => r.json()),
      fetch("https://hacker-news.firebaseio.com/v0/newstories.json").then(r => r.json()),
    ]) as [number[], number[]];

    // Sample top 60 + newest 40, deduplicate
    const ids = [...new Set([...topIds.slice(0, 60), ...newIds.slice(0, 40)])].slice(0, 80);

    const items = await Promise.all(
      ids.map(id =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          .then(r => r.json())
          .catch(() => null)
      )
    ) as (HNItem | null)[];

    return items
      .filter((i): i is HNItem => !!i && !!i.title && devTopics.test(i.title) && i.score > 10)
      .sort((a, b) => b.score - a.score)
      .slice(0, 25)
      .map(i => `• [HN ${i.score}pts] ${i.title}${i.url ? ` (${new URL(i.url).hostname})` : ""}`);
  } catch { return []; }
}

/** GitHub: repos created in the last 30 days with the most stars (AI/dev tools focus) */
async function fetchGitHubLaunches(): Promise<string[]> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const queries = [
    `created:>${since} language:python topic:llm`,
    `created:>${since} topic:ai-agent`,
    `created:>${since} topic:mcp-server`,
    `created:>${since} topic:generative-ai stars:>50`,
    `created:>${since} topic:developer-tools stars:>100`,
  ];

  const repos: GHRepo[] = [];
  for (const q of queries) {
    try {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=8`;
      const res = await fetch(url, { headers: { "Accept": "application/vnd.github+json" } });
      if (!res.ok) continue;
      const data = await res.json();
      repos.push(...(data.items || []));
    } catch { /* skip */ }
  }

  // Deduplicate by full_name and sort by stars
  const seen = new Set<string>();
  return repos
    .filter(r => { if (seen.has(r.full_name)) return false; seen.add(r.full_name); return true; })
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 20)
    .map(r => `• [GH ⭐${r.stargazers_count}] ${r.full_name} — ${r.description || "No description"} (${r.language || "?"})${r.topics.length ? ` [${r.topics.slice(0, 4).join(",")}]` : ""}`);
}

/** Product Hunt: public RSS feed, parse top recent launches */
async function fetchProductHuntLaunches(): Promise<string[]> {
  try {
    const res = await fetch("https://www.producthunt.com/feed?category=developer-tools", {
      headers: { "Accept": "application/rss+xml,application/xml,text/xml" },
    });
    if (!res.ok) return [];
    const text = await res.text();
    const items: string[] = [];
    // Simple RSS title extraction
    const titleMatches = text.matchAll(/<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>[\s\S]*?<description><!\[CDATA\[(.*?)\]\]><\/description>[\s\S]*?<\/item>/g);
    for (const m of titleMatches) {
      const title = m[1]?.trim();
      const desc = m[2]?.replace(/<[^>]+>/g, "").trim().slice(0, 120);
      if (title) items.push(`• [PH] ${title}${desc ? ` — ${desc}` : ""}`);
      if (items.length >= 12) break;
    }
    // Fallback: simpler pattern
    if (!items.length) {
      const simpleTitles = text.matchAll(/<title>([^<]{10,120})<\/title>/g);
      let count = 0;
      for (const m of simpleTitles) {
        const t = m[1].trim();
        if (!t.toLowerCase().includes("product hunt") && count < 10) {
          items.push(`• [PH] ${t}`); count++;
        }
      }
    }
    return items;
  } catch { return []; }
}

/** YouTube trends — search recently popular dev videos in India */
async function fetchYouTubeTrends(): Promise<TrendData[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const queries = [
    "AI agent 2026 tutorial", "new AI tool developer 2026",
    "cursor IDE vs claude code 2026", "GPT-5 tutorial india",
    "Claude 4 opus tutorial", "open source AI tool 2026",
    "vibe coding tutorial fullstack", "MCP server build tutorial",
    "AWS GenAI bedrock 2026", "LLM fine tuning 2026 india",
  ];
  const sampled = queries.sort(() => Math.random() - 0.5).slice(0, 5);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const allVideos: TrendData[] = [];

  for (const query of sampled) {
    try {
      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&regionCode=IN&relevanceLanguage=en&order=viewCount&maxResults=5&publishedAfter=${thirtyDaysAgo}&key=${apiKey}`
      );
      if (!searchRes.ok) continue;
      const searchData = await searchRes.json();
      const videoIds = (searchData.items || []).map((i: { id?: { videoId?: string } }) => i.id?.videoId).filter(Boolean);
      if (!videoIds.length) continue;
      const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(",")}&key=${apiKey}`);
      if (!statsRes.ok) continue;
      const statsData = await statsRes.json();
      for (const item of statsData.items || []) {
        allVideos.push({ title: item.snippet?.title || "", viewCount: parseInt(item.statistics?.viewCount || "0"), channelTitle: item.snippet?.channelTitle || "" });
      }
    } catch { /* skip */ }
  }
  return allVideos;
}

// ---------------------------------------------------------------------------
// AI call
// ---------------------------------------------------------------------------
async function callAI(prompt: string): Promise<string> {
  const claudeKey = process.env.CLAUDE_API_KEY;
  if (claudeKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": claudeKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 4096, messages: [{ role: "user", content: prompt }] }),
      });
      if (res.ok) { const d = await res.json(); if (d.content?.[0]?.text) return d.content[0].text; }
    } catch { /* fall through */ }
  }
  try {
    const r = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama3.2", prompt, stream: false }),
    });
    if (r.ok) { const d = await r.json(); if (d.response) return d.response; }
  } catch { /* Ollama not running */ }
  throw new Error("AI unavailable: check CLAUDE_API_KEY or start Ollama");
}

// ---------------------------------------------------------------------------
// Main idea generation
// ---------------------------------------------------------------------------
async function generateIdeas(): Promise<{ ideas: IdeaResult[]; error?: string }> {
  // Fetch all data sources in parallel
  const [ytTrends, hnItems, ghRepos, phLaunches, calendar] = await Promise.all([
    fetchYouTubeTrends(),
    fetchHackerNews(),
    fetchGitHubLaunches(),
    fetchProductHuntLaunches(),
    Promise.resolve(readCalendar()),
  ]);

  const ytSummary = ytTrends
    .sort((a, b) => b.viewCount - a.viewCount).slice(0, 15)
    .map(v => `• "${v.title}" (${Math.round(v.viewCount / 1000)}K views)`)
    .join("\n");

  const hnSummary = hnItems.length
    ? `\nHACKER NEWS — trending now (tech/AI):\n${hnItems.join("\n")}`
    : "";

  const ghSummary = ghRepos.length
    ? `\nGITHUB — new repos gaining stars fast (last 30 days):\n${ghRepos.join("\n")}`
    : "";

  const phSummary = phLaunches.length
    ? `\nPRODUCT HUNT — recent developer tool launches:\n${phLaunches.join("\n")}`
    : "";

  const calendarContext = calendar.length
    ? `\nCONTENT CALENDAR (upcoming planned topics — generate adjacent ideas):\n${calendar.map(e => `• [${e.date}] "${e.title}" (${e.type || "video"})`).join("\n")}`
    : "";

  const prompt = `You are a YouTube growth strategist for Indian tech creators. Today is ${new Date().toDateString()}.

Your job: analyze LIVE data from multiple sources to find video ideas with high search demand and low competition.

═══════════════════════════════════════════════════
📊 LIVE DATA — analyze these carefully
═══════════════════════════════════════════════════
${ytSummary ? `YOUTUBE TRENDING (India, last 30 days):\n${ytSummary}` : "YouTube API unavailable — use your knowledge of Indian dev YouTube in 2026."}
${hnSummary}
${ghSummary}
${phSummary}
${calendarContext}

═══════════════════════════════════════════════════
👤 CREATOR PROFILE — Anshuman Parmar
═══════════════════════════════════════════════════
• Subscribers: 359 (targeting 500 for YPP)
• Background: Fullstack dev — AWS, GenAI, system design, DevOps, automation, AI tools
• Niche: Developer education in English for Indian tech audience
• Style: Tutorial + live demos, authentic dev voice, hands-on builds
• Audience: Indian devs 0–5 yrs exp, startup workers, job seekers, freelancers
• PROVEN HIT formats: "Tool A vs Tool B", "Build X in 30 min", "FREE alternatives to paid X", "I tried X for 30 days", "Top N tools for Y"

═══════════════════════════════════════════════════
🎯 GENERATE 14 video ideas
═══════════════════════════════════════════════════
MUST include ALL these types:
1. LAUNCH REACTION (3): A brand-new tool/model/framework from the live data above — first-mover advantage, "New:" or "Just Launched:" in title
2. COMPARISON (2): Head-to-head of tools/approaches — always high CTR
3. BUILD/DEMO (2): "Build X in Y minutes" hands-on coding video
4. LISTICLE (2): "Best X for Y" or "Top N tools" — SEO evergreen
5. DEEP DIVE (2): Advanced tutorial on a specific tech mentioned in the live data
6. CALENDAR-INSPIRED (1): Adjacent to content calendar topics above
7. CREATIVE WILDCARD (2): "I tried X for 30 days", hidden features, cost breakdown in INR, myth-busting

STRICT RULES:
• Titles: SEO-optimized, ≤70 chars, SPECIFIC not generic (never "What is AI")
• "source":"launch" for ideas sourced from HN/GitHub/Product Hunt live data
• "source":"trend" for YouTube trending-based ideas
• "source":"calendar" for calendar-inspired ideas
• "source":"creative" for wildcard ideas
• Cover categories: GenAI Dev, AWS & Cloud, Fullstack, DevOps, AI Tools, System Design, Career
• Max 2 per category
• whyNow: mention the SPECIFIC tool/launch/trend that makes this timely right now
• Indian angle where relevant: INR costs, Indian job market, real dev reality

Return ONLY a valid JSON array (no markdown, no fences):
[{"title":"...","hook":"...","category":"GenAI Dev","searchDemand":"High","competition":"Low","successProbability":78,"estimatedViews":"5K-15K","targetAudience":"...","whyNow":"...","seoKeywords":["kw1","kw2","kw3"],"trendScore":85,"source":"launch"}]`;

  try {
    const raw = await callAI(prompt);
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array in AI response");
    const ideas: IdeaResult[] = JSON.parse(match[0]);
    return { ideas };
  } catch (e) {
    return { ideas: [], error: String(e) };
  }
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------
export async function GET() {
  const cached = safeReadCache(CACHE_FILE);
  if (cached && Date.now() - cached.generatedAt < CACHE_TTL_MS && cached.ideas?.length > 0) {
    return NextResponse.json({ ideas: cached.ideas, cached: true, generatedAt: cached.generatedAt });
  }
  const { ideas, error } = await generateIdeas();
  if (error && !ideas.length) return NextResponse.json({ error, ideas: [] }, { status: 500 });
  safeWriteCache(CACHE_FILE, { ideas, generatedAt: Date.now() });
  return NextResponse.json({ ideas, cached: false, generatedAt: Date.now() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body?.forceRefresh) safeWriteCache(CACHE_FILE, { ideas: [], generatedAt: 0 });
  return GET();
}
