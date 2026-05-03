#!/usr/bin/env python3
"""
Notion Calendar Integration - CreatorOS
Creates content calendar entries in Notion.
"""

import os
import json
import sys
from pathlib import Path
from datetime import datetime
import urllib.request
import urllib.parse

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_VERSION = "2022-06-28"
NOTION_BASE_URL = "https://api.notion.com/v1"


def notion_request(endpoint: str, method: str = "GET", data: dict = None) -> dict:
    """Make Notion API request."""
    url = f"{NOTION_BASE_URL}/{endpoint}"

    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
    }

    req = urllib.request.Request(url, headers=headers, method=method)

    if data:
        req.data = json.dumps(data).encode("utf-8")

    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        return {"error": f"{e.code}: {error_body}"}
    except Exception as e:
        return {"error": str(e)}


def search_databases() -> dict:
    """Search for databases in Notion."""
    return notion_request("search", "POST", {
        "filter": {"property": "object", "value": "database"}
    })


def create_database(parent_page_id: str, title: str = "Content Calendar") -> dict:
    """Create a content calendar database."""
    return notion_request("databases", "POST", {
        "parent": {"type": "page_id", "page_id": parent_page_id},
        "title": [{"type": "text", "text": {"content": title}}],
        "properties": {
            "Title": {"title": {}},
            "Date": {"date": {}},
            "Type": {
                "select": {
                    "options": [
                        {"name": "demo", "color": "blue"},
                        {"name": "tutorial", "color": "green"},
                        {"name": "comparison", "color": "orange"},
                        {"name": "listicle", "color": "purple"}
                    ]
                }
            },
            "Priority": {
                "select": {
                    "options": [
                        {"name": "P1", "color": "red"},
                        {"name": "P2", "color": "yellow"},
                        {"name": "P3", "color": "green"}
                    ]
                }
            },
            "Status": {
                "select": {
                    "options": [
                        {"name": "Idea", "color": "gray"},
                        {"name": "Scripting", "color": "blue"},
                        {"name": "Recording", "color": "orange"},
                        {"name": "Editing", "color": "purple"},
                        {"name": "Published", "color": "green"}
                    ]
                }
            },
            "Duration": {"rich_text": {}},
            "Notes": {"rich_text": {}}
        }
    })


def add_calendar_entry(database_id: str, entry: dict) -> dict:
    """Add a calendar entry to the database."""
    properties = {
        "Title": {
            "title": [{"text": {"content": entry.get("title", "Untitled")}}]
        },
        "Date": {
            "date": {"start": entry.get("date", datetime.now().strftime("%Y-%m-%d"))}
        },
        "Type": {
            "select": {"name": entry.get("type", "demo")}
        },
        "Priority": {
            "select": {"name": entry.get("priority", "P2")}
        },
        "Status": {
            "select": {"name": "Idea"}
        },
        "Duration": {
            "rich_text": [{"text": {"content": entry.get("duration", "10 min")}}]
        },
        "Notes": {
            "rich_text": [{"text": {"content": entry.get("notes", "")}}]
        }
    }

    return notion_request("pages", "POST", {
        "parent": {"database_id": database_id},
        "properties": properties
    })


def get_user_info() -> dict:
    """Get current user info."""
    return notion_request("users/me")


def search_pages() -> dict:
    """Search for pages in Notion."""
    return notion_request("search", "POST", {
        "filter": {"property": "object", "value": "page"}
    })


def main():
    if not NOTION_API_KEY:
        print("ERROR: NOTION_API_KEY not found in .env")
        sys.exit(1)

    print("""
╔═══════════════════════════════════════════════════════════════╗
║           CreatorOS Notion Calendar                           ║
╚═══════════════════════════════════════════════════════════════╝
""")

    # Load calendar data
    calendar_file = Path(__file__).parent / "output" / "content_calendar.json"
    if not calendar_file.exists():
        print("❌ Content calendar not found. Run content_calendar.py first.")
        sys.exit(1)

    with open(calendar_file) as f:
        calendar_data = json.load(f)

    calendar = calendar_data.get("calendar", [])

    if not calendar:
        print("❌ No calendar entries found")
        sys.exit(1)

    # Check Notion connection
    print("🔍 Connecting to Notion...")
    user = get_user_info()

    if "error" in user:
        print(f"❌ Notion connection failed: {user['error']}")
        print("\n💡 Make sure your Notion integration has access to your workspace.")
        print("   Go to notion.so/my-integrations and check the integration settings.")
        sys.exit(1)

    print(f"✅ Connected as: {user.get('name', 'Unknown')}")

    # Search for existing databases
    print("\n🔍 Searching for existing databases...")
    databases = search_databases()

    if "error" in databases:
        print(f"❌ Error: {databases['error']}")
    else:
        db_results = databases.get("results", [])
        if db_results:
            print(f"\n📚 Found {len(db_results)} database(s):")
            for i, db in enumerate(db_results, 1):
                title = db.get("title", [{}])[0].get("plain_text", "Untitled")
                db_id = db.get("id", "")
                print(f"   {i}. {title} (ID: {db_id[:8]}...)")

            print("\n" + "-" * 60)
            print("To add calendar to existing database, use:")
            print("   python notion_calendar.py --database <database_id>")
            print("\nTo create a new database, use:")
            print("   python notion_calendar.py --create --page <page_id>")
        else:
            print("   No databases found.")

    # Check for command line args
    database_id = None
    create_new = False
    page_id = None

    for i, arg in enumerate(sys.argv):
        if arg == "--database" and i + 1 < len(sys.argv):
            database_id = sys.argv[i + 1]
        if arg == "--create":
            create_new = True
        if arg == "--page" and i + 1 < len(sys.argv):
            page_id = sys.argv[i + 1]

    if database_id:
        print(f"\n📥 Adding {len(calendar)} entries to database...")

        success = 0
        for entry in calendar:
            result = add_calendar_entry(database_id, entry)
            if "error" in result:
                print(f"   ❌ Failed: {entry.get('title', 'Unknown')[:30]}... - {result['error'][:50]}")
            else:
                print(f"   ✅ Added: {entry.get('title', 'Unknown')[:40]}...")
                success += 1

        print(f"\n✅ Added {success}/{len(calendar)} entries to Notion!")

    elif create_new and page_id:
        print(f"\n📝 Creating new database in page {page_id}...")
        result = create_database(page_id, "CreatorOS Content Calendar")

        if "error" in result:
            print(f"❌ Failed to create database: {result['error']}")
        else:
            new_db_id = result.get("id", "")
            print(f"✅ Created database: {new_db_id}")

            # Add entries
            print(f"\n📥 Adding {len(calendar)} entries...")
            for entry in calendar:
                add_result = add_calendar_entry(new_db_id, entry)
                if "error" not in add_result:
                    print(f"   ✅ {entry.get('title', 'Unknown')[:40]}...")

            print(f"\n🎉 Calendar created! Open Notion to see it.")

    else:
        print("\n" + "=" * 60)
        print("📅 CALENDAR PREVIEW (ready to sync)")
        print("=" * 60)

        for entry in calendar:
            priority_emoji = {"P1": "🔴", "P2": "🟡", "P3": "🟢"}.get(entry.get("priority", "P2"), "⚪")
            print(f"\n{priority_emoji} {entry.get('date')} | {entry.get('title')[:45]}...")

        print("\n" + "=" * 60)
        print("💡 To sync to Notion:")
        print("   1. Share a Notion page with your integration")
        print("   2. Get the database/page ID from the URL")
        print("   3. Run: python notion_calendar.py --database <id>")


if __name__ == "__main__":
    main()
