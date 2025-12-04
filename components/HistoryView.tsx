
import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HistoryViewProps } from '../types';
import { Wand2 } from 'lucide-react';

const data = [
  { day: 'M', drinks: 0 },
  { day: 'T', drinks: 2 },
  { day: 'W', drinks: 0 },
  { day: 'T', drinks: 4 },
  { day: 'F', drinks: 6 },
  { day: 'S', drinks: 5 },
  { day: 'S', drinks: 1 },
];

const previousRounds = [
    { id: 1, day: "SATURDAY NIGHT", location: "The Rusty Nail", count: 8, color: "text-acid-pink" },
    { id: 2, day: "THURSDAY NIGHT", location: "Bar 1661", count: 3, color: "text-white" },
    { id: 3, day: "LAST FRIDAY", location: "Pygmalion", count: 6, color: "text-acid-lime" },
];

interface ExtendedHistoryViewProps extends HistoryViewProps {
  onOpenRecap: () => void;
}

export const HistoryView: React.FC<ExtendedHistoryViewProps> = ({ photos, onOpenRecap }) => {
  return (
    <div className="flex flex-col h-full bg-[#050505] p-6 overflow-y-auto no-scrollbar pb-24">
      
      {/* AI Generate Recap Button */}
      <div className="mb-8">
        <button 
            onClick={onOpenRecap}
            className="w-full h-20 relative group overflow-hidden border-2 border-white/20 hover:border-acid-lime transition-all rounded-xl"
        >
            <div className="absolute inset-0 bg-night-900 group-hover:bg-night-800 transition-colors"></div>
            {/* Animated Gradient Border effect */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-acid-lime to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
            
            <div className="absolute inset-0 flex items-center justify-between px-6">
                <div className="text-left flex items-center h-full">
                    <span className="block text-white font-display font-black text-lg md:text-2xl uppercase italic leading-none">Morning After Recap</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-acid-lime flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                    <Wand2 size={24} />
                </div>
            </div>
        </button>
      </div>

      {/* Header - Fixed line-height and margin to prevent cutoff */}
      <div className="mb-8 pt-0">
        <h1 className="text-5xl md:text-6xl font-display font-black text-white tracking-tighter leading-tight">
            THE<br/>
            <span className="text-acid-lime block mt-1">ARCHIVE</span>
        </h1>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Big Stat */}
        <div className="bg-acid-lime p-4 border-2 border-black shadow-[4px_4px_0px_0px_#fff] flex flex-col justify-between h-40">
            <p className="text-black font-bold font-mono text-xs uppercase">Avg / Night</p>
            {/* Responsive text size: 5xl on mobile, 7xl on desktop */}
            <p className="text-5xl md:text-7xl font-display font-black text-black leading-none break-all">3.2</p>
        </div>
        
        {/* Secondary Stat */}
        <div className="bg-black p-4 border-2 border-white shadow-[4px_4px_0px_0px_#ccff00] flex flex-col justify-between h-40">
            <p className="text-gray-400 font-bold font-mono text-xs uppercase">Top Poison</p>
            <div className="w-full flex justify-end">
                <span className="text-5xl">🍺</span>
            </div>
            <p className="text-2xl font-display font-bold text-white uppercase truncate">IPA</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-night-900 border-2 border-white/10 p-6 mb-8">
        <h2 className="text-lg font-display font-bold text-white mb-4 uppercase">Weekly Flow</h2>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12, fontWeight: 'bold' }} />
              <Bar dataKey="drinks" radius={[2, 2, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.drinks > 4 ? '#ff00ff' : '#ccff00'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Photo Gallery (Masonry Style) */}
      {photos && photos.length > 0 && (
          <div className="mb-8">
              <h2 className="text-2xl font-display font-black text-white mb-4 uppercase">Snaps</h2>
              <div className="columns-2 gap-4">
                  {photos.map((photo, i) => (
                      <div key={photo.id} className="mb-4 break-inside-avoid relative group">
                          <div className="bg-white p-2 border-2 border-black transform transition-transform hover:-translate-y-1">
                            <img src={photo.url} className="w-full grayscale group-hover:grayscale-0" alt="Memory" />
                            <p className="text-[10px] font-mono font-bold text-black mt-1 text-right">
                                {new Date(photo.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* List */}
      <h3 className="text-lg font-display font-bold text-white mb-4 uppercase">Previous Rounds</h3>
      <div className="space-y-2">
        {previousRounds.map((round) => (
            <div key={round.id} className="flex items-center justify-between p-4 border border-white/10 hover:bg-white/5 transition-colors group">
                <div>
                    <p className="text-white font-bold uppercase text-lg">{round.day}</p>
                    <p className="text-xs text-acid-lime font-mono group-hover:text-acid-pink transition-colors">{round.location}</p>
                </div>
                <div className="text-right">
                    <span className={`block text-3xl font-display font-black ${round.color}`}>{round.count}</span>
                    <span className="text-[10px] text-gray-500 uppercase">Drinks</span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
