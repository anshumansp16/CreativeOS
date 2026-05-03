"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LightBulbIcon, DocumentTextIcon, ChatBubbleBottomCenterTextIcon, PlayCircleIcon, UserGroupIcon, EyeIcon, CalendarIcon, ArrowTrendingUpIcon, ClockIcon } from "@heroicons/react/24/outline";

interface YouTubeChannel { name: string; subscribers: number; total_views: number; video_count: number; }
interface Video { title: string; views: number; likes: number; comments: number; thumbnail: string; engagement_rate: number; }
interface CalendarItem { day: number; date: string; title: string; type: string; duration: string; priority: string; }

export default function Dashboard() {
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannel | null>(null);
  const [topVideos, setTopVideos] = useState<Video[]>([]);
  const [upcomingContent, setUpcomingContent] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ytRes, calRes] = await Promise.all([fetch("/api/youtube"), fetch("/api/calendar")]);
        if (ytRes.ok) { const d = await ytRes.json(); setYoutubeChannel(d.channel); setTopVideos(d.videos?.slice(0, 3) || []); }
        if (calRes.ok) { const d = await calRes.json(); setUpcomingContent(d.calendar?.slice(0, 4) || []); }
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  const formatNumber = (n: number) => n >= 1000000 ? (n/1000000).toFixed(1)+"M" : n >= 1000 ? (n/1000).toFixed(1)+"K" : n.toString();

  const quickActions = [
    { name: "Generate Ideas", href: "/ideas", icon: LightBulbIcon, color: "from-yellow-500 to-orange-500" },
    { name: "Write Script", href: "/scripts", icon: DocumentTextIcon, color: "from-blue-500 to-cyan-500" },
    { name: "Create Description", href: "/descriptions", icon: ChatBubbleBottomCenterTextIcon, color: "from-purple-500 to-pink-500" },
    { name: "View Goals", href: "/goals", icon: ArrowTrendingUpIcon, color: "from-green-500 to-emerald-500" },
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back, Anshuman!</h1>
        <p className="text-white/60">Here&apos;s your content creation overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in stagger-1">
        {quickActions.map((a) => (
          <Link key={a.name} href={a.href} className="glass-card p-4 flex flex-col items-center gap-3 hover:scale-105 transition-transform">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center`}><a.icon className="w-6 h-6 text-white" /></div>
            <span className="text-sm font-medium text-white">{a.name}</span>
          </Link>
        ))}
      </div>

      {youtubeChannel && (
        <div className="glass-card p-6 bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20 animate-fade-in stagger-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3"><PlayCircleIcon className="w-6 h-6 text-red-500" /><h2 className="text-lg font-semibold text-white">{youtubeChannel.name}</h2></div>
            <Link href="/youtube" className="text-sm text-red-400 hover:text-red-300">View Studio →</Link>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center"><div className="flex items-center justify-center gap-2 mb-1"><UserGroupIcon className="w-5 h-5 text-red-400" /><span className="text-2xl font-bold text-white">{formatNumber(youtubeChannel.subscribers)}</span></div><p className="text-xs text-white/50">Subscribers</p></div>
            <div className="text-center"><div className="flex items-center justify-center gap-2 mb-1"><EyeIcon className="w-5 h-5 text-blue-400" /><span className="text-2xl font-bold text-white">{formatNumber(youtubeChannel.total_views)}</span></div><p className="text-xs text-white/50">Total Views</p></div>
            <div className="text-center"><div className="flex items-center justify-center gap-2 mb-1"><PlayCircleIcon className="w-5 h-5 text-purple-400" /><span className="text-2xl font-bold text-white">{youtubeChannel.video_count}</span></div><p className="text-xs text-white/50">Videos</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div><div className="flex justify-between text-xs mb-1"><span className="text-white/50">Subs to YPP</span><span className="text-white/70">{youtubeChannel.subscribers}/500</span></div><div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-red-500 rounded-full" style={{width:`${Math.min(100,(youtubeChannel.subscribers/500)*100)}%`}}/></div></div>
            <div><div className="flex justify-between text-xs mb-1"><span className="text-white/50">Watch Hours</span><span className="text-white/70">430/3000</span></div><div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{width:`${(430/3000)*100}%`}}/></div></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topVideos.length > 0 && (
          <div className="glass-card p-6 animate-fade-in stagger-3">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />Top Performing Videos</h2>
            <div className="space-y-3">
              {topVideos.map((v, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="relative w-20 h-12 rounded-lg overflow-hidden flex-shrink-0"><Image src={v.thumbnail} alt={v.title} fill sizes="80px" className="object-cover" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{v.title}</p><div className="flex items-center gap-3 text-xs text-white/50"><span>{formatNumber(v.views)} views</span><span>{v.engagement_rate.toFixed(1)}% engagement</span></div></div>
                </div>
              ))}
            </div>
          </div>
        )}
        {upcomingContent.length > 0 && (
          <div className="glass-card p-6 animate-fade-in stagger-4">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-purple-400" />Upcoming Content</h2>
            <div className="space-y-3">
              {upcomingContent.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${item.priority==="high"?"bg-red-500/20 text-red-400":item.priority==="medium"?"bg-yellow-500/20 text-yellow-400":"bg-green-500/20 text-green-400"}`}>D{item.day}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{item.title}</p><div className="flex items-center gap-3 text-xs text-white/50"><span className="capitalize">{item.type}</span><span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" />{item.duration}</span></div></div>
                </div>
              ))}
            </div>
            <Link href="/youtube" className="block mt-4 text-center text-sm text-indigo-400 hover:text-indigo-300">View Full Calendar →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
