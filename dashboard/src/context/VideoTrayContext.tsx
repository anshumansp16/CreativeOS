"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export interface VideoTrayItem {
  id: string;
  title: string;
  addedAt: number;
  searchDemand?: string;
  competition?: string;
  successProbability?: number;
  estimatedViews?: string;
  seoKeywords?: string[];
}

interface VideoTrayContextType {
  tray: VideoTrayItem[];
  addToTray: (item: Omit<VideoTrayItem, "id" | "addedAt">) => void;
  removeFromTray: (id: string) => void;
  removeFromTrayByTitle: (title: string) => void;
  isInTray: (title: string) => boolean;
  clearTray: () => void;
}

const VideoTrayContext = createContext<VideoTrayContextType | null>(null);

const STORAGE_KEY = "creatoros_video_tray";

export function VideoTrayProvider({ children }: { children: ReactNode }) {
  const [tray, setTray] = useState<VideoTrayItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setTray(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const persist = useCallback((items: VideoTrayItem[]) => {
    setTray(items);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, []);

  const addToTray = useCallback((item: Omit<VideoTrayItem, "id" | "addedAt">) => {
    setTray((prev) => {
      if (prev.find((i) => i.title === item.title)) return prev;
      const newItem: VideoTrayItem = { ...item, id: crypto.randomUUID(), addedAt: Date.now() };
      const updated = [...prev, newItem];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const removeFromTray = useCallback((id: string) => {
    setTray((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const removeFromTrayByTitle = useCallback((title: string) => {
    setTray((prev) => {
      const updated = prev.filter((i) => i.title !== title);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const isInTray = useCallback((title: string) => tray.some((i) => i.title === title), [tray]);

  const clearTray = useCallback(() => persist([]), [persist]);

  return (
    <VideoTrayContext.Provider value={{ tray, addToTray, removeFromTray, removeFromTrayByTitle, isInTray, clearTray }}>
      {children}
    </VideoTrayContext.Provider>
  );
}

export function useVideoTray() {
  const ctx = useContext(VideoTrayContext);
  if (!ctx) throw new Error("useVideoTray must be used inside VideoTrayProvider");
  return ctx;
}
