
import React, { useState, useRef, useEffect } from 'react';
import { MapViewProps } from '../types';
import { Navigation, Search, Camera, ChevronDown, GlassWater, Ghost, UserPlus, LogIn } from 'lucide-react';

declare global {
  interface Window {
    L: any;
  }
}

export const MapView: React.FC<MapViewProps> = ({ friends, onCameraOpen, onSendCheers, onSendInvite, onRequestToJoin, isGhostMode }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const markersRef = useRef<any>({});
  
  const [selectedCity, setSelectedCity] = useState('Dublin');
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

  const cities: Record<string, [number, number]> = {
      'Dublin': [53.3498, -6.2603],
      'London': [51.5074, -0.1278],
      'New York': [40.7128, -74.0060],
      'Berlin': [52.5200, 13.4050]
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    
    // Initialize Leaflet Map
    if (window.L) {
        const L = window.L;
        const dublinCoords = cities['Dublin'];
        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: false,
            center: dublinCoords,
            zoom: 15
        });

        // Add Dark Matter Tiles (CartoDB)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);
        
        mapInstanceRef.current = map;
    }
  }, []);

  // Effect to handle User Marker & Ghost Mode
  useEffect(() => {
      if (!mapInstanceRef.current || !window.L) return;
      const L = window.L;
      const map = mapInstanceRef.current;

      // Remove existing user marker if it exists
      if (userMarkerRef.current) {
          map.removeLayer(userMarkerRef.current);
      }

      // Create User Marker Icon
      // If Ghost Mode is active: reduced opacity, gray color, no pulse
      const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `<div class="relative flex items-center justify-center transition-all duration-500">
                  <div class="w-6 h-6 ${isGhostMode ? 'bg-gray-500 opacity-50' : 'bg-acid-lime opacity-100'} border-4 border-black rounded-full shadow-[0_0_0_4px_#333] z-20"></div>
                  ${!isGhostMode ? '<div class="absolute -inset-10 border border-acid-lime rounded-full opacity-30 animate-ping z-10"></div>' : ''}
                 </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
      });
      
      const userMarker = L.marker([53.348, -6.261], { icon: userIcon }).addTo(map);
      userMarkerRef.current = userMarker;

  }, [isGhostMode]); // Re-run when ghost mode changes

  // Update Markers when friends change
  useEffect(() => {
      if (!mapInstanceRef.current || !window.L) return;
      const L = window.L;
      const map = mapInstanceRef.current;

      // Clear existing markers (naive approach, but fine for demo)
      // Ideally we would update existing ones, but for now we re-render friend markers
      Object.values(markersRef.current).forEach((marker: any) => map.removeLayer(marker));
      markersRef.current = {};

      friends.forEach((friend) => {
            if (friend.status === 'offline') return;
            
            // Create HTML string for the marker
            const isDD = friend.isDD;
            const borderColor = isDD ? 'border-acid-blue' : 'border-acid-lime';
            
            // Fixed: Added text-black to ensure text is visible on white background
            // Added shadow for sticker effect
            const markerHtml = `
                <div class="relative flex flex-col items-center group transform transition-transform duration-300 hover:scale-110">
                    <!-- Avatar Frame -->
                    <div class="w-14 h-14 bg-black border-4 ${borderColor} rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                        <img src="${friend.avatar}" class="w-full h-full object-cover grayscale" style="filter: grayscale(100%);" />
                    </div>
                    <!-- Badge (Drink Label) -->
                    ${!isDD && friend.drink ? `
                        <div class="absolute -bottom-3 -right-4 bg-white border-2 border-black px-2 py-0.5 text-black text-[10px] font-bold uppercase transform -rotate-6 whitespace-nowrap z-20 shadow-[2px_2px_0px_0px_#000]" style="font-family: 'Space Grotesk', sans-serif;">
                            ${friend.drink}
                        </div>
                    ` : ''}
                </div>
            `;

            const icon = L.divIcon({
                className: 'custom-friend-marker',
                html: markerHtml,
                iconSize: [56, 56],
                iconAnchor: [28, 28]
            });

            const marker = L.marker([friend.lat, friend.lng], { icon: icon }).addTo(map);
            
            // Handle Click
            marker.on('click', () => {
                setSelectedFriendId(friend.id);
                // Center map on friend
                map.flyTo([friend.lat, friend.lng], 16, { animate: true, duration: 0.8 });
            });
            
            markersRef.current[friend.id] = marker;
      });

  }, [friends]);

  // Handle City Change
  useEffect(() => {
      if (mapInstanceRef.current && cities[selectedCity]) {
          mapInstanceRef.current.setView(cities[selectedCity], 14);
      }
  }, [selectedCity]);

  // Handle Friend Selection Popup
  const selectedFriend = friends.find(f => f.id === selectedFriendId);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      
      {/* Ghost Mode Overlay Indicator */}
      {isGhostMode && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[100] border-[16px] border-gray-500/20 box-border animate-pulse">
               <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-500 text-gray-300 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2">
                   <Ghost size={12} /> GHOST MODE ACTIVE
               </div>
          </div>
      )}

      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex items-center gap-2 pointer-events-none">
        <div className="flex-1 bg-black border-2 border-white rounded-xl flex items-center px-4 py-3 shadow-[4px_4px_0px_0px_#333] pointer-events-auto">
            <Search className="text-white w-5 h-5 mr-3" />
            <input 
                type="text" 
                placeholder="FIND SQUAD..." 
                className="bg-transparent text-white w-full focus:outline-none placeholder:text-gray-500 font-display font-bold uppercase tracking-wide" 
            />
        </div>
        
        <div className="relative pointer-events-auto">
            <button 
                onClick={() => setShowCityMenu(!showCityMenu)}
                className="h-[52px] px-4 bg-acid-lime border-2 border-black rounded-xl flex items-center gap-2 text-black active:translate-y-1 transition-transform"
            >
                <span className="font-display font-black uppercase">{selectedCity.substring(0,3)}</span>
                <ChevronDown size={16} strokeWidth={3} />
            </button>
            
            {showCityMenu && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_#ccff00]">
                    {Object.keys(cities).map(city => (
                        <button 
                            key={city}
                            onClick={() => { setSelectedCity(city); setShowCityMenu(false); }}
                            className="w-full text-left px-4 py-3 font-bold uppercase hover:bg-black hover:text-acid-lime transition-colors"
                        >
                            {city}
                        </button>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* LEAFLET MAP CONTAINER */}
      <div ref={mapContainerRef} className="w-full h-full z-0" style={{background: '#050505'}}></div>

      {/* FRIEND POPUP OVERLAY (Custom UI instead of Leaflet Popup) */}
      {selectedFriend && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-32 z-[500] pointer-events-auto">
               <div className="bg-white border-4 border-black px-4 py-3 shadow-[8px_8px_0px_0px_#000] w-max animate-pop flex flex-col items-center min-w-[200px]">
                    <span className="block text-black font-display font-black text-2xl uppercase leading-none mb-3">{selectedFriend.name}</span>
                    
                    {/* Action Buttons Grid */}
                    <div className="flex flex-col gap-2 w-full mb-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onSendCheers(selectedFriend.name); setSelectedFriendId(null); }}
                            className="px-4 py-2 bg-acid-pink text-white font-bold text-xs uppercase border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                            <GlassWater size={14} /> SEND CHEERS
                        </button>
                        
                        {onSendInvite && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onSendInvite(selectedFriend.name); setSelectedFriendId(null); }}
                                className="px-4 py-2 bg-acid-lime text-black font-bold text-xs uppercase border-2 border-black hover:bg-black hover:text-acid-lime transition-colors flex items-center justify-center gap-2"
                            >
                                <UserPlus size={14} /> SEND INVITE
                            </button>
                        )}
                        
                        {onRequestToJoin && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onRequestToJoin(selectedFriend.name); setSelectedFriendId(null); }}
                                className="px-4 py-2 bg-acid-blue text-black font-bold text-xs uppercase border-2 border-black hover:bg-black hover:text-acid-blue transition-colors flex items-center justify-center gap-2"
                            >
                                <LogIn size={14} /> REQUEST TO JOIN
                            </button>
                        )}
                    </div>
                    
                    <button onClick={() => setSelectedFriendId(null)} className="mt-1 text-[10px] uppercase font-bold text-gray-400 hover:text-black">Close</button>
                </div>
          </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-24 right-4 flex flex-col gap-3 z-[400] pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-3">
             <button onClick={onCameraOpen} className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              <Camera size={24} strokeWidth={2} />
            </button>
             <button onClick={() => { if(mapInstanceRef.current) mapInstanceRef.current.flyTo(cities['Dublin'], 15); }} className="w-12 h-12 bg-acid-lime border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0px_0px_#000] mt-4 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              <Navigation size={24} />
            </button>
        </div>
      </div>
      
      {/* Bottom Info */}
      <div className="absolute bottom-24 left-4 right-4 z-[400] pointer-events-none">
        <div className="bg-black/90 backdrop-blur border-2 border-white/20 p-4 flex items-center justify-between pointer-events-auto shadow-[4px_4px_0px_0px_#333]">
            <div>
                <h3 className="text-xl font-display font-black text-white uppercase">{selectedCity}</h3>
                <p className="text-xs font-mono text-acid-lime uppercase tracking-widest">{friends.filter(f => f.status === 'active').length} Active nearby</p>
            </div>
            <div className="flex -space-x-3">
                {friends.slice(0,3).map(f => (
                  <div key={f.id} className="w-10 h-10 border-2 border-black rounded-full overflow-hidden bg-gray-800">
                      <img src={f.avatar} className="w-full h-full object-cover" alt={f.name}/>
                  </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
