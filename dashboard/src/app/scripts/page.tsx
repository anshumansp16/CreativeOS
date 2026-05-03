"use client";
import { useState } from "react";
import { DocumentTextIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function ScriptsPage() {
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateScript = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      setScript(`# ${title || "Your Video Title"}\n\n## Hook (0:00 - 0:30)\nAaj main aapko dikhaunga ek aisa tool jo aapki content creation ko completely transform kar dega...\n\n## Introduction (0:30 - 1:30)\nNamaste doston! Main Anshuman, aur aaj hum baat karenge AI-powered content creation ke baare mein...\n\n## Main Content (1:30 - 8:00)\n### Point 1: The Problem\nBahut saare creators struggle karte hain consistent content banane mein...\n\n### Point 2: The Solution\nIs tool ke saath, aap apni productivity 10x kar sakte ho...\n\n## Call to Action (8:00 - 9:00)\nAgar aapko ye video helpful lagi, toh like karo, subscribe karo...\n\n## Outro (9:00 - 10:00)\nThank you for watching! Next video mein milte hain...`);
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><DocumentTextIcon className="w-6 h-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Script Generator</h1><p className="text-white/60">Generate full Hindi/Hinglish scripts</p></div>
      </div>
      <div className="glass-card p-6 animate-fade-in stagger-1">
        <div className="space-y-4">
          <div><label className="block text-sm text-white/70 mb-2">Video Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter your video title..." className="glass-input w-full px-4 py-3" /></div>
          <button onClick={generateScript} disabled={isGenerating} className="btn-primary w-full flex items-center justify-center gap-2">
            {isGenerating ? <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>Generating Script...</> : <><SparklesIcon className="w-5 h-5" />Generate Script</>}
          </button>
        </div>
      </div>
      {script && <div className="glass-card p-6 animate-fade-in"><h2 className="text-lg font-semibold text-white mb-4">Generated Script</h2><pre className="whitespace-pre-wrap text-sm text-white/80 font-sans leading-relaxed">{script}</pre></div>}
    </div>
  );
}
