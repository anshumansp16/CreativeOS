#!/usr/bin/env python3
"""
Content Calendar Generator - CreatorOS
Creates a 30-day content calendar based on channel insights.
"""

import os
import json
import sys
from pathlib import Path
from datetime import datetime, timedelta
import urllib.request
import urllib.parse

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

import anthropic

# Load YouTube analytics if available
analytics_file = Path(__file__).parent / "output" / "youtube_analytics.json"
CHANNEL_INSIGHTS = {}
if analytics_file.exists():
    with open(analytics_file) as f:
        CHANNEL_INSIGHTS = json.load(f)


def generate_calendar(num_videos: int = 8, start_date: str = None) -> dict:
    """Generate content calendar using Claude."""

    api_key = os.getenv("CLAUDE_API_KEY")
    if not api_key:
        print("ERROR: CLAUDE_API_KEY not found")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    # Build context from channel insights
    channel_context = ""
    if CHANNEL_INSIGHTS:
        channel = CHANNEL_INSIGHTS.get("channel", {})
        videos = CHANNEL_INSIGHTS.get("videos", [])[:5]

        channel_context = f"""
CHANNEL DATA:
- Subscribers: {channel.get('subscribers', 359)}
- Total Views: {channel.get('total_views', 0):,}
- Goal: Hit 500 subs for YPP, then 1000

TOP PERFORMING VIDEOS:
"""
        for v in videos:
            channel_context += f"- {v['title'][:50]}... ({v['views']:,} views, {v['engagement_rate']}% engagement)\n"

    if not start_date:
        start_date = datetime.now().strftime("%Y-%m-%d")

    prompt = f"""Create a 30-day content calendar for a Hindi tech YouTube channel.

{channel_context}

CONTENT STRATEGY:
- 2 videos per week (8 total in 30 days)
- Mix of: AI tools tutorials (Cursor, Claude, ChatGPT), productivity hacks, coding demos
- Target: Indian developers and tech enthusiasts
- Style: Demonstrations (building live), not boring tutorials
- Language: Hinglish (English with Hindi phrases)

VIDEO IDEAS TO INCLUDE:
1. "Building an AI Script Generator with Claude Code" (priority - record this week)
2. Cursor vs Claude Code comparison
3. Automation workflow with N8N
4. 5 AI Tools for developers
5. Vibe coding a full app in 30 min
6. MCP (Model Context Protocol) advanced tutorial
7. FREE alternatives to paid AI tools
8. Your complete AI workflow stack

Start date: {start_date}

For each video, provide:
1. Publish date (best days: Tue, Wed, Sun at 7pm IST)
2. Video title (viral optimized for India)
3. Video type (tutorial/demo/comparison/listicle)
4. Estimated production time (short/medium/long)
5. Priority (P1/P2/P3)

Output as JSON:
{{
  "calendar": [
    {{
      "date": "2024-01-15",
      "day": "Wednesday",
      "title": "Video title",
      "type": "demo",
      "duration": "8-12 min",
      "production_time": "medium",
      "priority": "P1",
      "notes": "Quick notes for this video"
    }}
  ],
  "weekly_breakdown": {{
    "week_1": ["video1", "video2"],
    "week_2": ["video3", "video4"],
    "week_3": ["video5", "video6"],
    "week_4": ["video7", "video8"]
  }},
  "content_pillars": ["AI Tools", "Productivity", "Coding"],
  "expected_outcomes": {{
    "target_subs": "500 (YPP milestone)",
    "target_views": "15000",
    "expected_watch_hours": "500+"
  }}
}}"""

    print(f"\n📅 Generating {num_videos}-video content calendar...")
    print(f"   Starting from: {start_date}")

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=3000,
        messages=[{"role": "user", "content": prompt}]
    )

    content = response.content[0].text

    try:
        json_start = content.find("{")
        json_end = content.rfind("}") + 1
        result = json.loads(content[json_start:json_end])
    except:
        result = {"raw": content}

    return result


def main():
    start_date = None
    if len(sys.argv) > 1:
        start_date = sys.argv[1]

    calendar = generate_calendar(start_date=start_date)

    print("\n" + "=" * 60)
    print("📅 30-DAY CONTENT CALENDAR")
    print("=" * 60)

    if "calendar" in calendar:
        print("\n📹 VIDEO SCHEDULE:")
        print("-" * 60)

        for i, video in enumerate(calendar["calendar"], 1):
            priority_emoji = {"P1": "🔴", "P2": "🟡", "P3": "🟢"}.get(video.get("priority", "P2"), "⚪")
            print(f"\n{priority_emoji} Video {i}: {video.get('date')} ({video.get('day', '')})")
            print(f"   📌 {video.get('title')}")
            print(f"   📊 Type: {video.get('type')} | ⏱️ {video.get('duration')} | 🏭 {video.get('production_time')}")
            if video.get("notes"):
                print(f"   💡 {video.get('notes')}")

        weekly = calendar.get("weekly_breakdown", {})
        if weekly:
            print("\n" + "=" * 60)
            print("📆 WEEKLY BREAKDOWN")
            print("=" * 60)
            for week, videos in weekly.items():
                print(f"\n{week.upper().replace('_', ' ')}:")
                for v in videos:
                    print(f"   → {v}")

        outcomes = calendar.get("expected_outcomes", {})
        if outcomes:
            print("\n" + "=" * 60)
            print("🎯 EXPECTED OUTCOMES (30 days)")
            print("=" * 60)
            for key, value in outcomes.items():
                print(f"   {key}: {value}")

    else:
        print(calendar.get("raw", calendar))

    # Save
    output_file = Path(__file__).parent / "output" / "content_calendar.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(calendar, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Saved to: {output_file}")


if __name__ == "__main__":
    main()
