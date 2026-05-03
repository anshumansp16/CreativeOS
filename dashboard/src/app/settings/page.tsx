"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

interface KeyStatus { masked: string; configured: boolean; }
interface KeysState {
  claude:  KeyStatus;
  youtube: KeyStatus;
  openai:  KeyStatus;
  notion:  KeyStatus;
}

const KEY_META = [
  { id: "claude",  label: "Claude API Key",        icon: "🤖", color: "#f472b6", hint: "Used for all AI generation — ideas, scripts, descriptions, insights" },
  { id: "youtube", label: "YouTube Data API Key",   icon: "📺", color: "#ef4444", hint: "Fetches channel analytics, trending videos, and idea research" },
  { id: "openai",  label: "OpenAI API Key",         icon: "⚡", color: "#34d399", hint: "Optional fallback for content generation" },
  { id: "notion",  label: "Notion API Key",         icon: "📝", color: "#a78bfa", hint: "Syncs content calendar and saves ideas to Notion" },
] as const;

type KeyId = typeof KEY_META[number]["id"];

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [keys, setKeys] = useState<KeysState | null>(null);
  const [revealed, setRevealed] = useState<Partial<Record<KeyId, boolean>>>({});
  const [channelId, setChannelId] = useState("UCxxxxxxxxxxxxxxxxxxxxxxxxxx");
  const [saved, setSaved] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(setKeys)
      .catch(() => {});
  }, []);

  const configuredCount = keys
    ? Object.values(keys).filter(k => k.configured).length
    : 0;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ width: "100%", maxWidth: "780px" }} className="animate-fadeIn">
      {/* Header */}
      <header style={{ marginBottom: "16px" }}>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-3">
          <span>⚙️</span> Settings
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">Configure your CreatorOS integrations and API keys</p>
      </header>

      {/* Status Banner */}
      {keys && (
        <div style={{
          background: configuredCount === 4
            ? "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(52,211,153,0.06))"
            : "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(249,115,22,0.06))",
          border: `1px solid ${configuredCount === 4 ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
          borderRadius: "14px",
          padding: "12px 18px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
          <span style={{ fontSize: "20px" }}>{configuredCount === 4 ? "✅" : "⚠️"}</span>
          <div>
            <p style={{ color: configuredCount === 4 ? "#34d399" : "#fbbf24", fontWeight: 600, fontSize: "13px", margin: 0 }}>
              {configuredCount} / 4 API keys configured
            </p>
            <p style={{ color: "#6b7280", fontSize: "12px", margin: "2px 0 0" }}>
              Keys are loaded from{" "}
              <code style={{ background: "rgba(255,255,255,0.07)", padding: "1px 5px", borderRadius: "4px", fontSize: "11px" }}>
                dashboard/.env.local
              </code>
              {" "}— edit that file to update them permanently
            </p>
          </div>
        </div>
      )}

      {/* API Keys */}
      <div className="settings-section">
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🔑</span> API Keys
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {KEY_META.map(({ id, label, icon, color, hint }) => {
            const status = keys?.[id as KeyId];
            const isConfigured = status?.configured ?? false;
            const isRevealed = revealed[id as KeyId] ?? false;

            return (
              <div key={id} style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${isConfigured ? color + "30" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "12px",
                padding: "12px 14px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "16px" }}>{icon}</span>
                  <span style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: 600, flex: 1 }}>{label}</span>
                  <span style={{
                    padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
                    background: isConfigured ? `${color}20` : "rgba(100,116,139,0.15)",
                    color: isConfigured ? color : "#64748b",
                    border: `1px solid ${isConfigured ? color + "40" : "rgba(100,116,139,0.3)"}`,
                  }}>
                    {isConfigured ? "● ACTIVE" : "○ NOT SET"}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    padding: "7px 12px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: isConfigured ? "#94a3b8" : "#475569",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {!isConfigured
                      ? "Not configured"
                      : isRevealed
                      ? (status?.masked ?? "")
                      : (status?.masked ?? "").replace(/./g, "•").slice(0, 28) + "••••"}
                  </div>
                  {isConfigured && (
                    <button
                      onClick={() => setRevealed(prev => ({ ...prev, [id]: !isRevealed }))}
                      style={{
                        padding: "6px 10px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#64748b",
                        fontSize: "12px",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      {isRevealed ? "🙈 Hide" : "👁 Show"}
                    </button>
                  )}
                </div>
                <p style={{ color: "#475569", fontSize: "11px", margin: "6px 0 0" }}>{hint}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* YouTube Channel */}
      <div className="settings-section">
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>📺</span> YouTube Channel
        </h3>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px" }}>
            Channel ID
          </label>
          <input
            type="text"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            className="input-field"
            style={{ fontSize: "13px" }}
          />
          <p style={{ color: "#475569", fontSize: "11px", margin: "5px 0 0" }}>
            Find it at youtube.com/account_advanced or Studio → Settings → Channel
          </p>
        </div>
      </div>

      {/* Preferences */}
      <div className="settings-section">
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🎨</span> Preferences
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            {
              label: "Dark Mode", desc: "Switch between light and dark theme",
              checked: theme === "dark", color: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              onToggle: toggleTheme,
            },
            {
              label: "Auto-save Content", desc: "Automatically save generated scripts, descriptions & social posts to Library",
              checked: autoSave, color: "linear-gradient(135deg,#10b981,#34d399)",
              onToggle: () => setAutoSave(!autoSave),
            },
          ].map(({ label, desc, checked, color, onToggle }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "10px",
            }}>
              <div>
                <p style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "13px", margin: 0 }}>{label}</p>
                <p style={{ color: "#64748b", fontSize: "11px", margin: "2px 0 0" }}>{desc}</p>
              </div>
              <button onClick={onToggle} style={{
                width: "44px", height: "24px", borderRadius: "12px", position: "relative",
                cursor: "pointer", border: "none", flexShrink: 0,
                background: checked ? color : "rgba(255,255,255,0.15)",
                transition: "background 0.2s",
              }}>
                <div style={{
                  position: "absolute", top: "3px", width: "18px", height: "18px",
                  background: "white", borderRadius: "50%", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  left: checked ? "23px" : "3px", transition: "left 0.2s",
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI Models */}
      <div className="settings-section">
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🧠</span> AI Models
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { model: "claude-haiku-4-5-20251001", provider: "Anthropic", use: "Ideas, Scripts, Descriptions, Insights, Social posts", status: "Primary", color: "#f472b6" },
            { model: "gpt-4o-mini",               provider: "OpenAI",    use: "Fallback for content generation",                       status: "Fallback", color: "#34d399" },
            { model: "llama3.2 (Ollama)",          provider: "Local",     use: "Offline fallback when no internet or API keys",          status: "Offline",  color: "#64748b" },
          ].map(m => (
            <div key={m.model} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "9px 14px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px",
            }}>
              <div style={{ flex: 1 }}>
                <span style={{ color: "#f1f5f9", fontFamily: "monospace", fontSize: "12px", fontWeight: 600 }}>{m.model}</span>
                <span style={{ color: "#475569", fontSize: "11px" }}> · {m.provider}</span>
                <p style={{ color: "#475569", fontSize: "11px", margin: "2px 0 0" }}>{m.use}</p>
              </div>
              <span style={{
                padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 700, flexShrink: 0,
                background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}35`,
              }}>{m.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button className="btn-secondary" style={{ fontSize: "13px" }}>Cancel</button>
        <button onClick={handleSave} className="btn-primary" style={{ fontSize: "13px" }}>
          {saved ? "✓ Saved!" : "💾 Save Settings"}
        </button>
      </div>
    </div>
  );
}
