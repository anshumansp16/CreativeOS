#!/usr/bin/env python3
"""
Viral Content Generator - CreatorOS
Generates viral titles, descriptions, and thumbnails optimized for Indian audience.
"""

import os
import json
import sys
from pathlib import Path
from datetime import datetime

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

import anthropic

VIRAL_SYSTEM_PROMPT = """You are a YouTube growth expert specializing in viral tech content for Indian audience.
You understand what makes content go viral in India - the psychology, the hooks, the trends.

Key viral triggers for Indian tech audience:
- Numbers and specificity ("5 AI Tools", "In 30 Minutes", "₹0 Cost")
- Transformation promises ("Beginner to Pro", "10x Productivity")
- Curiosity gaps ("Why Nobody Talks About This", "Secret Method")
- Fear of missing out ("Before It's Too Late", "Most People Don't Know")
- Relatable struggles ("As a Developer", "Without Coding")
- Hindi-English mix in thumbnails for authenticity

Output as JSON with:
{
  "titles": [
    {"title": "...", "viral_score": 9, "hook_type": "curiosity/fomo/transformation/number"}
  ],
  "description": "Full SEO-optimized YouTube description",
  "thumbnail_text": ["3-4 word text options for thumbnail"],
  "hashtags": ["#tag1", "#tag2"],
  "tags": ["seo tag 1", "seo tag 2"],
  "best_upload_time": "IST time recommendation",
  "target_audience_hook": "What makes this video click-worthy for Indian viewers"
}"""


def generate_viral_content(topic: str, script_summary: str = "") -> dict:
    """Generate viral-optimized content for India."""

    api_key = os.getenv("CLAUDE_API_KEY")
    if not api_key:
        print("ERROR: CLAUDE_API_KEY not found")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    prompt = f"""Generate VIRAL YouTube content for Indian tech audience:

TOPIC: {topic}
SUMMARY: {script_summary if script_summary else "AI-assisted development demonstration showing the full build process"}

Requirements:
1. Generate 5 viral title options (rank by viral potential 1-10)
2. Full YouTube description (SEO optimized, English, under 2000 chars)
3. 3 thumbnail text options (max 4 words each, English with optional Hindi words)
4. 15 SEO tags
5. 5 hashtags
6. Best upload time for India

Make titles click-worthy but NOT clickbait. Deliver real value.
Focus on what Indian developers and tech enthusiasts care about."""

    print(f"\n🔥 Generating viral content for: {topic}")
    print("   Analyzing Indian market trends...")

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2500,
        system=VIRAL_SYSTEM_PROMPT,
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
    if len(sys.argv) < 2:
        # Default to the top idea
        topic = "Building an AI Script Generator with Claude - Live Coding Demo"
    else:
        topic = sys.argv[1]

    summary = ""
    for i, arg in enumerate(sys.argv):
        if arg == "--summary" and i + 1 < len(sys.argv):
            summary = sys.argv[i + 1]

    result = generate_viral_content(topic, summary)

    print("\n" + "=" * 60)
    print("🔥 VIRAL CONTENT PACKAGE")
    print("=" * 60)

    if "titles" in result:
        print("\n📌 TITLE OPTIONS (ranked by viral potential):")
        for i, t in enumerate(result.get("titles", []), 1):
            print(f"   {i}. [{t.get('viral_score', '?')}/10] {t.get('title')}")
            print(f"      Hook: {t.get('hook_type', 'N/A')}")

        print(f"\n📝 DESCRIPTION:\n{result.get('description', 'N/A')}")
        print(f"\n🖼️ THUMBNAIL TEXT OPTIONS:")
        for t in result.get("thumbnail_text", []):
            print(f"   → {t}")

        print(f"\n#️⃣ HASHTAGS: {' '.join(result.get('hashtags', []))}")
        print(f"\n🏷️ TAGS: {', '.join(result.get('tags', []))}")
        print(f"\n⏰ BEST UPLOAD TIME: {result.get('best_upload_time', 'N/A')}")
        print(f"\n🎯 TARGET HOOK: {result.get('target_audience_hook', 'N/A')}")
    else:
        print(result.get("raw", result))

    # Save
    output_file = Path(__file__).parent / "output" / f"viral_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
    output_file.parent.mkdir(exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Saved to: {output_file}")


if __name__ == "__main__":
    main()
