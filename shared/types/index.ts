// Shared TypeScript types for CreatorOS
// Used by both Next.js and can be referenced by Tauri frontend

export interface YouTubeChannel {
  name: string;
  subscribers: number;
  total_views: number;
  video_count: number;
}

export interface Video {
  title: string;
  views: number;
  likes: number;
  comments: number;
  thumbnail: string;
  engagement_rate: number;
  published_at?: string;
}

export interface ViralContent {
  titles: string[];
  descriptions: string[];
  hashtags: string[];
  seo_tags: string[];
  best_upload_times: string[];
  thumbnail_ideas: string[];
}

export interface CalendarItem {
  day: number;
  date: string;
  title: string;
  type: 'long-form' | 'short' | 'reel';
  duration: string;
  priority: 'high' | 'medium' | 'low';
  optimization_tips?: string[];
}

export interface Idea {
  id: string;
  title: string;
  description?: string;
  score?: number;
  created_at: string;
}

export interface Script {
  id: string;
  title: string;
  content: string;
  style?: string;
  duration?: string;
  created_at: string;
}

export interface Description {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  created_at: string;
}

export interface Metric {
  name: string;
  now: number | string;
  day30: number | string;
  day90: number | string;
  icon?: string;
  color?: string;
}

export interface Stage {
  title: string;
  timeline: string;
  target: string;
  items: string[];
  color: string;
}

export interface AppState {
  youtube: {
    channel: YouTubeChannel | null;
    videos: Video[];
  };
  viral: ViralContent | null;
  calendar: CalendarItem[];
  ideas: Idea[];
  scripts: Script[];
  descriptions: Description[];
  settings: {
    claudeApiKey?: string;
    youtubeApiKey?: string;
    notionApiKey?: string;
    defaultLanguage: 'hinglish' | 'hindi' | 'english';
    defaultDuration: 'short' | 'medium' | 'long';
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
}
