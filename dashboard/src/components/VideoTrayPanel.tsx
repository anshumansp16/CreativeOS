"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVideoTray, VideoTrayItem } from "@/context/VideoTrayContext";

type GenerateType = "script" | "description" | "linkedin" | "twitter" | "hashtags";

const GENERATE_OPTIONS: { type: GenerateType; label: string; emoji: string; href: string }[] = [
  { type: "script", label: "Write Script", emoji: "📝", href: "/scripts" },
  { type: "description", label: "Description", emoji: "📋", href: "/descriptions" },
  { type: "linkedin", label: "LinkedIn Post", emoji: "💼", href: "/generate?type=linkedin" },
  { type: "twitter", label: "Twitter Thread", emoji: "🐦", href: "/generate?type=twitter" },
  { type: "hashtags", label: "Hashtags", emoji: "#️⃣", href: "/generate?type=hashtags" },
];

interface VideoTrayPanelProps {
  compact?: boolean;
}

export default function VideoTrayPanel({ compact = false }: VideoTrayPanelProps) {
  const { tray, removeFromTray } = useVideoTray();
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] = useState<VideoTrayItem | null>(null);
  const [isOpen, setIsOpen] = useState(!compact);

  const handleGenerate = (item: VideoTrayItem, type: GenerateType) => {
    const topic = encodeURIComponent(item.title);
    const routes: Record<GenerateType, string> = {
      script: `/scripts?topic=${topic}`,
      description: `/descriptions?topic=${topic}`,
      linkedin: `/generate?type=linkedin&topic=${topic}`,
      twitter: `/generate?type=twitter&topic=${topic}`,
      hashtags: `/generate?type=hashtags&topic=${topic}`,
    };
    router.push(routes[type]);
  };

  if (tray.length === 0) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px",
        padding: "20px",
        textAlign: "center",
      }}>
        <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>🎬</span>
        <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
          Add ideas to your Video Tray from the Idea Generator
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(139,92,246,0.25)",
      borderRadius: "14px",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          background: "rgba(139,92,246,0.1)",
          borderBottom: "1px solid rgba(139,92,246,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: compact ? "pointer" : "default",
        }}
        onClick={() => compact && setIsOpen(!isOpen)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🎬</span>
          <span style={{ color: "#c4b5fd", fontWeight: 600, fontSize: "14px" }}>
            Video Tray
          </span>
          <span style={{
            background: "rgba(139,92,246,0.3)",
            color: "#c4b5fd",
            borderRadius: "20px",
            padding: "1px 8px",
            fontSize: "11px",
            fontWeight: 700,
          }}>
            {tray.length}
          </span>
        </div>
        {compact && <span style={{ color: "#6b7280", fontSize: "12px" }}>{isOpen ? "▲" : "▼"}</span>}
      </div>

      {isOpen && (
        <div style={{ padding: "12px" }}>
          {tray.map((item) => (
            <div
              key={item.id}
              style={{
                background: selectedVideo?.id === item.id ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${selectedVideo?.id === item.id ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "8px",
                cursor: "pointer",
              }}
              onClick={() => setSelectedVideo(selectedVideo?.id === item.id ? null : item)}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: selectedVideo?.id === item.id ? "10px" : "0" }}>
                <p style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 500, margin: 0, flex: 1, lineHeight: 1.4 }}>
                  {item.title.length > 55 ? item.title.slice(0, 55) + "…" : item.title}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFromTray(item.id); }}
                  style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "16px", padding: "0 0 0 8px", flexShrink: 0 }}
                >
                  ×
                </button>
              </div>

              {/* Generate buttons — show when selected */}
              {selectedVideo?.id === item.id && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {GENERATE_OPTIONS.map((opt) => (
                    <button
                      key={opt.type}
                      onClick={(e) => { e.stopPropagation(); handleGenerate(item, opt.type); }}
                      style={{
                        padding: "5px 10px",
                        background: "rgba(139,92,246,0.2)",
                        border: "1px solid rgba(139,92,246,0.3)",
                        borderRadius: "6px",
                        color: "#c4b5fd",
                        fontSize: "11px",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <p style={{ color: "#6b7280", fontSize: "11px", textAlign: "center", margin: "8px 0 0" }}>
            Click a video → choose what to generate
          </p>
        </div>
      )}
    </div>
  );
}
