import React, { useState } from 'react';
import { SessionData } from '../types';

interface LiquidAvatarProps {
  session: SessionData;
  onClick: () => void;
}

export const LiquidAvatar: React.FC<LiquidAvatarProps> = ({ session, onClick }) => {
  const { drinksConsumed, isDesignatedDriver } = session;
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate fill height
  const percentage = Math.min(drinksConsumed * 20, 100);
  
  // Acid Aesthetic Colors
  let liquidColor = 'bg-acid-lime'; 
  let borderColor = 'border-white';
  
  if (isDesignatedDriver) {
    liquidColor = 'bg-acid-blue';
  } else if (percentage >= 80) {
    liquidColor = 'bg-acid-pink';
    borderColor = 'border-acid-pink';
  }

  const handleClick = () => {
      setIsAnimating(true);
      onClick();
      setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-8">
      {/* Container Circle */}
      <div 
        onClick={handleClick}
        className={`relative w-72 h-72 rounded-full border-[6px] ${borderColor} bg-black overflow-hidden cursor-pointer transition-transform duration-100 ${isAnimating ? 'scale-95' : 'hover:scale-[1.02]'} shadow-2xl group`}
        style={{ 
          transform: 'translateZ(0)', // Force GPU layer
          WebkitMaskImage: '-webkit-radial-gradient(white, black)' // Fix overflow on Safari
        }}
      >
        {/* Empty State Text */}
        {percentage === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-800 animate-pulse">
            <span className="font-display font-black text-5xl uppercase opacity-20 rotate-[-10deg]">
                {isDesignatedDriver ? "DD MODE" : "EMPTY"}
            </span>
          </div>
        )}

        {/* Liquid Layer */}
        <div 
          className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ease-spring z-10 ${liquidColor} opacity-100 border-t-4 border-black`}
          style={{ height: `${percentage}%` }}
        >
          {/* Wave SVG */}
          <div className="absolute -top-6 left-0 w-[200%] h-12 animate-wave">
             <svg viewBox="0 0 500 150" preserveAspectRatio="none" className={`w-full h-full ${isDesignatedDriver ? 'fill-acid-blue' : (percentage >= 80 ? 'fill-acid-pink' : 'fill-acid-lime')}`}>
                <path d="M0.00,49.98 C150.00,150.00 349.20,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"></path>
             </svg>
          </div>
        </div>

        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none mix-blend-exclusion">
           <span className={`text-[120px] leading-none font-display font-black text-white ${drinksConsumed > 0 ? 'animate-pop' : ''}`}>
             {isDesignatedDriver ? 'DD' : drinksConsumed}
           </span>
        </div>
        
        {/* Glare/Shine (Hard Edge) */}
        <div className="absolute top-8 left-8 w-16 h-16 rounded-full bg-white opacity-20 blur-sm z-30"></div>
        <div className="absolute top-12 left-20 w-4 h-4 rounded-full bg-white opacity-40 z-30"></div>
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-1">
        <div className="bg-white text-black px-3 py-1 font-bold font-mono text-xs uppercase tracking-widest -rotate-2">
            {isDesignatedDriver ? "SAFETY FIRST" : "CURRENT ROUND"}
        </div>
      </div>
    </div>
  );
};