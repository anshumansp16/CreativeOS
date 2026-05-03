#!/usr/bin/env python3
"""
CreatorOS Quick Runner
Run all tools from one place.
"""

import subprocess
import sys
from pathlib import Path

TOOLS_DIR = Path(__file__).parent

def main():
    print("""
╔═══════════════════════════════════════════════════════════════╗
║                    CreatorOS Tools                            ║
║              AI-Powered Content Creation                      ║
╚═══════════════════════════════════════════════════════════════╝

Choose a tool:

  1. 💡 Idea Generator    - Get ranked video ideas
  2. 📝 Script Generator  - Full Hindi/Hinglish script
  3. 📋 Description Gen   - YouTube SEO description

  q. Quit
""")

    choice = input("Enter choice (1-3 or q): ").strip()

    if choice == "1":
        print("\n💡 IDEA GENERATOR")
        print("-" * 40)
        seed = input("Enter seed ideas (comma-separated, or press Enter for defaults): ").strip()

        cmd = [sys.executable, str(TOOLS_DIR / "idea_generator.py")]
        if seed:
            cmd.extend(seed.split(","))

        subprocess.run(cmd)

    elif choice == "2":
        print("\n📝 SCRIPT GENERATOR")
        print("-" * 40)
        topic = input("Enter video topic: ").strip()
        if not topic:
            topic = "Building an AI tool with Claude"

        style = input("Style (demonstration/tutorial/storytelling) [demonstration]: ").strip() or "demonstration"
        duration = input("Duration (short/medium/long) [medium]: ").strip() or "medium"

        subprocess.run([
            sys.executable, str(TOOLS_DIR / "script_generator.py"),
            topic, "--style", style, "--duration", duration
        ])

    elif choice == "3":
        print("\n📋 DESCRIPTION GENERATOR")
        print("-" * 40)
        title = input("Enter video title: ").strip()
        if not title:
            title = "I Built an AI Script Generator"

        summary = input("Brief summary (optional): ").strip()

        cmd = [sys.executable, str(TOOLS_DIR / "description_generator.py"), title]
        if summary:
            cmd.extend(["--summary", summary])

        subprocess.run(cmd)

    elif choice.lower() == "q":
        print("Bye!")
        return

    else:
        print("Invalid choice")
        return

    print("\n" + "=" * 60)
    input("Press Enter to continue...")
    main()


if __name__ == "__main__":
    main()
