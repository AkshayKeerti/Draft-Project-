
import React, { useState, useEffect } from 'react';
import { 
  GlassWater, 
  Map as MapIcon, 
  History, 
  UserCircle, 
  Plus, 
  ShieldCheck, 
  Home, 
  Car,
  X,
  Beer,
  Camera,
  Zap,
  ArrowRight,
  Ghost,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { LiquidAvatar } from './components/LiquidAvatar';
import { MapView } from './components/MapView';
import { HistoryView } from './components/HistoryView';
import { CameraView } from './components/CameraView';
import { FriendsListView } from './components/FriendsListView';
import { RecapStoryView } from './components/RecapStoryView';
import { AppTab, SessionData, SafetyStatus, Friend } from './types';
import { DRINK_TYPES, MOCK_FRIENDS } from './constants';

interface NotificationToast {
  message: string;
  type: 'social' | 'safety' | 'default';
  id: number;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SESSION);
  const [showDrinkSelector, setShowDrinkSelector] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  
  // Ghost Mode State
  const [isGhostMode, setIsGhostMode] = useState(false);
  
  // Dynamic Friends State for Live Updates
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  
  // Track incoming invites/requests (sent TO me)
  const [incomingInvites, setIncomingInvites] = useState<Record<string, 'invite' | 'join'>>({});
  
  // Track outgoing invites/requests (sent BY me)
  const [outgoingInvites, setOutgoingInvites] = useState<Record<string, 'invite' | 'join'>>({});
  
  const [toast, setToast] = useState<NotificationToast | null>(null);
  
  // Session State
  const [session, setSession] = useState<SessionData>({
    isActive: false,
    startTime: null,
    drinksConsumed: 0,
    currentDrink: null,
    isDesignatedDriver: false,
    history: [],
    photos: []
  });

  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>({
    isSafe: false,
    mode: 'party'
  });

  // Handle Toast Timer
  useEffect(() => {
    if (toast) {
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }
  }, [toast]);

  // SIMULATION ENGINE: Simulate friend updates
  useEffect(() => {
    const interval = setInterval(() => {
      // 20% chance to trigger an event every 8 seconds
      if (Math.random() > 0.8) {
        updateRandomFriendStatus();
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [friends]);

  // SIMULATION: Randomly receive invites/requests from friends
  useEffect(() => {
    const interval = setInterval(() => {
      // 10% chance every 15 seconds to receive an invite/request
      if (Math.random() > 0.9 && friends.length > 0) {
        const randomFriend = friends[Math.floor(Math.random() * friends.length)];
        if (randomFriend.status === 'active' && !incomingInvites[randomFriend.id] && !outgoingInvites[randomFriend.id]) {
          const type = Math.random() > 0.5 ? 'invite' : 'join';
          setIncomingInvites(prev => ({ ...prev, [randomFriend.id]: type }));
          setToast({ 
            message: type === 'invite' 
              ? `📨 ${randomFriend.name.toUpperCase()} SENT YOU AN INVITE!` 
              : `🚪 ${randomFriend.name.toUpperCase()} WANTS YOU TO JOIN!`,
            type: 'social',
            id: Date.now()
          });
        }
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [friends, incomingInvites, outgoingInvites]);

  const showNotification = (message: string, type: 'social' | 'safety' | 'default' = 'default') => {
      setToast({ message, type, id: Date.now() });
  };

  const updateRandomFriendStatus = () => {
      const friendIndex = Math.floor(Math.random() * friends.length);
      const friend = friends[friendIndex];
      const updatedFriends = [...friends];
      
      let newStatus: 'active' | 'home' | 'offline' = 'active';
      let message = '';
      let type: 'social' | 'safety' | 'default' = 'default';

      // Logic to cycle statuses logically
      if (friend.status === 'active') {
          // If active, they might go home
          newStatus = 'home';
          message = `${friend.name.toUpperCase()} MADE IT HOME SAFE 🏠`;
          type = 'safety';
      } else if (friend.status === 'home') {
          // If home, they might go offline
          newStatus = 'offline';
          message = `${friend.name.toUpperCase()} WENT OFFLINE 💤`;
          type = 'default';
      } else {
          // If offline, they might come out
          newStatus = 'active';
          message = `${friend.name.toUpperCase()} JOINED THE ROUND 🍻`;
          type = 'social';
      }

      updatedFriends[friendIndex] = { ...friend, status: newStatus };
      setFriends(updatedFriends);
      showNotification(message, type);
  };

  const startSession = () => {
    setSession(prev => ({
      ...prev,
      isActive: true,
      startTime: Date.now(),
      drinksConsumed: 0
    }));
    showNotification("SESSION STARTED! LET'S GO ⚡", 'social');
  };

  const addDrink = (drinkId: string) => {
    const drink = DRINK_TYPES.find(d => d.id === drinkId) || null;
    setSession(prev => ({
      ...prev,
      drinksConsumed: prev.drinksConsumed + 1,
      currentDrink: drink,
      history: [...prev.history, { timestamp: Date.now(), drinkId }]
    }));
    setShowDrinkSelector(false);
  };

  const toggleDDMode = () => {
    setSession(prev => ({
      ...prev,
      isDesignatedDriver: !prev.isDesignatedDriver,
      drinksConsumed: 0 
    }));
  };

  const toggleGhostMode = () => {
      setIsGhostMode(!isGhostMode);
      if (!isGhostMode) {
          showNotification("👻 GHOST MODE ENABLED: YOU ARE INVISIBLE", 'default');
      } else {
          showNotification("📡 GHOST MODE DISABLED: VISIBLE TO SQUAD", 'social');
      }
  };

  const triggerGoingHome = () => {
    setSafetyStatus({ isSafe: false, mode: 'going_home' });
    setSession(prev => ({ ...prev, isActive: false }));
    setShowSafetyModal(false);
    showNotification("LOCATION SHARING ENABLED FOR TRIP HOME 📍", 'safety');
  };

  const markHomeSafe = () => {
    setSafetyStatus({ isSafe: true, mode: 'safe' });
    showNotification("FRIENDS NOTIFIED: YOU ARE SAFE ✅", 'safety');
    setTimeout(() => {
        setSafetyStatus({ isSafe: false, mode: 'party' });
        setSession({
            isActive: false,
            startTime: null,
            drinksConsumed: 0,
            currentDrink: null,
            isDesignatedDriver: false,
            history: [],
            photos: session.photos
        });
    }, 3000);
  };
  
  const handlePhotoCapture = (url: string) => {
      setShowCamera(false);
      showNotification("📸 SNAP SENT!", 'social');
      setSession(prev => ({
          ...prev,
          photos: [...prev.photos, { id: Date.now().toString(), url, timestamp: Date.now(), sender: 'You', location: 'Dublin' }]
      }));
  };

  const handleCheers = (friendName: string) => {
      showNotification(`🍻 CLINKED WITH ${friendName.toUpperCase()}!`, 'social');
  };

  const handleSendInvite = (friendId: string, friendName: string) => {
      // Mark that I sent an invite to this friend
      setOutgoingInvites(prev => ({ ...prev, [friendId]: 'invite' }));
      showNotification(`📨 INVITE SENT TO ${friendName.toUpperCase()}!`, 'social');
  };

  const handleRequestToJoin = (friendId: string, friendName: string) => {
      // Mark that I sent a join request to this friend
      setOutgoingInvites(prev => ({ ...prev, [friendId]: 'join' }));
      showNotification(`🚪 JOIN REQUEST SENT TO ${friendName.toUpperCase()}'S SESSION!`, 'social');
      
      // Simulate acceptance after 3-5 seconds
      setTimeout(() => {
          const randomDelay = 3000 + Math.random() * 2000; // 3-5 seconds
          setTimeout(() => {
              showNotification(`✅ ${friendName.toUpperCase()} ACCEPTED YOUR JOIN REQUEST! 🎉`, 'social');
              // Remove from outgoing since it's been accepted
              setOutgoingInvites(prev => {
                  const updated = { ...prev };
                  delete updated[friendId];
                  return updated;
              });
          }, randomDelay);
      }, 100);
  };

  const handleAcceptInvite = (friendId: string, friendName: string, type: 'invite' | 'join') => {
      // Remove from incoming invites
      setIncomingInvites(prev => {
          const updated = { ...prev };
          delete updated[friendId];
          return updated;
      });
      showNotification(`✅ ACCEPTED ${type === 'invite' ? 'INVITE' : 'JOIN REQUEST'} FROM ${friendName.toUpperCase()}!`, 'social');
  };

  const handleIgnoreInvite = (friendId: string, friendName: string) => {
      // Remove from incoming invites
      setIncomingInvites(prev => {
          const updated = { ...prev };
          delete updated[friendId];
          return updated;
      });
      showNotification(`❌ IGNORED REQUEST FROM ${friendName.toUpperCase()}`, 'default');
  };

  const handleNavigateToFriend = (friendId: string, lat: number, lng: number) => {
      const friend = friends.find(f => f.id === friendId);
      if (friend) {
          showNotification(`🗺️ NAVIGATING TO ${friend.name.toUpperCase()}'S LOCATION...`, 'default');
          // In a real app, this would open maps app or navigation
          // For now, we'll just show a notification
      }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case AppTab.MAP:
        return <MapView 
                  friends={friends} 
                  onCameraOpen={() => setShowCamera(true)} 
                  onSendCheers={handleCheers}
                  onSendInvite={handleSendInvite}
                  onRequestToJoin={handleRequestToJoin}
                  onAcceptInvite={handleAcceptInvite}
                  onIgnoreInvite={handleIgnoreInvite}
                  onNavigateToFriend={handleNavigateToFriend}
                  incomingInvites={incomingInvites}
                  outgoingInvites={outgoingInvites}
                  isGhostMode={isGhostMode}
               />;
      case AppTab.HISTORY:
        return <HistoryView photos={session.photos} onOpenRecap={() => setShowRecap(true)} />;
      case AppTab.PROFILE:
        return (
            <div className="flex flex-col h-full p-6 bg-[#050505]">
                <div className="mt-10 mb-8 border-b-2 border-white/10 pb-8">
                    <div className="w-24 h-24 rounded-2xl bg-acid-lime border-4 border-white mb-4 overflow-hidden relative">
                         <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200" alt="Profile" className="w-full h-full object-cover mix-blend-multiply opacity-80"/>
                    </div>
                    <h2 className="text-5xl font-display font-black text-white leading-none mb-2">ALEX<br/>DOE</h2>
                    <div className="inline-block px-3 py-1 bg-white text-black font-bold text-xs uppercase tracking-widest">
                        Lvl 12 • Night Owl
                    </div>
                </div>
                
                <div className="space-y-4">
                    <button 
                        onClick={() => setShowFriendsList(true)}
                        className="w-full p-6 bg-night-900 border border-white/10 rounded-xl flex justify-between items-center group hover:bg-night-800 hover:border-acid-lime transition-all"
                    >
                        <span className="font-display font-bold text-xl uppercase">Friends List</span>
                        <div className="flex items-center gap-2">
                             <span className="text-xs bg-acid-lime text-black px-2 py-1 rounded font-bold">12 ON</span>
                             <ArrowRight className="group-hover:translate-x-2 transition-transform text-acid-lime" />
                        </div>
                    </button>

                    {/* Ghost Mode Toggle */}
                    <button 
                        onClick={toggleGhostMode}
                        className={`w-full p-6 border rounded-xl flex justify-between items-center group transition-all ${isGhostMode ? 'bg-white border-white' : 'bg-night-900 border-white/10 hover:border-white'}`}
                    >
                        <div className="flex items-center gap-4">
                            <Ghost size={24} className={isGhostMode ? 'text-black' : 'text-gray-400'} />
                            <div className="text-left">
                                <span className={`font-display font-bold text-xl uppercase block ${isGhostMode ? 'text-black' : 'text-white'}`}>Ghost Mode</span>
                                <span className={`font-mono text-[10px] uppercase tracking-widest ${isGhostMode ? 'text-gray-800' : 'text-gray-500'}`}>
                                    {isGhostMode ? 'Location Hidden' : 'Location Visible'}
                                </span>
                            </div>
                        </div>
                        {isGhostMode ? (
                            <ToggleRight size={32} className="text-black fill-current" />
                        ) : (
                            <ToggleLeft size={32} className="text-gray-600" />
                        )}
                    </button>

                    <button className="w-full p-6 bg-night-900 border border-white/10 rounded-xl flex justify-between items-center group hover:bg-night-800 hover:border-acid-lime transition-all">
                        <span className="font-display font-bold text-xl uppercase">Settings</span>
                        <ArrowRight className="group-hover:translate-x-2 transition-transform text-acid-lime" />
                    </button>
                </div>
            </div>
        );
      case AppTab.SESSION:
      default:
        return renderSessionView();
    }
  };

  const renderSessionView = () => {
    if (safetyStatus.mode === 'going_home') {
        return (
            <div className="flex flex-col items-center justify-center h-full px-6 bg-night-950 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-acid-violet/20 via-transparent to-transparent animate-pulse-slow"></div>

                <div className="w-40 h-40 bg-acid-violet rounded-full flex items-center justify-center mb-8 border-4 border-white animate-bounce">
                    <Home size={60} className="text-black" strokeWidth={2.5} />
                </div>
                <h2 className="text-5xl font-display font-black text-white mb-4 text-center leading-none">HEADING<br/>HOME</h2>
                <div className="bg-acid-violet/10 border border-acid-violet text-acid-violet px-4 py-2 rounded-lg mb-12 font-bold uppercase tracking-widest text-xs">
                    Location Shared
                </div>
                <button 
                    onClick={markHomeSafe}
                    className="w-full py-6 bg-white hover:bg-acid-lime rounded-xl text-black font-display font-black text-2xl tracking-tight transition-all transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#ffffff50]"
                >
                    I'M SAFE
                </button>
            </div>
        );
    }

    if (safetyStatus.mode === 'safe') {
        return (
            <div className="flex flex-col items-center justify-center h-full px-6 bg-acid-lime text-black relative">
                <ShieldCheck size={100} className="text-black mb-6" strokeWidth={1.5} />
                <h2 className="text-6xl font-display font-black text-black mb-2 text-center leading-none tracking-tighter">SAFE &<br/>SOUND</h2>
                <p className="text-black font-bold uppercase tracking-widest border-2 border-black px-4 py-1 rounded-full mt-4">Notifications Sent</p>
            </div>
        );
    }

    if (!session.isActive) {
        return (
            <div className="flex flex-col h-full p-6 relative overflow-hidden bg-[#050505]">
                {/* Marquee Background */}
                <div className="absolute top-20 -left-10 -right-10 opacity-10 rotate-[-5deg] pointer-events-none">
                    <div className="whitespace-nowrap font-display font-black text-8xl text-transparent stroke-white animate-marquee">
                        DRAFT DRAFT DRAFT DRAFT DRAFT DRAFT
                    </div>
                </div>

                <div className="absolute top-6 right-6 z-20">
                     <button 
                        onClick={() => setShowCamera(true)}
                        className="w-14 h-14 rounded-2xl bg-night-900 border-2 border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all active:scale-95"
                    >
                        <Camera size={24} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center z-10">
                    <div className="mb-12 relative flex justify-center w-full">
                        {/* RECREATED GOTHIC "DRAFT" LOGO WITH CSS */}
                        <h1 className="text-[120px] md:text-[160px] leading-none text-acid-lime font-gothic tracking-tight relative z-10 select-none animate-float" style={{
                            textShadow: `
                                4px 4px 0px #000, 
                                8px 8px 0px #1e1e1e, 
                                12px 12px 0px rgba(255,255,255,0.1)
                            `
                        }}>
                          draft
                        </h1>
                        
                        {/* Decorative Graphic Behind Logo */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[8px] border-acid-pink rounded-full blur-xl opacity-30 z-0 animate-pulse-slow"></div>
                    </div>
                    
                    <button 
                        onClick={startSession}
                        className="group relative w-full max-w-xs h-24"
                    >
                        <div className="absolute inset-0 bg-acid-lime rounded-xl transform translate-x-2 translate-y-2 group-active:translate-x-0 group-active:translate-y-0 transition-transform"></div>
                        <div className="absolute inset-0 bg-white rounded-xl border-2 border-black flex items-center justify-between px-8 group-active:translate-x-1 group-active:translate-y-1 transition-transform">
                             <span className="text-3xl font-display font-black text-black uppercase tracking-tighter">Start<br/>Night</span>
                             <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-acid-lime group-hover:scale-110 transition-transform">
                                <Beer size={24} fill="currentColor" />
                             </div>
                        </div>
                    </button>
                    
                    <p className="mt-8 text-gray-500 font-mono text-xs uppercase tracking-[0.2em] text-center">
                        Connect • Consume • Safe
                    </p>
                </div>
            </div>
        );
    }

    return (
      <div className="flex flex-col h-full bg-[#050505] overflow-hidden">
        {/* Ticker Tape */}
        <div className="bg-acid-lime h-8 overflow-hidden flex items-center border-b border-black">
             <div className="whitespace-nowrap flex animate-marquee">
                 {[...Array(10)].map((_,i) => (
                     <span key={i} className="text-black font-bold uppercase text-xs mx-4 tracking-widest flex items-center gap-2">
                         <span className="w-2 h-2 bg-black rounded-full"></span> Live Session Active
                     </span>
                 ))}
             </div>
        </div>

        {/* Top Controls */}
        <div className="px-6 pt-6 flex justify-between items-start z-10">
            <div className="bg-night-900 border border-white/20 px-4 py-2 rounded-lg">
                <span className="block text-[10px] text-gray-400 font-mono uppercase">Status</span>
                <span className="text-sm font-bold text-acid-lime uppercase tracking-wide flex items-center gap-2">
                    <div className="w-2 h-2 bg-acid-lime rounded-full animate-pulse"></div> Online
                </span>
            </div>
            <div className="flex gap-2">
                 <button onClick={() => setShowCamera(true)} className="w-12 h-12 bg-white rounded-lg border-2 border-transparent hover:border-acid-pink text-black flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(255,0,255,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                    <Camera size={20} strokeWidth={3} />
                </button>
                <button 
                    onClick={() => setShowSafetyModal(true)}
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${session.isDesignatedDriver ? 'bg-acid-blue border-white text-black' : 'bg-night-900 border-white/20 text-white'}`}
                >
                    <ShieldCheck size={20} strokeWidth={3} />
                </button>
            </div>
        </div>

        {/* Liquid Avatar */}
        <div className="flex-1 flex flex-col items-center justify-center z-10 -mt-10">
            <LiquidAvatar 
                session={session} 
                onClick={() => !session.isDesignatedDriver && setShowDrinkSelector(true)} 
            />
        </div>

        {/* Bottom Actions */}
        <div className="px-6 pb-28 w-full z-10">
             {session.isDesignatedDriver ? (
                 <div className="w-full py-5 bg-acid-blue text-black border-2 border-white rounded-xl flex items-center justify-center gap-3 font-bold font-display text-xl uppercase tracking-wider shadow-[4px_4px_0px_0px_#ffffff]">
                     <Car size={28} strokeWidth={2.5} />
                     DD Mode
                 </div>
             ) : (
                <button 
                    onClick={() => setShowDrinkSelector(true)}
                    className="w-full py-5 bg-night-900 border-2 border-acid-lime text-acid-lime rounded-xl flex items-center justify-center gap-3 hover:bg-acid-lime hover:text-black transition-all active:scale-[0.98] font-display font-black text-2xl uppercase tracking-tighter"
                >
                    <Plus size={28} strokeWidth={4} />
                    Add Drink
                </button>
             )}
            
            <button 
                onClick={triggerGoingHome}
                className="w-full mt-4 text-gray-500 font-mono text-xs uppercase tracking-widest hover:text-white transition-colors py-2"
            >
                End Session / Go Home
            </button>
        </div>
      </div>
    );
  };
  
  const getToastColor = (type: string) => {
      switch(type) {
          case 'social': return 'bg-acid-pink/90 text-white border-acid-pink/50';
          case 'safety': return 'bg-acid-blue/90 text-black border-acid-blue/50';
          default: return 'bg-white/90 text-black border-black/30';
      }
  };

  return (
    <div className="fixed inset-0 bg-[#050505] text-white font-body overflow-hidden selection:bg-acid-lime selection:text-black">
      {/* Toast Notification (Subtle Top Center) */}
      {toast && (
          <div key={toast.id} className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] w-auto max-w-[85vw] pointer-events-none animate-pop">
              <div className={`${getToastColor(toast.type)} border-2 px-4 py-2.5 shadow-lg backdrop-blur-sm flex items-center gap-2 rounded-lg`}>
                   {toast.type === 'safety' && <ShieldCheck size={18} />}
                   {toast.type === 'social' && <Zap size={18} />}
                  <span className="text-sm font-display font-bold uppercase tracking-wide whitespace-normal text-center leading-tight">{toast.message}</span>
              </div>
          </div>
      )}

      <main className="h-full w-full pb-0 relative">
        {renderTabContent()}
      </main>

      {/* Camera Overlay */}
      {showCamera && (
          <CameraView onClose={() => setShowCamera(false)} onCapture={handlePhotoCapture} />
      )}
      
      {/* Friends List Overlay */}
      {showFriendsList && (
          <FriendsListView 
             isOpen={showFriendsList}
             onClose={() => setShowFriendsList(false)}
             friends={friends}
          />
      )}
      
      {/* Morning After Recap Story */}
      {showRecap && (
          <RecapStoryView 
             session={session}
             onClose={() => setShowRecap(false)}
          />
      )}

      {/* Drink Selector (Grid Style) */}
      {showDrinkSelector && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl p-6 flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-4xl font-display font-black text-white italic">SELECT<br/><span className="text-acid-lime">POISON</span></h2>
                <button onClick={() => setShowDrinkSelector(false)} className="p-2 bg-white rounded text-black hover:bg-acid-lime transition-colors">
                    <X size={28} strokeWidth={3} />
                </button>
            </div>
            <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-10 no-scrollbar">
                {DRINK_TYPES.map((drink, idx) => (
                    <button 
                        key={drink.id}
                        onClick={() => addDrink(drink.id)}
                        className="aspect-[4/3] bg-night-900 border border-white/20 hover:border-acid-lime hover:bg-night-800 transition-all active:scale-95 group flex flex-col justify-between p-4"
                    >
                        <span className="text-4xl self-end group-hover:scale-125 transition-transform duration-300 group-hover:rotate-12">{drink.icon}</span>
                        <span className="text-xl font-display font-bold text-white uppercase leading-none text-left">{drink.name}</span>
                    </button>
                ))}
            </div>
        </div>
      )}

      {/* Safety Modal (Warning Label Style) */}
      {showSafetyModal && (
          <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-6 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-sm border-4 border-acid-pink p-0 shadow-[8px_8px_0px_0px_#ff00ff] animate-in zoom-in-95 duration-200">
                  <div className="bg-acid-pink p-4 flex justify-between items-center">
                    <h3 className="text-xl font-display font-black text-white uppercase tracking-wider">Safety Control</h3>
                    <button onClick={() => setShowSafetyModal(false)}><X size={24} className="text-white hover:rotate-90 transition-transform"/></button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-100 border-2 border-black">
                          <div className="text-left">
                              <p className="text-black font-bold font-display uppercase text-lg">DD Mode</p>
                              <p className="text-xs text-gray-500 font-mono">Staying sober tonight</p>
                          </div>
                          <button 
                            onClick={toggleDDMode}
                            className={`w-12 h-12 border-2 border-black flex items-center justify-center transition-colors ${session.isDesignatedDriver ? 'bg-acid-blue' : 'bg-white'}`}
                          >
                              {session.isDesignatedDriver && <ShieldCheck size={24} className="text-black"/>}
                          </button>
                      </div>

                      <button 
                        onClick={triggerGoingHome}
                        className="w-full p-4 bg-black border-2 border-black flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors group"
                      >
                          <Home size={24} className="text-acid-lime group-hover:animate-bounce" />
                          <span className="text-white font-display font-bold uppercase text-xl">Go Home Now</span>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Floating Dock Navigation */}
      {safetyStatus.mode !== 'going_home' && (
        <nav className="absolute bottom-6 left-6 right-6 h-20 bg-black border-2 border-white/20 rounded-2xl flex justify-between items-center px-2 shadow-2xl z-40">
            <button 
                onClick={() => setActiveTab(AppTab.MAP)}
                className={`flex-1 h-14 rounded-xl flex items-center justify-center transition-all ${activeTab === AppTab.MAP ? 'bg-white text-black translate-y-[-4px] shadow-[4px_4px_0px_0px_#ccff00]' : 'text-gray-500 hover:text-white'}`}
            >
                <MapIcon size={24} strokeWidth={activeTab === AppTab.MAP ? 3 : 2} />
            </button>
            
            <button 
                onClick={() => setActiveTab(AppTab.SESSION)}
                className={`flex-1 h-14 mx-2 rounded-xl flex items-center justify-center transition-all ${activeTab === AppTab.SESSION ? 'bg-acid-lime text-black translate-y-[-4px] shadow-[4px_4px_0px_0px_#ffffff]' : 'text-gray-500 hover:text-white'}`}
            >
                <GlassWater size={28} fill={activeTab === AppTab.SESSION ? "currentColor" : "none"} strokeWidth={3} />
            </button>

            <button 
                onClick={() => setActiveTab(AppTab.HISTORY)}
                className={`flex-1 h-14 rounded-xl flex items-center justify-center transition-all ${activeTab === AppTab.HISTORY ? 'bg-white text-black translate-y-[-4px] shadow-[4px_4px_0px_0px_#ccff00]' : 'text-gray-500 hover:text-white'}`}
            >
                <History size={24} strokeWidth={activeTab === AppTab.HISTORY ? 3 : 2} />
            </button>

             <button 
                onClick={() => setActiveTab(AppTab.PROFILE)}
                className={`flex-1 h-14 rounded-xl flex items-center justify-center transition-all ${activeTab === AppTab.PROFILE ? 'bg-white text-black translate-y-[-4px] shadow-[4px_4px_0px_0px_#ccff00]' : 'text-gray-500 hover:text-white'}`}
            >
                <UserCircle size={24} strokeWidth={activeTab === AppTab.PROFILE ? 3 : 2} />
            </button>
        </nav>
      )}
    </div>
  );
};

export default App;
