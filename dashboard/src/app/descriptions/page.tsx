"use client";
import { useState } from "react";
import { ChatBubbleBottomCenterTextIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function DescriptionsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDescription = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      setDescription(`🚀 ${title || "Your Video Title"}\n\nIn this video, I show you exactly how to build an AI-powered content creation system that will 10x your productivity.\n\n📌 What you'll learn:\n• How to set up N8N for automation\n• Integrating Claude AI for script generation\n• Building a RAG system for your content\n\n⏱️ Timestamps:\n0:00 - Introduction\n1:30 - Setting up the tools\n5:00 - Live demo\n8:00 - Results & tips\n\n🔗 Resources:\n• N8N: https://n8n.io\n• Claude AI: https://claude.ai\n\n#AIAutomation #ContentCreation #YouTubeGrowth #N8N #ClaudeAI`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"><ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Description Generator</h1><p className="text-white/60">Generate SEO-optimized descriptions</p></div>
      </div>
      <div className="glass-card p-6 animate-fade-in stagger-1">
        <div className="space-y-4">
          <div><label className="block text-sm text-white/70 mb-2">Video Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter your video title..." className="glass-input w-full px-4 py-3" /></div>
          <button onClick={generateDescription} disabled={isGenerating} className="btn-primary w-full flex items-center justify-center gap-2">
            {isGenerating ? <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>Generating...</> : <><SparklesIcon className="w-5 h-5" />Generate Description</>}
          </button>
        </div>
      </div>
      {description && <div className="glass-card p-6 animate-fade-in"><h2 className="text-lg font-semibold text-white mb-4">Generated Description</h2><pre className="whitespace-pre-wrap text-sm text-white/80 font-sans leading-relaxed">{description}</pre><button onClick={() => navigator.clipboard.writeText(description)} className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 text-sm">Copy to Clipboard</button></div>}
    </div>
  );
}
