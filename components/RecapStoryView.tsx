
import React, { useState, useEffect, useRef } from 'react';
import { X, Share2, MapPin, Camera, Beer, Zap, Wand2, Send, Edit } from 'lucide-react';
import { SessionData } from '../types';
import { GoogleGenAI } from "@google/genai";

interface RecapStoryViewProps {
  onClose: () => void;
  session: SessionData;
}

// Helper to convert URL to Base64 (for AI Image Editing)
const urlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data:image/...;base64, prefix
    };
    reader.readAsDataURL(blob);
  });
};

export const RecapStoryView: React.FC<RecapStoryViewProps> = ({ onClose, session }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [loadingText, setLoadingText] = useState('BOOTING AI...');
  const [aiVerdict, setAiVerdict] = useState<string>('');
  
  // AI Image Editing State
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditingProcessing, setIsEditingProcessing] = useState(false);
  const [editedPhotos, setEditedPhotos] = useState<Record<string, string>>({});

  const slides = ['INTRO', 'STATS', 'PATH', 'PHOTOS', 'VERDICT'];
  const aiRef = useRef<GoogleGenAI | null>(null);

  // Initialize AI
  useEffect(() => {
    // NOTE: In a real production app, ensure process.env.API_KEY is defined.
    // If not, this gracefully falls back to simulation mode.
    try {
        if (process.env.API_KEY) {
            aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
    } catch (e) {
        console.warn("AI Client failed to initialize", e);
    }
  }, []);

  // Generate Story Content (Verdict)
  useEffect(() => {
    const generateStory = async () => {
      // Simulation steps for effect
      const steps = [
        'CRUNCHING NUMBERS...',
        'JUDGING CHOICES...',
        'RENDERING COMIC...',
        'FINALIZING STORY...'
      ];
      
      for (const step of steps) {
        setLoadingText(step);
        await new Promise(r => setTimeout(r, 800));
      }

      // Try AI Generation for Verdict
      if (aiRef.current) {
        try {
             const stats = `${session.drinksConsumed} drinks, ${session.photos.length} photos, 3 locations`;
             const response = await aiRef.current.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are a snarky comic book narrator. Write a VERY SHORT (max 15 words), funny, roast-style caption for a recap of a night out with these stats: ${stats}.`,
             });
             setAiVerdict(response.text || "You survived the night. Barely.");
        } catch (e) {
            setAiVerdict("You hit 3 spots, drank enough to power a sedan, and somehow kept your keys.");
        }
      } else {
        setAiVerdict("You hit 3 spots, drank enough to power a sedan, and somehow kept your keys.");
      }
      
      setIsGenerating(false);
    };

    generateStory();
  }, [session]);

  // Handle Image Editing with Gemini
  const handleAiEdit = async (photoId: string, currentUrl: string) => {
      if (!editPrompt.trim() || !aiRef.current) return;
      
      setIsEditingProcessing(true);
      try {
          const base64Data = await urlToBase64(currentUrl);
          
          const response = await aiRef.current.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                  parts: [
                      { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
                      { text: editPrompt } // e.g., "Add a retro comic filter"
                  ]
              }
          });

          // Extract image from response
          // Note: Real API response structure handling for images
          // Since we can't easily mock the binary response here without a real key, 
          // we will simulate a success for the UI demo if API fails or returns text.
          
          let newImageUrl = currentUrl; // Fallback
          
          // Check for image parts in response (Generic handling)
          if (response.candidates?.[0]?.content?.parts) {
               for (const part of response.candidates[0].content.parts) {
                   if (part.inlineData) {
                       newImageUrl = `data:image/png;base64,${part.inlineData.data}`;
                   }
               }
          }
          
          setEditedPhotos(prev => ({...prev, [photoId]: newImageUrl}));
          setEditingPhotoId(null);
          setEditPrompt('');
      } catch (e) {
          console.error("Edit failed", e);
          alert("AI Edit failed (Check API Key).");
      } finally {
          setIsEditingProcessing(false);
      }
  };

  // Auto-advance slides logic
  useEffect(() => {
    if (isGenerating || editingPhotoId) return;
    
    const timer = setTimeout(() => {
      if (slideIndex < slides.length - 1) {
        setSlideIndex(prev => prev + 1);
      }
    }, 5000); // 5 seconds per slide
    
    return () => clearTimeout(timer);
  }, [slideIndex, isGenerating, editingPhotoId]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingPhotoId) return;
    if (slideIndex < slides.length - 1) setSlideIndex(prev => prev + 1);
    else onClose();
  };

  if (isGenerating) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-display text-center p-6">
        {/* Halftone BG */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,#333_1px,transparent_1px)] bg-[length:20px_20px] opacity-20"></div>
        
        <div className="relative z-10 bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#ccff00] transform -rotate-2">
            <h2 className="text-4xl font-black text-black uppercase animate-pulse mb-4 leading-none break-words">{loadingText}</h2>
            <div className="w-full h-4 bg-black border-2 border-black p-0.5">
                <div className="h-full bg-acid-pink animate-[width_3s_ease-in-out_infinite]" style={{width: '100%'}}></div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden" onClick={handleNext}>
      
      {/* Halftone Overlay Global */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#222_2px,transparent_2px)] bg-[length:16px_16px] pointer-events-none opacity-20"></div>

      {/* Progress Bar */}
      <div className="flex gap-2 p-3 safe-area-top z-50">
        {slides.map((_, idx) => (
          <div key={idx} className="h-2 flex-1 bg-gray-800 border border-black/50">
            <div 
              className={`h-full bg-acid-lime transition-all duration-[5000ms] linear ${idx === slideIndex ? 'w-full' : (idx < slideIndex ? 'w-full duration-0' : 'w-0')}`}
            ></div>
          </div>
        ))}
      </div>

      {/* Close Button */}
      <div className="absolute top-12 right-4 z-50">
         <button onClick={onClose} className="bg-black text-white border-2 border-white p-2 hover:bg-white hover:text-black transition-colors"><X size={24} /></button>
      </div>

      {/* Content Container */}
      <div className="flex-1 relative w-full h-full">
        
        {/* SLIDE 1: INTRO (Comic Cover) */}
        {slideIndex === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-acid-lime">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.1)_2px,transparent_2px)] bg-[length:20px_20px]"></div>
            
            <div className="border-8 border-black p-8 bg-white shadow-[16px_16px_0px_0px_#000] transform rotate-1 max-w-md w-full text-center">
                <div className="bg-acid-pink text-white inline-block px-4 py-1 font-mono font-bold text-sm uppercase mb-4 border-2 border-black -rotate-2">
                    Issue #402
                </div>
                <h1 className="text-6xl md:text-8xl font-display font-black text-black leading-[0.85] mb-2 tracking-tighter">
                  THE<br/>MORNING<br/>AFTER
                </h1>
                <div className="h-1 w-full bg-black my-4"></div>
                <p className="font-bold text-black uppercase text-xl md:text-2xl">
                  A Friday Night Saga
                </p>
            </div>
          </div>
        )}

        {/* SLIDE 2: STATS (Comic Panels) */}
        {slideIndex === 1 && (
          <div className="absolute inset-0 flex flex-col p-6 pt-20 bg-[#1a1a1a]">
             <h2 className="text-5xl font-display font-black text-white italic uppercase mb-8 text-center text-shadow-comic">
                <span className="text-acid-lime">THE DAMAGE</span> REPORT
             </h2>
             
             <div className="grid grid-cols-2 gap-4 w-full h-3/5">
                <div className="bg-acid-blue border-4 border-black p-4 flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_#fff]">
                    <Beer size={48} className="text-black mb-2" strokeWidth={2.5} />
                    <span className="text-6xl font-display font-black text-black">{session.drinksConsumed}</span>
                    <span className="text-sm font-bold bg-white text-black px-2 uppercase transform -rotate-3">Drinks</span>
                </div>
                <div className="bg-acid-pink border-4 border-black p-4 flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_#fff]">
                    <MapPin size={48} className="text-black mb-2" strokeWidth={2.5} />
                    <span className="text-6xl font-display font-black text-black">3</span>
                    <span className="text-sm font-bold bg-white text-black px-2 uppercase transform rotate-2">Spots</span>
                </div>
                <div className="col-span-2 bg-white border-4 border-black p-4 flex items-center justify-between px-10 shadow-[4px_4px_0px_0px_#ccff00]">
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold bg-black text-white px-2 uppercase mb-1">Social Battery</span>
                        <div className="flex gap-1">
                            {[1,2,3,4,5].map(i => <Zap key={i} size={24} className="text-black fill-acid-lime" />)}
                        </div>
                    </div>
                    <span className="text-4xl font-display font-black text-black">100%</span>
                </div>
             </div>
          </div>
        )}

        {/* SLIDE 3: PATH */}
        {slideIndex === 2 && (
          <div className="absolute inset-0 bg-night-950 relative">
             <div className="absolute inset-0 opacity-40 bg-[url('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/14/8056/5377.png')] bg-cover grayscale contrast-125"></div>
             
             {/* Path SVG */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <path 
                  d="M 50 500 Q 150 400 200 500 T 350 300 T 200 150" 
                  stroke="#ccff00" strokeWidth="8" fill="none" 
                  className="drop-shadow-[0_0_10px_rgba(204,255,0,0.8)]"
                />
             </svg>
             
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#ff00ff] transform -rotate-3">
                    <h2 className="text-4xl font-display font-black text-black uppercase text-center leading-none">
                        2.4 MILES<br/>STUMBLED
                    </h2>
                </div>
             </div>
          </div>
        )}

        {/* SLIDE 4: PHOTOS (AI EDITABLE) */}
        {slideIndex === 3 && (
           <div className="absolute inset-0 flex flex-col bg-white p-4 pt-20">
               <h2 className="text-5xl font-display font-black text-black uppercase mb-6 text-center">EVIDENCE</h2>
               
               <div className="flex-1 grid grid-cols-1 gap-4 overflow-y-auto pb-20 no-scrollbar">
                   {(session.photos.length > 0 ? session.photos : [
                       {id: '1', url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600'},
                       {id: '2', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600'}
                   ]).map((photo) => (
                       <div key={photo.id} className="relative bg-black border-4 border-black p-2 shadow-[8px_8px_0px_0px_#000]">
                           <img 
                                src={editedPhotos[photo.id] || photo.url} 
                                className="w-full h-64 object-cover filter contrast-125 grayscale" 
                                alt="Memory"
                           />
                           
                           {/* AI Edit Button */}
                           <button 
                                onClick={(e) => { e.stopPropagation(); setEditingPhotoId(photo.id); }}
                                className="absolute bottom-4 right-4 bg-acid-lime text-black border-2 border-black px-3 py-2 font-bold uppercase flex items-center gap-2 hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_#000]"
                           >
                               <Wand2 size={16} /> Remix
                           </button>

                           {/* Prompt Input Overlay */}
                           {editingPhotoId === photo.id && (
                               <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in" onClick={(e) => e.stopPropagation()}>
                                   <h3 className="text-acid-lime font-display font-black text-2xl uppercase mb-4">Magic Editor</h3>
                                   <input 
                                        type="text" 
                                        autoFocus
                                        value={editPrompt}
                                        onChange={(e) => setEditPrompt(e.target.value)}
                                        placeholder="E.g. Make it a 90s comic..."
                                        className="w-full bg-night-800 border-2 border-white text-white p-3 mb-4 font-bold uppercase placeholder:text-gray-500"
                                   />
                                   <div className="flex gap-2 w-full">
                                       <button 
                                            onClick={() => handleAiEdit(photo.id, editedPhotos[photo.id] || photo.url)}
                                            disabled={isEditingProcessing}
                                            className="flex-1 bg-acid-pink text-white border-2 border-white py-3 font-black uppercase flex justify-center items-center gap-2"
                                       >
                                           {isEditingProcessing ? <span className="animate-spin">⌛</span> : <><Zap size={18} /> GENERATE</>}
                                       </button>
                                       <button 
                                            onClick={() => setEditingPhotoId(null)}
                                            className="px-4 bg-white text-black border-2 border-white font-bold uppercase"
                                       >
                                           Cancel
                                       </button>
                                   </div>
                               </div>
                           )}
                       </div>
                   ))}
               </div>
           </div>
        )}

        {/* SLIDE 5: VERDICT (AI Generated Text) */}
        {slideIndex === 4 && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-acid-blue p-6 text-center">
               <div className="absolute inset-0 bg-[radial-gradient(circle,white_2px,transparent_2px)] bg-[length:24px_24px] opacity-20"></div>
               
               <h2 className="text-6xl md:text-7xl font-display font-black text-black uppercase mb-8 leading-none transform -rotate-2">
                   VERDICT
               </h2>
               
               {/* Speech Bubble */}
               <div className="relative bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] max-w-md w-full">
                   <p className="text-2xl md:text-3xl font-body font-bold text-black uppercase leading-tight">
                       "{aiVerdict}"
                   </p>
                   {/* Bubble Tail */}
                   <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-r-4 border-b-4 border-black rotate-45"></div>
               </div>

               <button className="mt-16 bg-black text-white px-8 py-4 border-2 border-white rounded-none shadow-[8px_8px_0px_0px_#ccff00] font-black uppercase text-xl flex items-center gap-3 hover:translate-y-1 hover:shadow-none transition-all">
                   <Share2 size={24} /> Share Story
               </button>
           </div>
        )}
      </div>
    </div>
  );
};
