"use client";
import { useState } from "react";
import { LightBulbIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function IdeasPage() {
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateIdeas = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIdeas(["How I Built an AI Content System That Writes Scripts for Me", "5 N8N Workflows Every YouTuber Needs in 2026", "From 0 to 1000 Subscribers: My AI-Powered Strategy", "The Secret Tool That 10x'd My Content Production", "Why Most YouTubers Fail (And How AI Can Help)"]);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center"><LightBulbIcon className="w-6 h-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Idea Generator</h1><p className="text-white/60">Generate viral video ideas with AI</p></div>
      </div>
      <div className="glass-card p-6 animate-fade-in stagger-1">
        <div className="space-y-4">
          <div><label className="block text-sm text-white/70 mb-2">Topic or Niche</label><input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., AI automation, productivity..." className="glass-input w-full px-4 py-3" /></div>
          <button onClick={generateIdeas} disabled={isGenerating} className="btn-primary w-full flex items-center justify-center gap-2">
            {isGenerating ? <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>Generating...</> : <><SparklesIcon className="w-5 h-5" />Generate Ideas</>}
          </button>
        </div>
      </div>
      {ideas.length > 0 && (
        <div className="space-y-3 animate-fade-in"><h2 className="text-lg font-semibold text-white">Generated Ideas</h2>
          {ideas.map((idea, i) => <div key={i} className="glass-card p-4 hover:bg-white/10 cursor-pointer"><div className="flex items-start gap-3"><span className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-sm font-bold">{i+1}</span><p className="text-white/80 flex-1">{idea}</p></div></div>)}
        </div>
      )}
    </div>
  );
}
