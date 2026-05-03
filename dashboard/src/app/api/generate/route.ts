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

type ContentType = "linkedin" | "twitter" | "hashtags";

const PROMPTS: Record<ContentType, (topic: string) => string> = {
  linkedin: (topic) => `LinkedIn post about: "${topic}"
Creator: Anshuman Parmar — Indian tech creator, AI/automation educator
Language: English only. Tone: founder-voice, authentic, not corporate. Length: 150-200 words.

Structure:
- Hook (standalone first line, thought-provoking)
- 3-4 short paragraphs (2-3 lines each)
- Practical takeaway
- CTA (follow for AI content)
- 5 hashtags at bottom

Focus on INSIGHT from the topic, not video promo.`,

  twitter: (topic) => `Twitter/X thread about: "${topic}"
Creator: Anshuman Parmar — Indian AI creator
Language: English. Tone: punchy, high-value, no fluff.

Tweet 1 (hook): [provocative statement or stat, max 240 chars]
Tweet 2: [point 1, max 240 chars]
Tweet 3: [point 2, max 240 chars]
Tweet 4: [point 3, max 240 chars]
Tweet 5 (CTA): [follow + YouTube, max 240 chars]

Each tweet standalone valuable. Use numbers when possible.`,

  hashtags: (topic) => `Generate 25 YouTube hashtags for: "${topic}"
Target: Indian tech audience, English content
Mix: 5 broad (#AI #India), 10 mid-tail (topic-specific), 10 long-tail (niche but searchable)
Respond with ONLY hashtags, space-separated, each starting with #. No explanation.`,
};

export async function POST(req: Request) {
  const { topic, type } = await req.json().catch(() => ({}));
  if (!topic || !type) return NextResponse.json({ error: "Topic and type required" }, { status: 400 });
  if (!PROMPTS[type as ContentType]) return NextResponse.json({ error: "Unknown type" }, { status: 400 });

  try {
    const content = await callAI(PROMPTS[type as ContentType](topic));
    return NextResponse.json({ content, type });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
