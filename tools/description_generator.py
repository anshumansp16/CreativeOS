#!/usr/bin/env python3
"""
Description Generator - CreatorOS
Generates YouTube descriptions, tags, and SEO metadata using Claude Haiku (cheap & fast).
Works standalone - just needs CLAUDE_API_KEY in .env
"""

import os
import json
import sys
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

import anthropic

SYSTEM_PROMPT = """You are a YouTube SEO specialist for a Hindi tech channel.
Create optimized descriptions that drive clicks and improve discoverability.

Channel context:
- Hindi/Hinglish tech content
- Focus: AI tools, productivity, coding, automation
- Audience: Indian developers and solopreneurs

Output as JSON:
{
  "description": "Full YouTube description with emojis and sections",
  "first_line": "Crucial first 150 chars (shows in search)",
  "timestamps": ["0:00 Section name", ...],
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "tags": ["tag1", "tag2", ...],
  "seo_title": "Alternative SEO-optimized title if needed"
}"""


def generate_description(
    title: str,
    script_summary: str = "",
    sections: list = None
) -> dict:
    """Generate YouTube description and metadata."""

    api_key = os.getenv("CLAUDE_API_KEY")
    if not api_key:
        print("ERROR: CLAUDE_API_KEY not found in .env file")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    sections_text = ""
    if sections:
        sections_text = "\n".join([f"- {s}" for s in sections])

    user_prompt = f"""Create a YouTube description for this video:

TITLE: {title}

SCRIPT SUMMARY:
{script_summary if script_summary else "No summary provided - infer from title"}

VIDEO SECTIONS:
{sections_text if sections_text else "Infer logical sections from title/summary"}

Requirements:
1. First 150 characters MUST be compelling (shows in search results)
2. Include the main keyword naturally in first sentence
3. Add timestamps section
4. Use emojis sparingly but strategically
5. Include 5 relevant hashtags
6. Generate 10-15 SEO tags
7. Keep under 2000 characters total
8. Natural language - no keyword stuffing

Generate the complete description now."""

    print(f"\n📋 Generating description for: {title}")
    print("   Using Claude Haiku (fast & cheap)...\n")

    response = client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=1500,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}]
    )

    content = response.content[0].text

    # Parse JSON
    try:
        json_start = content.find("{")
        json_end = content.rfind("}") + 1
        if json_start != -1:
            result = json.loads(content[json_start:json_end])
        else:
            result = {"description": content}
    except json.JSONDecodeError:
        result = {"description": content}

    return result


def main():
    if len(sys.argv) < 2:
        print("""
╔═══════════════════════════════════════════════════════════════╗
║           CreatorOS Description Generator                     ║
╚═══════════════════════════════════════════════════════════════╝

Usage: python description_generator.py "Video Title"

Options:
  --summary "Brief summary of video content"
  --sections "Intro,Main Content,Demo,Conclusion"

Examples:
  python description_generator.py "I Built an AI Script Generator in 2 Hours"
  python description_generator.py "Claude vs ChatGPT" --summary "Comparing both for coding tasks"
""")
        sys.exit(0)

    title = sys.argv[1]
    summary = ""
    sections = None

    # Parse args
    for i, arg in enumerate(sys.argv):
        if arg == "--summary" and i + 1 < len(sys.argv):
            summary = sys.argv[i + 1]
        if arg == "--sections" and i + 1 < len(sys.argv):
            sections = sys.argv[i + 1].split(",")

    result = generate_description(title, summary, sections)

    # Pretty print
    print("=" * 60)
    print("📋 GENERATED DESCRIPTION")
    print("=" * 60)

    if "description" in result:
        print(f"\n📝 Description:\n{result['description']}")
        print(f"\n🔍 First Line (search preview):\n{result.get('first_line', 'N/A')}")
        print(f"\n⏱️ Timestamps:\n{chr(10).join(result.get('timestamps', []))}")
        print(f"\n#️⃣ Hashtags: {' '.join(result.get('hashtags', []))}")
        print(f"\n🏷️ Tags: {', '.join(result.get('tags', []))}")

        if result.get('seo_title'):
            print(f"\n🎯 SEO Title Alternative: {result['seo_title']}")
    else:
        print(result)

    # Save
    output_file = Path(__file__).parent / "output" / f"desc_{title[:30].replace(' ', '_')}.json"
    output_file.parent.mkdir(exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Saved to: {output_file}")

    # Also save just the description as .txt for easy copy-paste
    txt_file = output_file.with_suffix('.txt')
    with open(txt_file, "w", encoding="utf-8") as f:
        f.write(result.get('description', ''))
        f.write("\n\n" + " ".join(result.get('hashtags', [])))
    print(f"📄 Plain text: {txt_file}")


if __name__ == "__main__":
    main()
