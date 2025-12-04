import { DrinkType, Friend } from './types';

export const DRINK_TYPES: DrinkType[] = [
  { id: 'beer', name: 'Beer', icon: '🍺', alcoholContent: 'low' },
  { id: 'wine', name: 'Wine', icon: '🍷', alcoholContent: 'medium' },
  { id: 'cocktail', name: 'Cocktail', icon: '🍸', alcoholContent: 'high' },
  { id: 'whiskey', name: 'Whiskey', icon: '🥃', alcoholContent: 'high' },
  { id: 'vodka', name: 'Vodka', icon: '🧊', alcoholContent: 'high' },
  { id: 'tequila', name: 'Tequila', icon: '🌵', alcoholContent: 'high' },
  { id: 'rum', name: 'Rum', icon: '🏴‍☠️', alcoholContent: 'high' },
  { id: 'champagne', name: 'Bubbly', icon: '🥂', alcoholContent: 'medium' },
  { id: 'sake', name: 'Sake', icon: '🍶', alcoholContent: 'medium' },
  { id: 'seltzer', name: 'Seltzer', icon: '🫧', alcoholContent: 'low' },
  { id: 'water', name: 'Water', icon: '💧', alcoholContent: 'low' },
  { id: 'soda', name: 'Soda', icon: '🥤', alcoholContent: 'low' },
];

// Real coordinates in Dublin, Ireland
export const MOCK_FRIENDS: Friend[] = [
  { id: '1', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', status: 'active', drink: 'Cocktail', lastActive: '2m ago', distance: '15 ft', lat: 53.3448, lng: -6.2595 }, // Temple Bar
  { id: '2', name: 'Mike', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150', status: 'active', drink: 'Beer', lastActive: '5m ago', distance: '120 ft', isDD: true, lat: 53.3418, lng: -6.2650 }, // Grafton St
  { id: '3', name: 'Jessica', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', status: 'home', lastActive: '1h ago', distance: '2.5 mi', lat: 53.3382, lng: -6.2591 }, // St Stephens
  { id: '4', name: 'David', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', status: 'active', drink: 'Whiskey', lastActive: 'Now', distance: '40 ft', lat: 53.3468, lng: -6.2625 }, // O'Connell Bridge
  { id: '5', name: 'Alex', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', status: 'offline', lastActive: '3h ago', distance: 'Unknown', lat: 53.3498, lng: -6.2603 }, // Parnell St
];

export const QUOTES = [
  "Stay hydrated between rounds.",
  "Look out for your friends.",
  "Designated Drivers are MVPs.",
  "Don't leave a drink unattended."
];