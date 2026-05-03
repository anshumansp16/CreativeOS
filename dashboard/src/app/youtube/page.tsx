"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { EyeIcon, HeartIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

interface Video { title: string; views: number; likes: number; comments: number; thumbnail: string; engagement_rate: number; }
interface ViralContent { titles: string[]; descriptions: string[]; hashtags: string[]; seo_tags: string[]; best_upload_times: string[]; thumbnail_ideas: string[]; }
interface CalendarItem { day: number; date: string; title: string; type: string; duration: string; priority: string; optimization_tips: string[]; }
interface YouTubeChannel { name: string; subscribers: number; total_views: number; video_count: number; }

export default function YouTubePage() {
  const [activeTab, setActiveTab] = useState<"videos" | "viral" | "calendar">("videos");
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [viralContent, setViralContent] = useState<ViralContent | null>(null);
  const [calendar, setCalendar] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viralTopic, setViralTopic] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ytRes, viralRes, calRes] = await Promise.all([fetch("/api/youtube"), fetch("/api/viral"), fetch("/api/calendar")]);
        if (ytRes.ok) { const d = await ytRes.json(); setChannel(d.channel); setVideos(d.videos || []); }
        if (viralRes.ok) { const d = await viralRes.json(); setViralContent(d.viral_content); }
        if (calRes.ok) { const d = await calRes.json(); setCalendar(d.calendar || []); }
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  const formatNumber = (n: number) => n >= 1000000 ? (n/1000000).toFixed(1)+"M" : n >= 1000 ? (n/1000).toFixed(1)+"K" : n.toString();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-red-500/30 rounded-full animate-spin border-t-red-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">📺</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }} className="animate-fadeIn">
      {/* Page Header */}
      <header style={{ marginBottom: "14px" }}>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-3">
          <span>📺</span> YouTube Studio
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">{channel?.name || "Anshuman Parmar"}</p>
      </header>

      {/* YouTube Stats */}
      <div className="youtube-stats">
        <div>
          <span className="block text-3xl font-bold text-[var(--text-primary)]">{formatNumber(channel?.subscribers || 359)}</span>
          <span className="text-xs text-[var(--system-red)]">Subscribers</span>
        </div>
        <div>
          <span className="block text-3xl font-bold text-[var(--text-primary)]">{formatNumber(channel?.total_views || 9600)}</span>
          <span className="text-xs text-[var(--system-red)]">Total Views</span>
        </div>
        <div>
          <span className="block text-3xl font-bold text-[var(--text-primary)]">{channel?.video_count || 12}</span>
          <span className="text-xs text-[var(--system-red)]">Videos</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        <button className={`tab-btn ${activeTab === "videos" ? "active" : ""}`} onClick={() => setActiveTab("videos")}>🎬 Top Videos</button>
        <button className={`tab-btn ${activeTab === "viral" ? "active" : ""}`} onClick={() => setActiveTab("viral")}>🔥 Viral Content</button>
        <button className={`tab-btn ${activeTab === "calendar" ? "active" : ""}`} onClick={() => setActiveTab("calendar")}>📅 Content Calendar</button>
      </div>

      {/* Videos Tab */}
      {activeTab === "videos" && (
        <div>
          <div className="tool-section">
            <button className="btn-primary">🔄 Refresh Analytics</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {videos.length > 0 ? videos.map((video, i) => (
              <div key={i} className="video-card">
                <div className="relative rounded-xl overflow-hidden flex-shrink-0 bg-slate-800" style={{ width: "128px", height: "72px" }}>
                  {video.thumbnail ? (
                    <Image src={video.thumbnail} alt={video.title} fill sizes="128px" className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 mb-2">{video.title}</p>
                  <div className="flex gap-4 text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1"><EyeIcon className="w-3.5 h-3.5" />{formatNumber(video.views)}</span>
                    <span className="flex items-center gap-1"><HeartIcon className="w-3.5 h-3.5" />{formatNumber(video.likes)}</span>
                    <span className="flex items-center gap-1"><ChatBubbleLeftIcon className="w-3.5 h-3.5" />{formatNumber(video.comments)}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center py-12 text-[var(--text-secondary)]">
                Click &quot;Refresh Analytics&quot; to load your videos
              </div>
            )}
          </div>
        </div>
      )}

      {/* Viral Content Tab */}
      {activeTab === "viral" && (
        <div>
          <div className="tool-section">
            <input type="text" placeholder="Enter video topic for viral content..." value={viralTopic}
              onChange={(e) => setViralTopic(e.target.value)} className="input-field flex-1" />
            <button className="btn-primary">🔥 Generate Viral Package</button>
          </div>
          <div className="output-section">
            {viralContent ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2" style={{ marginBottom: "12px" }}>
                    <span>✨</span> Viral Title Ideas
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {viralContent.titles.map((title, i) => (
                      <div key={i} className="p-3 bg-[var(--bg-input)] rounded-xl text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors border border-[var(--border)]">
                        {title}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2" style={{ marginBottom: "10px" }}>
                      <span>#️⃣</span> Hashtags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {viralContent.hashtags.map((tag, i) => <span key={i} className="badge badge-primary">{tag}</span>)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2" style={{ marginBottom: "10px" }}>
                      <span>🏷️</span> SEO Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {viralContent.seo_tags.map((tag, i) => <span key={i} className="badge badge-purple">{tag}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[var(--text-secondary)]">
                <span className="text-4xl mb-3 block">🔥</span>
                Enter a topic to generate viral titles, hashtags, and SEO tags
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === "calendar" && (
        <div>
          <div className="tool-section">
            <button className="btn-primary">📅 Generate 30-Day Calendar</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {calendar.length > 0 ? calendar.slice(0, 10).map((item, i) => {
              const date = new Date(item.date);
              const priorityClass = item.priority?.toLowerCase() === "high" ? "high" : item.priority?.toLowerCase() === "medium" ? "medium" : "low";
              return (
                <div key={i} className="calendar-item">
                  <div className={`calendar-day ${priorityClass}`}>
                    <span className="text-lg font-bold">{date.getDate()}</span>
                    <span className="text-[10px] uppercase">{date.toLocaleDateString('en', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)] mb-1">{item.title}</p>
                    <div className="flex gap-3 items-center">
                      <span className={`badge ${item.type?.toLowerCase().includes('short') ? 'badge-purple' : 'badge-primary'}`}>{item.type}</span>
                      <span className="text-xs text-[var(--text-secondary)]">{item.duration}</span>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-12 text-[var(--text-secondary)]">
                <span className="text-4xl mb-3 block">📅</span>
                Click to generate your content calendar
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
