#!/usr/bin/env python3
"""
Idea Generator - CreatorOS
Generates and ranks video ideas using Claude.
Works standalone - just needs CLAUDE_API_KEY in .env
"""

import os
import json
import sys
from pathlib import Path
from datetime import datetime

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

import anthropic

# Your niche context
NICHE_CONTEXT = """
Channel: Hindi AI/Tech for Indian developers and solopreneurs
Focus: AI tools, productivity, vibe coding, automation
Audience: 18-35 year olds learning to build with AI
Style: Demonstrations (building things live), not tutorials
Goal: Show AI-assisted development process, failures included

Recent successful video topics in this niche:
- Building tools with Claude Code
- AI workflow automation
- Productivity systems for creators
- ChatGPT vs Claude comparisons
- No-code/low-code AI tools
"""

SYSTEM_PROMPT = f"""You are a YouTube content strategist for a Hindi tech channel.
Analyze and rank video ideas based on virality potential for this niche:

{NICHE_CONTEXT}

For each idea, score (1-10):
- Search demand: Existing search volume
- Trend alignment: Current interest/events
- Competition gap: Can we offer something unique?
- Audience fit: Does it match our viewers?
- Production ease: How fast can we make this? (higher = easier)
- Evergreen: Will it stay relevant?

Output as JSON:
{{
  "ranked_ideas": [
    {{
      "rank": 1,
      "idea": "Original idea",
      "title_suggestion": "Clickable YouTube title",
      "hook": "First 10 seconds hook",
      "scores": {{"search_demand": 8, "trend_alignment": 7, ...}},
      "total_score": 45,
      "reasoning": "Why this will work",
      "angle": "Unique angle to take"
    }}
  ],
  "top_pick": {{
    "idea": "The #1 recommendation",
    "why": "1-2 sentence pitch",
    "record_this_week": true/false
  }}
}}"""


def generate_ideas(seed_ideas: list = None, num_ideas: int = 5) -> dict:
    """Generate and rank video ideas."""

    api_key = os.getenv("CLAUDE_API_KEY")
    if not api_key:
        print("ERROR: CLAUDE_API_KEY not found in .env file")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    # Default seed ideas if none provided
    if not seed_ideas:
        seed_ideas = [
            "Building an AI script generator live",
            "How I use Claude Code daily",
            "My YouTube automation workflow with N8N",
            "AI tools I use for content creation",
            "Vibe coding a full app in 30 minutes",
            "ChatGPT vs Claude for developers",
            "Automating boring tasks with AI",
            "Building a RAG system from scratch"
        ]

    user_prompt = f"""Analyze and rank the TOP {num_ideas} video ideas for my channel.

SEED IDEAS (expand, combine, or suggest better alternatives):
{json.dumps(seed_ideas, indent=2)}

Current date: {datetime.now().strftime('%B %Y')}

Requirements:
1. Rank by total virality potential
2. Each idea must be filmable in one session
3. Prefer "demonstration" style (building live) over tutorials
4. Include a specific hook for each
5. Be brutally honest about weak ideas

Generate the ranked ideas now."""

    print(f"\n💡 Generating {num_ideas} video ideas...")
    print("   Analyzing trends and competition...")
    print("   Calling Claude...\n")

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=3000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}]
    )

    content = response.content[0].text

    # Parse JSON
    try:
        json_start = content.find("{")
        json_end = content.rfind("}") + 1
        if json_start != -1:
            ideas = json.loads(content[json_start:json_end])
        else:
            ideas = {"raw_response": content}
    except json.JSONDecodeError:
        ideas = {"raw_response": content}

    return ideas


def main():
    if len(sys.argv) > 1 and sys.argv[1] in ["-h", "--help"]:
        print("""
╔═══════════════════════════════════════════════════════════════╗
║           CreatorOS Idea Generator                            ║
╚═══════════════════════════════════════════════════════════════╝

Usage: python idea_generator.py [seed ideas...]

Examples:
  python idea_generator.py
  python idea_generator.py "AI productivity" "Claude tutorials" "Automation"

Options:
  -n, --num    Number of ideas to generate (default: 5)
""")
        sys.exit(0)

    # Parse seed ideas from args
    seed_ideas = None
    num_ideas = 5

    args = sys.argv[1:]
    filtered_args = []
    i = 0
    while i < len(args):
        if args[i] in ["-n", "--num"] and i + 1 < len(args):
            num_ideas = int(args[i + 1])
            i += 2
        else:
            filtered_args.append(args[i])
            i += 1

    if filtered_args:
        seed_ideas = filtered_args

    ideas = generate_ideas(seed_ideas, num_ideas)

    # Pretty print
    print("=" * 60)
    print("💡 RANKED VIDEO IDEAS")
    print("=" * 60)

    if "ranked_ideas" in ideas:
        for idea in ideas["ranked_ideas"]:
            print(f"\n#{idea.get('rank', '?')} | Score: {idea.get('total_score', '?')}/60")
            print(f"📌 {idea.get('title_suggestion', idea.get('idea', 'N/A'))}")
            print(f"🪝 Hook: {idea.get('hook', 'N/A')}")
            print(f"💭 Angle: {idea.get('angle', 'N/A')}")
            print(f"📊 Scores: {idea.get('scores', {})}")
            print(f"📝 Why: {idea.get('reasoning', 'N/A')}")

        top = ideas.get("top_pick", {})
        print("\n" + "=" * 60)
        print("🏆 TOP PICK FOR THIS WEEK")
        print("=" * 60)
        print(f"→ {top.get('idea', 'N/A')}")
        print(f"→ {top.get('why', 'N/A')}")
        if top.get('record_this_week'):
            print("⚡ RECORD THIS WEEK!")
    else:
        print(ideas.get("raw_response", ideas))

    # Save
    output_file = Path(__file__).parent / "output" / f"ideas_{datetime.now().strftime('%Y%m%d')}.json"
    output_file.parent.mkdir(exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(ideas, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Saved to: {output_file}")


if __name__ == "__main__":
    main()
