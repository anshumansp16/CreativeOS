"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { PlayCircleIcon, EyeIcon, HeartIcon, ChatBubbleLeftIcon, FireIcon, CalendarIcon, ClockIcon, HashtagIcon, TagIcon, SparklesIcon } from "@heroicons/react/24/outline";

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
  const tabs = [{ id: "videos", name: "Top Videos", icon: PlayCircleIcon }, { id: "viral", name: "Viral Content", icon: FireIcon }, { id: "calendar", name: "Content Calendar", icon: CalendarIcon }];

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center"><PlayCircleIcon className="w-6 h-6 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-white">YouTube Studio</h1><p className="text-white/60">{channel?.name || "Your Channel"}</p></div>
        </div>
        {channel && (
          <div className="flex items-center gap-6">
            <div className="text-center"><p className="text-2xl font-bold text-white">{formatNumber(channel.subscribers)}</p><p className="text-xs text-white/50">Subscribers</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-white">{formatNumber(channel.total_views)}</p><p className="text-xs text-white/50">Total Views</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-white">{channel.video_count}</p><p className="text-xs text-white/50">Videos</p></div>
          </div>
        )}
      </div>

      <div className="flex gap-2 animate-fade-in stagger-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === t.id ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
            <t.icon className="w-5 h-5" />{t.name}
          </button>
        ))}
      </div>

      {activeTab === "videos" && (
        <div className="space-y-4 animate-fade-in">
          {videos.length > 0 ? videos.map((v, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4">
              <div className="relative w-40 h-24 rounded-xl overflow-hidden flex-shrink-0"><Image src={v.thumbnail} alt={v.title} fill sizes="160px" className="object-cover" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium mb-2 line-clamp-2">{v.title}</h3>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span className="flex items-center gap-1"><EyeIcon className="w-4 h-4" />{formatNumber(v.views)}</span>
                  <span className="flex items-center gap-1"><HeartIcon className="w-4 h-4" />{formatNumber(v.likes)}</span>
                  <span className="flex items-center gap-1"><ChatBubbleLeftIcon className="w-4 h-4" />{formatNumber(v.comments)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${v.engagement_rate > 5 ? "bg-green-500/20 text-green-400" : v.engagement_rate > 3 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>{v.engagement_rate.toFixed(1)}% engagement</span>
                </div>
              </div>
            </div>
          )) : <div className="glass-card p-8 text-center"><PlayCircleIcon className="w-12 h-12 text-white/30 mx-auto mb-4" /><p className="text-white/60">No video data available yet</p></div>}
        </div>
      )}

      {activeTab === "viral" && (
        <div className="space-y-6 animate-fade-in">
          {viralContent ? (
            <>
              <div className="glass-card p-6"><h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-yellow-400" />Viral Title Ideas</h3><div className="space-y-2">{viralContent.titles.map((t, i) => <div key={i} className="p-3 rounded-xl bg-white/5 text-white/80 hover:bg-white/10 cursor-pointer">{t}</div>)}</div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6"><h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><HashtagIcon className="w-5 h-5 text-blue-400" />Hashtags</h3><div className="flex flex-wrap gap-2">{viralContent.hashtags.map((h, i) => <span key={i} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">{h}</span>)}</div></div>
                <div className="glass-card p-6"><h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><TagIcon className="w-5 h-5 text-purple-400" />SEO Tags</h3><div className="flex flex-wrap gap-2">{viralContent.seo_tags.map((t, i) => <span key={i} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">{t}</span>)}</div></div>
              </div>
              <div className="glass-card p-6"><h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><ClockIcon className="w-5 h-5 text-green-400" />Best Upload Times (IST)</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{viralContent.best_upload_times.map((t, i) => <div key={i} className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center"><p className="text-green-400 font-medium">{t}</p></div>)}</div></div>
            </>
          ) : <div className="glass-card p-8 text-center"><FireIcon className="w-12 h-12 text-white/30 mx-auto mb-4" /><p className="text-white/60">No viral content data available</p></div>}
        </div>
      )}

      {activeTab === "calendar" && (
        <div className="space-y-4 animate-fade-in">
          {calendar.length > 0 ? calendar.map((item, i) => (
            <div key={i} className="glass-card p-4">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${item.priority === "high" ? "bg-red-500/20 text-red-400" : item.priority === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}><span className="text-xs">Day</span><span className="text-xl font-bold">{item.day}</span></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1"><h3 className="text-white font-medium">{item.title}</h3><span className={`px-2 py-0.5 rounded-full text-xs capitalize ${item.type === "long-form" ? "bg-blue-500/20 text-blue-400" : item.type === "short" ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"}`}>{item.type}</span></div>
                  <div className="flex items-center gap-4 text-sm text-white/50 mb-2"><span>{item.date}</span><span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" />{item.duration}</span></div>
                  {item.optimization_tips?.length > 0 && <div className="mt-2 p-2 rounded-lg bg-white/5"><p className="text-xs text-white/40 mb-1">Tips:</p><ul className="text-xs text-white/60 space-y-1">{item.optimization_tips.slice(0, 2).map((t, j) => <li key={j}>• {t}</li>)}</ul></div>}
                </div>
              </div>
            </div>
          )) : <div className="glass-card p-8 text-center"><CalendarIcon className="w-12 h-12 text-white/30 mx-auto mb-4" /><p className="text-white/60">No content calendar available</p></div>}
        </div>
      )}
    </div>
  );
}
