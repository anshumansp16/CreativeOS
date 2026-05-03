#!/usr/bin/env python3
"""
YouTube Analytics - CreatorOS
Fetches channel stats and best performing videos.
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

API_KEY = os.getenv("YOUTUBE_API_KEY")
BASE_URL = "https://www.googleapis.com/youtube/v3"


def api_request(endpoint: str, params: dict) -> dict:
    """Make YouTube API request."""
    params["key"] = API_KEY
    url = f"{BASE_URL}/{endpoint}?{urllib.parse.urlencode(params)}"

    try:
        with urllib.request.urlopen(url) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        return {"error": str(e)}


def get_channel_by_handle(handle: str) -> dict:
    """Get channel info by handle."""
    # Remove @ if present
    handle = handle.lstrip("@")

    result = api_request("channels", {
        "part": "snippet,statistics,contentDetails",
        "forHandle": handle
    })
    return result


def get_channel_by_id(channel_id: str) -> dict:
    """Get channel info by ID."""
    result = api_request("channels", {
        "part": "snippet,statistics,contentDetails",
        "id": channel_id
    })
    return result


def search_channel(query: str) -> dict:
    """Search for a channel."""
    result = api_request("search", {
        "part": "snippet",
        "type": "channel",
        "q": query,
        "maxResults": 5
    })
    return result


def get_channel_videos(channel_id: str, max_results: int = 20) -> dict:
    """Get videos from a channel sorted by view count."""
    # First get uploads playlist
    channel = api_request("channels", {
        "part": "contentDetails",
        "id": channel_id
    })

    if "error" in channel or not channel.get("items"):
        return channel

    uploads_playlist = channel["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]

    # Get videos from uploads playlist
    videos = api_request("playlistItems", {
        "part": "snippet,contentDetails",
        "playlistId": uploads_playlist,
        "maxResults": max_results
    })

    if "error" in videos or not videos.get("items"):
        return videos

    # Get video statistics
    video_ids = [item["contentDetails"]["videoId"] for item in videos["items"]]

    stats = api_request("videos", {
        "part": "statistics,snippet",
        "id": ",".join(video_ids)
    })

    return stats


def analyze_best_videos(videos_data: dict) -> list:
    """Analyze and rank videos by performance."""
    if "error" in videos_data or not videos_data.get("items"):
        return []

    videos = []
    for item in videos_data["items"]:
        stats = item.get("statistics", {})
        snippet = item.get("snippet", {})

        views = int(stats.get("viewCount", 0))
        likes = int(stats.get("likeCount", 0))
        comments = int(stats.get("commentCount", 0))

        # Calculate engagement rate
        engagement = ((likes + comments) / max(views, 1)) * 100

        videos.append({
            "title": snippet.get("title", ""),
            "video_id": item["id"],
            "url": f"https://youtube.com/watch?v={item['id']}",
            "views": views,
            "likes": likes,
            "comments": comments,
            "engagement_rate": round(engagement, 2),
            "published": snippet.get("publishedAt", "")[:10],
            "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url", "")
        })

    # Sort by views
    videos.sort(key=lambda x: x["views"], reverse=True)
    return videos


def main():
    if not API_KEY:
        print("ERROR: YOUTUBE_API_KEY not found in .env")
        sys.exit(1)

    print("""
╔═══════════════════════════════════════════════════════════════╗
║           CreatorOS YouTube Analytics                         ║
╚═══════════════════════════════════════════════════════════════╝
""")

    # Get channel identifier from args or prompt
    if len(sys.argv) > 1:
        identifier = sys.argv[1]
    else:
        identifier = input("Enter your YouTube channel handle (e.g., @YourChannel) or ID: ").strip()

    print(f"\n🔍 Searching for channel: {identifier}")

    # Try to get channel
    if identifier.startswith("@"):
        channel_data = get_channel_by_handle(identifier)
    elif identifier.startswith("UC"):
        channel_data = get_channel_by_id(identifier)
    else:
        # Try search
        search_result = search_channel(identifier)
        if search_result.get("items"):
            channel_id = search_result["items"][0]["id"]["channelId"]
            channel_data = get_channel_by_id(channel_id)
        else:
            channel_data = {"error": "Channel not found"}

    if "error" in channel_data or not channel_data.get("items"):
        print(f"❌ Error: {channel_data.get('error', 'Channel not found')}")
        print("\nTry using your channel ID (starts with UC) or exact handle (@YourName)")
        sys.exit(1)

    channel = channel_data["items"][0]
    stats = channel["statistics"]
    snippet = channel["snippet"]
    channel_id = channel["id"]

    print("\n" + "=" * 60)
    print("📊 CHANNEL OVERVIEW")
    print("=" * 60)
    print(f"\n📺 Channel: {snippet['title']}")
    print(f"🆔 ID: {channel_id}")
    print(f"👥 Subscribers: {int(stats.get('subscriberCount', 0)):,}")
    print(f"👀 Total Views: {int(stats.get('viewCount', 0)):,}")
    print(f"📹 Videos: {stats.get('videoCount', 0)}")

    # Get videos
    print("\n🔄 Fetching videos...")
    videos_data = get_channel_videos(channel_id, 20)
    videos = analyze_best_videos(videos_data)

    if videos:
        print("\n" + "=" * 60)
        print("🏆 TOP PERFORMING VIDEOS (by views)")
        print("=" * 60)

        for i, v in enumerate(videos[:10], 1):
            print(f"\n{i}. {v['title'][:60]}...")
            print(f"   👀 {v['views']:,} views | 👍 {v['likes']:,} likes | 💬 {v['comments']:,} comments")
            print(f"   📈 Engagement: {v['engagement_rate']}% | 📅 {v['published']}")
            print(f"   🔗 {v['url']}")

        # Insights
        print("\n" + "=" * 60)
        print("💡 INSIGHTS")
        print("=" * 60)

        avg_views = sum(v["views"] for v in videos) / len(videos)
        avg_engagement = sum(v["engagement_rate"] for v in videos) / len(videos)

        print(f"\n📊 Average views per video: {int(avg_views):,}")
        print(f"📈 Average engagement rate: {avg_engagement:.2f}%")

        # Best performing patterns
        top_5 = videos[:5]
        print("\n🎯 Top 5 video title patterns:")
        for v in top_5:
            print(f"   • {v['title'][:50]}... ({v['views']:,} views)")

        # Save data
        output = {
            "channel": {
                "name": snippet["title"],
                "id": channel_id,
                "subscribers": int(stats.get("subscriberCount", 0)),
                "total_views": int(stats.get("viewCount", 0)),
                "video_count": int(stats.get("videoCount", 0))
            },
            "videos": videos,
            "insights": {
                "avg_views": int(avg_views),
                "avg_engagement": round(avg_engagement, 2)
            },
            "fetched_at": datetime.now().isoformat()
        }

        output_file = Path(__file__).parent / "output" / "youtube_analytics.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        print(f"\n✅ Saved to: {output_file}")
    else:
        print("❌ Could not fetch videos")


if __name__ == "__main__":
    main()
