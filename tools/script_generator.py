#!/usr/bin/env python3
"""
Script Generator - CreatorOS
Generates full Hindi/Hinglish YouTube scripts using Claude Sonnet.
Works standalone - just needs CLAUDE_API_KEY in .env
"""

import os
import json
import sys
from pathlib import Path

# Load environment
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

import anthropic

# Your brand voice context (embedded for standalone use)
BRAND_VOICE = """
## Voice Characteristics
- Conversational: Write like you're explaining to a curious friend
- Authentic: Avoid corporate jargon
- Energetic: Maintain enthusiasm without being over-the-top
- Hinglish-friendly: Mix Hindi and English naturally

## Script Structure
1. Hook (0-10 seconds): Grab attention immediately - show the end result first
2. Problem (10-30 seconds): Define what the viewer struggles with
3. Solution (30-180 seconds): Deliver the core content
4. Call to Action (Last 10 seconds): Clear next step

## Target Audience
- Indian developers and solopreneurs
- Age 18-35, tech-savvy
- Want to learn AI tools, productivity, coding faster
- Interested in vibe coding / AI-assisted development

## Style Notes
- 8-12 minute videos (demonstrations, not tutorials)
- Show the process including failures
- 2x speed for boring parts, full speed for judgment moments
- No lengthy intros or "don't forget to subscribe" at start
"""

SYSTEM_PROMPT = f"""You are a YouTube script writer for a Hindi tech/productivity channel.
Your scripts are engaging, authentic, and optimized for retention.

{BRAND_VOICE}

Output format: JSON with this structure:
{{
  "title": "Optimized video title (max 60 chars, curiosity-driven)",
  "hook": "First 10 seconds - attention grabber showing end result",
  "sections": [
    {{
      "timestamp": "0:00",
      "name": "Section name",
      "script": "Full script text in Hinglish",
      "visual_notes": "B-roll or screen recording suggestions",
      "duration_seconds": 30
    }}
  ],
  "call_to_action": "Specific closing CTA",
  "thumbnail_ideas": ["Idea 1", "Idea 2"],
  "tags": ["tag1", "tag2", "tag3"]
}}"""


def generate_script(topic: str, style: str = "demonstration", duration: str = "medium") -> dict:
    """Generate a full YouTube script for the given topic."""

    api_key = os.getenv("CLAUDE_API_KEY")
    if not api_key:
        print("ERROR: CLAUDE_API_KEY not found in .env file")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    duration_map = {
        "short": "3-5 minutes (quick demo)",
        "medium": "8-12 minutes (full demonstration)",
        "long": "15-20 minutes (deep dive)"
    }

    user_prompt = f"""Write a complete YouTube script for:

TOPIC: {topic}
STYLE: {style} (showing the build process, not just explaining)
TARGET DURATION: {duration_map.get(duration, duration_map["medium"])}

Requirements:
1. Start with a powerful hook showing the END RESULT first (what they'll have by end of video)
2. Use conversational Hinglish naturally
3. Include visual notes for screen recording / B-roll
4. Structure for a demonstration video (build something live)
5. End with specific, actionable CTA

Write the complete script now."""

    print(f"\n🎬 Generating script for: {topic}")
    print(f"   Style: {style} | Duration: {duration}")
    print("   Calling Claude Sonnet...\n")

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}]
    )

    content = response.content[0].text

    # Parse JSON from response
    try:
        # Find JSON in response
        json_start = content.find("{")
        json_end = content.rfind("}") + 1
        if json_start != -1 and json_end > json_start:
            script = json.loads(content[json_start:json_end])
        else:
            script = {"raw_response": content}
    except json.JSONDecodeError:
        script = {"raw_response": content}

    return script


def main():
    if len(sys.argv) < 2:
        print("""
╔═══════════════════════════════════════════════════════════════╗
║           CreatorOS Script Generator                          ║
╚═══════════════════════════════════════════════════════════════╝

Usage: python script_generator.py "Your video topic"

Options:
  --style    demonstration (default), tutorial, storytelling
  --duration short (3-5min), medium (8-12min), long (15-20min)

Examples:
  python script_generator.py "Building an AI script generator with Claude"
  python script_generator.py "How I automate my YouTube workflow" --duration short
  python script_generator.py "Claude vs ChatGPT for coding" --style demonstration
""")
        sys.exit(0)

    topic = sys.argv[1]
    style = "demonstration"
    duration = "medium"

    # Parse optional args
    for i, arg in enumerate(sys.argv):
        if arg == "--style" and i + 1 < len(sys.argv):
            style = sys.argv[i + 1]
        if arg == "--duration" and i + 1 < len(sys.argv):
            duration = sys.argv[i + 1]

    script = generate_script(topic, style, duration)

    # Pretty print
    print("=" * 60)
    print("📝 GENERATED SCRIPT")
    print("=" * 60)

    if "title" in script:
        print(f"\n🎯 Title: {script['title']}")
        print(f"\n🪝 Hook:\n{script.get('hook', 'N/A')}")

        print("\n📋 Sections:")
        for section in script.get("sections", []):
            print(f"\n[{section.get('timestamp', '?')}] {section.get('name', 'Untitled')}")
            print(f"Duration: {section.get('duration_seconds', '?')}s")
            print(f"Script: {section.get('script', '')[:200]}...")
            print(f"Visuals: {section.get('visual_notes', 'N/A')}")

        print(f"\n🎬 CTA: {script.get('call_to_action', 'N/A')}")
        print(f"\n🖼️ Thumbnail Ideas: {script.get('thumbnail_ideas', [])}")
        print(f"\n🏷️ Tags: {script.get('tags', [])}")
    else:
        print(script.get("raw_response", script))

    # Save to file
    output_file = Path(__file__).parent / "output" / f"script_{topic[:30].replace(' ', '_')}.json"
    output_file.parent.mkdir(exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(script, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Saved to: {output_file}")


if __name__ == "__main__":
    main()
