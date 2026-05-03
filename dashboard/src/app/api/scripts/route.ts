import { NextResponse } from "next/server";

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

async function callAI(prompt: string): Promise<string> {
  const claudeKey = process.env.CLAUDE_API_KEY;
  if (claudeKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": claudeKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
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

export async function POST(req: Request) {
  const { topic, style = "educational" } = await req.json().catch(() => ({}));
  if (!topic) return NextResponse.json({ error: "Topic required" }, { status: 400 });

  const prompt = `You are a YouTube script strategist for Anshuman Parmar, an Indian tech creator making English content about AI tools, automation, coding, and productivity.

VIDEO TOPIC: "${topic}"
STYLE: ${style}
LANGUAGE: English only

Create a VIDEO SCRIPT OUTLINE (not a full word-for-word script):

HOOK (15 seconds):
[Exact opening line — provocative, problem-focused or surprising stat. What to literally say.]

INTRO (30 seconds):
[What this covers + why watch till end]

SECTION 1: [Name]
• Key point — brief detail
• Key point — brief detail

SECTION 2: [Name]
• Key point — brief detail
• Key point — brief detail

SECTION 3: [Name]
• Key point — brief detail
• Key point — brief detail

DEMO/SCREEN TIME:
[What to show on screen]

CTA (30 seconds):
[Specific ask — subscribe, comment what, next video]

THUMBNAIL CONCEPT:
[One line]

TITLE OPTIONS (3, SEO-optimized):
1.
2.
3.

Keep key points to 1-2 lines. Specific, not generic.`;

  try {
    const script = await callAI(prompt);
    return NextResponse.json({ script });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
