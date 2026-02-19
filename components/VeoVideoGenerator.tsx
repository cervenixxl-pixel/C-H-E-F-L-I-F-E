
import React, { useState } from 'react';
import { generateChefTeaser } from '../services/geminiService';

const VeoVideoGenerator: React.FC<{ chefName: string; onComplete: (url: string) => void; onCancel: () => void }> = ({ chefName, onComplete, onCancel }) => {
  const [prompt, setPrompt] = useState(`A cinematic close-up of a Michelin chef expertly plating a beautiful dish, slow motion, elegant lighting, professional culinary aesthetics.`);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    // Check for API Key selection (Required for Veo)
    if (!(window as any).aistudio?.hasSelectedApiKey()) {
        await (window as any).aistudio?.openSelectKey();
    }

    setIsGenerating(true);
    setStatus('Initializing Veo 3 Engine...');
    
    const messages = [
        "Analyzing cinematic requirements...",
        "Simulating fluid dynamics...",
        "Rendering luxury lighting passes...",
        "Compositing final frames...",
        "Polishing gastronomic visual detail..."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
        setStatus(messages[i % messages.length]);
        i++;
    }, 4000);

    try {
      const videoUrl = await generateChefTeaser(prompt, aspectRatio);
      onComplete(videoUrl);
    } catch (err: any) {
      if (err.message.includes("requested AI model is unavailable") || err.message.includes("404")) {
          const retry = confirm("The video engine requires an active paid API key selection. Would you like to select one now?");
          if (retry) {
              await (window as any).aistudio?.openSelectKey();
              // Proceed to next attempt or guide user
          }
      } else {
          alert(err.message || "Video generation failed. Please ensure you have selected a valid paid API key.");
      }
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-md" onClick={onCancel}></div>
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-10">
            <h3 className="text-3xl font-serif font-bold text-brand-dark mb-2">Cinematic Teaser Engine</h3>
            <p className="text-gray-500 mb-8">Generate a high-end teaser video for your chef profile using Veo 3.1 technology.</p>
            
            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Visual Narrative Prompt</label>
                    <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full p-4 border border-gray-200 rounded-2xl h-32 focus:ring-1 focus:ring-brand-gold outline-none text-gray-700 leading-relaxed italic" placeholder="Describe the scene..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Aspect Ratio</label>
                        <div className="flex gap-2">
                            {['16:9', '9:16'].map(ratio => (
                                <button key={ratio} onClick={() => setAspectRatio(ratio as any)} className={`flex-1 py-3 rounded-xl border font-bold transition-all ${aspectRatio === ratio ? 'bg-brand-dark text-white' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>{ratio}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-brand-light p-4 rounded-xl text-[10px] text-gray-400 italic">
                    Note: Video generation may take several minutes. A paid Google AI Studio API key from a billing-enabled project is required.
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="ml-2 text-brand-gold underline font-bold">Billing Docs</a>
                </div>

                <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-brand-dark text-brand-gold py-5 rounded-2xl font-bold text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center space-x-3 disabled:opacity-50">
                    {isGenerating ? <><div className="w-5 h-5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div><span>{status}</span></> : <><span>Generate Cinematic Teaser</span><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></>}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VeoVideoGenerator;
