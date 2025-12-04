import React, { useState } from 'react';
import { X, Zap } from 'lucide-react';

interface CameraViewProps {
  onClose: () => void;
  onCapture: (imgUrl: string) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onClose, onCapture }) => {
  const [flash, setFlash] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const takePicture = () => {
    setFlash(true);
    setTimeout(() => {
        setFlash(false);
        setCaptured(true);
        setIsProcessing(true);
        setTimeout(() => {
            onCapture('https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80');
        }, 1500);
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-mono">
      {/* HUD Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20 safe-area-top">
          <button onClick={onClose} className="p-2 border-2 border-white text-white hover:bg-white hover:text-black transition-colors">
              <X size={24} />
          </button>
          <div className="px-3 py-1 bg-acid-lime border-2 border-black text-xs font-bold text-black flex items-center gap-1">
              <Zap size={12} fill="currentColor" /> REC
          </div>
      </div>
      
      {/* Viewfinder simulation */}
      <div className="relative flex-1 bg-gray-900 overflow-hidden border-x-4 border-black">
        
        {/* Crosshairs */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-50">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/30"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-acid-lime">+</div>
        </div>

        {/* Live Camera Feed */}
        <img 
            src="https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80" 
            className={`w-full h-full object-cover transition-all duration-100 filter contrast-125 saturate-150 ${captured ? 'blur-xl scale-110' : ''}`}
            alt="Viewfinder"
        />

        {/* Shutter Button Area */}
        {!isProcessing && (
            <div className="absolute bottom-0 left-0 w-full p-10 flex items-center justify-center pb-16 z-20">
                <button 
                    onClick={takePicture}
                    className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center relative active:scale-95 transition-transform group"
                >
                    <div className="w-20 h-20 bg-white rounded-full border-4 border-black group-active:bg-acid-pink"></div>
                </button>
            </div>
        )}

        {/* Flash Overlay */}
        {flash && (
            <div className="absolute inset-0 bg-white animate-out fade-out duration-150 pointer-events-none z-50"></div>
        )}
        
        {/* Processing State (Glitch Text) */}
        {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-40">
                <h2 className="text-4xl font-display font-black text-acid-lime animate-pulse">PROCESSING</h2>
                <div className="w-32 h-2 bg-gray-800 mt-4 overflow-hidden border border-white">
                    <div className="h-full bg-acid-pink animate-marquee"></div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};