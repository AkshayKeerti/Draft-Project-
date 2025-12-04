
export interface DrinkType {
  id: string;
  name: string;
  icon: string;
  alcoholContent: 'low' | 'medium' | 'high';
}

export interface Friend {
  id: string;
  name: string;
  avatar: string; // URL
  status: 'active' | 'home' | 'offline';
  drink?: string;
  lastActive: string;
  distance: string; // e.g., "0.2 mi"
  isDD?: boolean;
  lat: number; // Relative coordinate for map (0-100)
  lng: number; // Relative coordinate for map (0-100)
}

export interface SessionData {
  isActive: boolean;
  startTime: number | null;
  drinksConsumed: number;
  currentDrink: DrinkType | null;
  isDesignatedDriver: boolean;
  history: Array<{ timestamp: number; drinkId: string }>;
  photos: PhotoMoment[];
}

export interface PhotoMoment {
  id: string;
  url: string;
  timestamp: number;
  sender: string;
  location?: string;
}

export enum AppTab {
  MAP = 'MAP',
  SESSION = 'SESSION',
  HISTORY = 'HISTORY',
  PROFILE = 'PROFILE'
}

export interface SafetyStatus {
  isSafe: boolean;
  mode: 'party' | 'going_home' | 'safe';
}

export interface MapViewProps {
  friends: Friend[];
  onCameraOpen: () => void;
  onSendCheers: (friendName: string) => void;
  isGhostMode: boolean;
}

export interface HistoryViewProps {
  photos: PhotoMoment[];
}

export interface FriendsListViewProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
}
