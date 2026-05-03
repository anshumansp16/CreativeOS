"use client";

import { useState, useCallback, useEffect } from "react";

export type LibraryItemType =
  | "idea"
  | "script"
  | "description"
  | "linkedin"
  | "twitter"
  | "hashtags";

export interface LibraryItem {
  id: string;
  type: LibraryItemType;
  title: string;
  content: string;
  metadata?: Record<string, string | number | string[]>;
  createdAt: number;
}

const STORAGE_KEY = "creatoros_library";

function load(): LibraryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persist(items: LibraryItem[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
}

export function useContentLibrary() {
  const [items, setItems] = useState<LibraryItem[]>([]);

  useEffect(() => { setItems(load()); }, []);

  const save = useCallback(
    (
      type: LibraryItemType,
      title: string,
      content: string,
      metadata?: LibraryItem["metadata"]
    ) => {
      const item: LibraryItem = {
        id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        title,
        content,
        metadata,
        createdAt: Date.now(),
      };
      setItems((prev) => {
        const updated = [item, ...prev];
        persist(updated);
        return updated;
      });
      return item.id;
    },
    []
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      persist(updated);
      return updated;
    });
  }, []);

  const clear = useCallback(() => {
    persist([]);
    setItems([]);
  }, []);

  const getByType = useCallback(
    (type: LibraryItemType) => items.filter((i) => i.type === type),
    [items]
  );

  const search = useCallback(
    (query: string) => {
      const q = query.toLowerCase();
      return items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.content.toLowerCase().includes(q) ||
          i.type.includes(q)
      );
    },
    [items]
  );

  return { items, save, remove, clear, getByType, search };
}

// Standalone save — use outside React (e.g., in API response handlers)
export function saveToLibrary(
  type: LibraryItemType,
  title: string,
  content: string,
  metadata?: LibraryItem["metadata"]
): LibraryItem {
  const item: LibraryItem = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    title,
    content,
    metadata,
    createdAt: Date.now(),
  };
  const existing = load();
  persist([item, ...existing]);
  return item;
}
