// Shared API client for CreatorOS
// Works in both Next.js (browser) and Tauri (with fetch polyfill)

const API_BASE = typeof window !== 'undefined' && window.location.port === '3001' 
  ? 'http://localhost:3001/api'
  : '/api';

export async function fetchYouTubeData() {
  const res = await fetch(`${API_BASE}/youtube`);
  return res.json();
}

export async function fetchViralContent() {
  const res = await fetch(`${API_BASE}/viral`);
  return res.json();
}

export async function fetchCalendar() {
  const res = await fetch(`${API_BASE}/calendar`);
  return res.json();
}

export async function generateIdeas(topic?: string, count?: number) {
  const res = await fetch(`${API_BASE}/ideas/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, count }),
  });
  return res.json();
}

export async function generateScript(title: string, style?: string, duration?: string) {
  const res = await fetch(`${API_BASE}/scripts/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, style, duration }),
  });
  return res.json();
}

export async function generateDescription(title: string) {
  const res = await fetch(`${API_BASE}/descriptions/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return res.json();
}

// For Tauri: Use invoke instead of fetch
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}
