"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowTrendingUpIcon, CalendarDaysIcon, PlayIcon, EyeIcon, HeartIcon } from "@heroicons/react/24/outline";

interface YouTubeChannel { name: string; subscribers: number; total_views: number; video_count: number; }
interface Video { title: string; views: number; likes: number; comments: number; thumbnail: string; engagement_rate: number; }
interface CalendarItem { day: number; date: string; title: string; type: string; duration: string; priority: string; }

export default function Dashboard() {
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannel | null>(null);
  const [topVideos, setTopVideos] = useState<Video[]>([]);
  const [upcomingContent, setUpcomingContent] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ytRes, calRes] = await Promise.all([
          fetch("/api/youtube"),
          fetch("/api/calendar")
        ]);
        
        if (ytRes.ok) {
          const ytData = await ytRes.json();
          console.log("YouTube data:", ytData);
          setYoutubeChannel(ytData.channel);
          if (ytData.videos && Array.isArray(ytData.videos)) {
            setTopVideos(ytData.videos.slice(0, 3));
          }
        }
        
        if (calRes.ok) {
          const calData = await calRes.json();
          console.log("Calendar data:", calData);
          if (calData.calendar && Array.isArray(calData.calendar)) {
            setUpcomingContent(calData.calendar.slice(0, 3));
          }
        }
      } catch (e) {
        console.error("Error loading data:", e);
        setError(String(e));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const formatNumber = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  const quickActions = [
    { name: "Generate Ideas", href: "/ideas", emoji: "💡", gradient: "from-amber-400 to-orange-500" },
    { name: "Write Script", href: "/scripts", emoji: "📝", gradient: "from-blue-400 to-cyan-500" },
    { name: "Description", href: "/descriptions", emoji: "💬", gradient: "from-purple-400 to-pink-500" },
    { name: "View Goals", href: "/goals", emoji: "🚀", gradient: "from-emerald-400 to-teal-500" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/30 rounded-full animate-spin border-t-indigo-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">✨</span>
          </div>
        </div>
      </div>
    );
  }

  const subs = youtubeChannel?.subscribers || 359;
  const views = youtubeChannel?.total_views || 9600;
  const watchHours = 430;

  return (
    <div style={{ width: "100%" }} className="animate-fadeIn">
      {/* Page Header */}
      <header style={{ marginBottom: "20px" }}>
        <h1 className="text-3xl font-bold text-white mb-1">
          Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Anshuman</span>! 👋
        </h1>
        <p className="text-slate-400 text-sm">Here&apos;s your content creation overview for today</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: "20px" }}>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">👥</span>
            <span className="badge badge-red">YPP Goal</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{formatNumber(subs)}</div>
          <div className="text-sm text-slate-400 mb-3">Subscribers</div>
          <div className="progress-bar">
            <div className="progress-bar-fill red" style={{ width: `${Math.min((subs / 500) * 100, 100)}%` }} />
          </div>
          <div className="text-xs text-slate-500 mt-2">Target: 500 for YPP</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">👁️</span>
            <span className="badge badge-purple">Growing</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{formatNumber(views)}</div>
          <div className="text-sm text-slate-400 mb-3">Total Views</div>
          <div className="progress-bar">
            <div className="progress-bar-fill purple" style={{ width: "65%" }} />
          </div>
          <div className="text-xs text-slate-500 mt-2">+12% this month</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">⏱️</span>
            <span className="badge badge-orange">In Progress</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{watchHours}</div>
          <div className="text-sm text-slate-400 mb-3">Watch Hours</div>
          <div className="progress-bar">
            <div className="progress-bar-fill orange" style={{ width: `${Math.min((watchHours / 3000) * 100, 100)}%` }} />
          </div>
          <div className="text-xs text-slate-500 mt-2">Target: 3,000 for YPP</div>
        </div>

        <div className="stat-card accent">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">🎯</span>
            <span className="badge badge-primary">Next Goal</span>
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1">YPP</div>
          <div className="text-sm text-slate-400 mb-1">Next Milestone</div>
          <div className="text-sm text-indigo-300 font-medium mt-3">
            {500 - subs} subs + {3000 - watchHours} hours to go
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: "20px" }}>
        <h2 className="text-base font-semibold text-white flex items-center gap-2" style={{ marginBottom: "12px" }}>
          <span>⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.name} href={action.href} className="action-card">
              <div className={`icon-wrapper bg-gradient-to-br ${action.gradient}`}>
                <span className="text-2xl">{action.emoji}</span>
              </div>
              <span className="font-medium text-white text-sm">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Dashboard Sections */}
      <div className="grid grid-cols-2 gap-5">
        {/* Top Performing Videos */}
        <div className="section-card">
          <h3>
            <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
            Top Performing Videos
          </h3>
          <div className="flex flex-col gap-3">
            {topVideos.length > 0 ? topVideos.map((video, i) => (
              <div key={i} className="video-list-item">
                <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                  {video.thumbnail ? (
                    <Image src={video.thumbnail} alt={video.title} fill sizes="96px" className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <PlayIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate mb-1">{video.title}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><EyeIcon className="w-3.5 h-3.5" />{formatNumber(video.views)}</span>
                    <span className="flex items-center gap-1"><HeartIcon className="w-3.5 h-3.5" />{formatNumber(video.likes)}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-6">
                <p className="text-sm text-slate-500">No videos found</p>
                <Link href="/youtube" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 inline-block">Refresh analytics →</Link>
              </div>
            )}
          </div>
          {topVideos.length > 0 && (
            <Link href="/youtube" className="block mt-4 text-center text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">View all videos →</Link>
          )}
        </div>

        {/* Upcoming Content */}
        <div className="section-card">
          <h3>
            <CalendarDaysIcon className="w-5 h-5 text-purple-400" />
            Upcoming Content
          </h3>
          <div className="flex flex-col gap-3">
            {upcomingContent.length > 0 ? upcomingContent.map((item, i) => {
              const date = new Date(item.date);
              return (
                <div key={i} className="content-list-item">
                  <div className="content-day-badge">
                    <span className="text-lg font-bold leading-none">{date.getDate()}</span>
                    <span className="text-[10px] uppercase">{date.toLocaleDateString('en', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate mb-1">{item.title}</p>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${item.type?.toLowerCase().includes('short') ? 'badge-purple' : 'badge-primary'}`}>{item.type}</span>
                      <span className="text-xs text-slate-400">{item.duration}</span>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-6">
                <p className="text-sm text-slate-500">No upcoming content</p>
                <Link href="/youtube" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 inline-block">Generate calendar →</Link>
              </div>
            )}
          </div>
          {upcomingContent.length > 0 && (
            <Link href="/youtube" className="block mt-4 text-center text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">View full calendar →</Link>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          Error: {error}
        </div>
      )}
    </div>
  );
}
