import { NextResponse } from "next/server";

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

async function callAI(prompt: string): Promise<string> {
  const claudeKey = process.env.CLAUDE_API_KEY;
  if (claudeKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": claudeKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 1500, messages: [{ role: "user", content: prompt }] }),
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
  const { topic } = await req.json().catch(() => ({}));
  if (!topic) return NextResponse.json({ error: "Topic required" }, { status: 400 });

  const prompt = `YouTube SEO expert for Anshuman Parmar, Indian tech creator. Language: English only.

VIDEO TOPIC: "${topic}"

Write an optimized YouTube description in 3 parts:

PART 1 — HOOK (2 lines, appear in search preview):
[Compelling opener with primary keyword naturally included]

PART 2 — BODY (150-200 words):
[What the video covers, who it's for, what they'll learn. Use keyword variations. Write in "you".]

PART 3 — TAGS (comma-separated):
[15-20 tags: mix short-tail + long-tail. Indian search patterns. Include "Anshuman Parmar".]

CHAPTERS:
00:00 - Intro
[4-6 chapter titles based on topic]

Natural, not keyword-stuffed.`;

  try {
    const description = await callAI(prompt);
    return NextResponse.json({ description });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
