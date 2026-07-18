import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Wallet, 
  Coins, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  RotateCcw, 
  Search, 
  Filter, 
  Calendar, 
  Heart, 
  Clock,
  Play,
  Pause,
  Shuffle,
  DollarSign,
  User,
  PlusCircle,
  ArrowUpDown,
  History,
  Trash2,
  CheckCircle,
  Award
} from 'lucide-react';
import { ALL_PLAYERS, PLAYER_MAP, MATCH_EVENT_TEMPLATES } from './data';
import { CollectedCard, MatchEvent, Player, Rarity, Position, Nation } from './types';

// Helper to generate standard stats block
const getPositionColor = (pos: Position) => {
  switch (pos) {
    case 'GK': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'DF': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'MF': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'FW': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
  }
};

const getRarityStyles = (rarity: Rarity) => {
  switch (rarity) {
    case 'Common':
      return {
        border: 'border-white/10',
        bg: 'from-slate-900/90 via-slate-800/90 to-slate-950/95',
        glow: 'shadow-slate-500/5',
        text: 'text-slate-350',
        badge: 'bg-slate-800/80 text-slate-300 border-white/10',
        bar: 'bg-slate-500'
      };
    case 'Rare':
      return {
        border: 'border-cyan-500/50',
        bg: 'from-cyan-950/40 via-slate-900/90 to-cyan-950/40',
        glow: 'card-glow-silver',
        text: 'text-cyan-300 font-medium',
        badge: 'bg-cyan-950/80 text-cyan-200 border-cyan-500/30',
        bar: 'bg-cyan-400'
      };
    case 'Epic':
      return {
        border: 'border-purple-500/60',
        bg: 'from-purple-950/40 via-slate-900/90 to-purple-950/40',
        glow: 'card-glow-purple',
        text: 'text-purple-300 font-semibold',
        badge: 'bg-purple-950/80 text-purple-200 border-purple-500/45',
        bar: 'bg-purple-400'
      };
    case 'Legendary':
      return {
        border: 'border-amber-500/60',
        bg: 'from-amber-950/40 via-slate-900/90 to-yellow-950/40',
        glow: 'card-glow-gold',
        text: 'text-amber-300 font-bold tracking-wide',
        badge: 'bg-amber-950/90 text-amber-200 border-amber-400/50',
        bar: 'bg-amber-400'
      };
  }
};

// Deterministic player rating history helper for beautiful line charts
const getPlayerHistory = (playerId: string, currentRating: number) => {
  const charSum = playerId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const points = [];
  const dates = ['06/28', '07/02', '07/05', '07/09', '07/13', 'Today'];
  
  // Create a realistic upward trajectory starting lower than current rating
  let tempRating = currentRating - 5 - (charSum % 4); 
  for (let i = 0; i < 6; i++) {
    if (i === 5) {
      points.push({ date: dates[i], rating: currentRating });
    } else {
      // Deterministic walk up and down
      const change = ((charSum + i) % 3); // 0, 1, or 2
      tempRating += (change === 0 ? -1 : change === 1 ? 1 : 2);
      // Clamp to look professional
      const clamped = Math.max(40, Math.min(99, tempRating));
      points.push({ date: dates[i], rating: clamped });
    }
  }
  return points;
};

// Standard helper to generate high quality male avatars using DiceBear Avataaars
const getMaleAvatarUrl = (name: string) => {
  const maleTops = [
    'bald', 'balded', 'buzzCut', 'classic01', 'classic02', 
    'frizzle', 'shaggy', 'shaggyMullet', 'shortCurly', 
    'shortFlat', 'shortRound', 'shortWaved', 'sides', 'theCaesar'
  ];
  const params = new URLSearchParams();
  params.set('seed', name);
  // Repeat top parameter for each male style option (standard HTTP array query parameter representation)
  maleTops.forEach(top => {
    params.append('top', top);
  });
  return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
};

// Log Entry structure representing real-time trading style entries
export interface LogEntry {
  id: string;
  timestamp: string;
  ticker: string;
  event: string;
  details: string;
  ovr: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

// Helper to generate a unique trading symbol/ticker for a player
const getPlayerSymbol = (name: string): string => {
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const clean = normalized.replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (clean.length <= 4) return clean;
  const parts = name.toUpperCase().split(' ');
  if (parts.length > 1) {
    const lastName = parts[parts.length - 1].replace(/[^a-zA-Z]/g, '');
    return lastName.slice(0, 5);
  }
  return clean.slice(0, 5);
};

export default function App() {
  // Balance management
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('pitchpacks_balance');
    return saved ? parseFloat(saved) : 100.00;
  });

  // Collected Ledger Cards
  const [collection, setCollection] = useState<CollectedCard[]>(() => {
    const saved = localStorage.getItem('pitchpacks_collection');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    // Seed with a few starter cards so dashboard isn't blank
    const starters = [
      { id: 'start-1', playerId: 'es-22', rating: 91, recentEvents: [], obtainedAt: new Date().toISOString(), isFavorite: true }, // Lamine Yamal
      { id: 'start-2', playerId: 'ar-21', rating: 92, recentEvents: [], obtainedAt: new Date().toISOString(), isFavorite: true }, // Lionel Messi
      { id: 'start-3', playerId: 'es-17', rating: 90, recentEvents: [], obtainedAt: new Date().toISOString() }, // Rodri
      { id: 'start-4', playerId: 'ar-2', rating: 88, recentEvents: [], obtainedAt: new Date().toISOString() }   // Emiliano Martínez
    ];
    localStorage.setItem('pitchpacks_collection', JSON.stringify(starters));
    return starters;
  });

  // Current Pack Opening draft
  const [activeDraft, setActiveDraft] = useState<CollectedCard[] | null>(null);
  const [isPackOpening, setIsPackOpening] = useState(false);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState<number>(0);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNation, setFilterNation] = useState<'All' | Nation>('All');
  const [filterRarity, setFilterRarity] = useState<'All' | Rarity>('All');
  const [filterPosition, setFilterPosition] = useState<'All' | Position>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'obtained'>('rating');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Interactive Live simulation logs
  const [globalLogs, setGlobalLogs] = useState<LogEntry[]>(() => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    return [
      {
        id: 'init-1',
        timestamp: time,
        ticker: 'SYS_INIT',
        event: 'LEDGER',
        details: 'Squad Ledger initialized. Ready to pull live assets.',
        ovr: 'SECURE',
        change: 'ONLINE',
        changeType: 'positive'
      },
      {
        id: 'init-2',
        timestamp: time,
        ticker: 'SYS_TIPS',
        event: 'TIPS',
        details: 'Simulate live match events directly from player cards to modify Ratings!',
        ovr: 'FORM',
        change: '+DELTA',
        changeType: 'neutral'
      }
    ];
  });
  
  // Simulation intervals
  const [autoSimulate, setAutoSimulate] = useState(false);

  // Floating point feedback animation
  const [floatingScores, setFloatingScores] = useState<{ id: string; cardId: string; text: string; isPositive: boolean }[]>([]);

  // Live event animations for player cards on the pitch
  const [liveEventAnimations, setLiveEventAnimations] = useState<{ id: string; playerId: string; type: 'Goal' | 'Assist' | 'Corner' | 'Yellow Card' | 'Red Card' }[]>([]);

  const triggerLiveEventAnimation = (playerId: string, eventType: 'Goal' | 'Assist' | 'Corner' | 'Yellow Card' | 'Red Card') => {
    const animId = `anim-${Date.now()}-${Math.random()}`;
    setLiveEventAnimations(prev => [...prev, { id: animId, playerId, type: eventType }]);
    setTimeout(() => {
      setLiveEventAnimations(prev => prev.filter(x => x.id !== animId));
    }, 1800);
  };

  // SPAIN STARTERS
  const SPAIN_STARTERS = [
    { key: 'LW', playerId: 'es-21' }, // Nico Williams
    { key: 'ST', playerId: 'es-23' }, // Mikel Oyarzabal
    { key: 'RW', playerId: 'es-22' }, // Lamine Yamal
    { key: 'LCM', playerId: 'es-19' }, // Pedri
    { key: 'CM', playerId: 'es-17' },  // Rodri
    { key: 'RCM', playerId: 'es-14' }, // Dani Olmo
    { key: 'LB', playerId: 'es-4' },   // Alejandro Grimaldo
    { key: 'LCB', playerId: 'es-7' },  // Aymeric Laporte
    { key: 'RCB', playerId: 'es-8' },  // Pau Cubarsí
    { key: 'RB', playerId: 'es-6' },   // Pedro Porro
    { key: 'GK', playerId: 'es-2' }    // Unai Simón
  ];

  // ARGENTINA STARTERS
  const ARGENTINA_STARTERS = [
    { key: 'LW', playerId: 'ar-22' }, // Nico González
    { key: 'ST', playerId: 'ar-25' }, // Lautaro Martínez
    { key: 'RW', playerId: 'ar-21' }, // Lionel Messi
    { key: 'LCM', playerId: 'ar-18' }, // Alexis Mac Allister
    { key: 'CM', playerId: 'ar-19' },  // Enzo Fernández
    { key: 'RCM', playerId: 'ar-12' }, // Rodrigo De Paul
    { key: 'LB', playerId: 'ar-4' },   // Nicolás Tagliafico
    { key: 'LCB', playerId: 'ar-7' },  // Cristian Romero
    { key: 'RCB', playerId: 'ar-6' },  // Lisandro Martínez
    { key: 'RB', playerId: 'ar-10' },  // Nahuel Molina
    { key: 'GK', playerId: 'ar-2' }    // Emiliano Martínez
  ];

  // Live match players
  const [livePlayers, setLivePlayers] = useState(() => {
    const spainInitial = SPAIN_STARTERS.map(item => {
      const p = PLAYER_MAP[item.playerId];
      return {
        id: item.playerId,
        key: item.key,
        nation: 'Spain' as const,
        rating: p ? p.baseRating : 80,
        goals: 0,
        assists: 0,
        recentEvents: [] as MatchEvent[]
      };
    });
    const argentinaInitial = ARGENTINA_STARTERS.map(item => {
      const p = PLAYER_MAP[item.playerId];
      return {
        id: item.playerId,
        key: item.key,
        nation: 'Argentina' as const,
        rating: p ? p.baseRating : 80,
        goals: 0,
        assists: 0,
        recentEvents: [] as MatchEvent[]
      };
    });
    return [...spainInitial, ...argentinaInitial];
  });

  const [liveMatchTime, setLiveMatchTime] = useState(12);
  const prevSortedIdsRef = useRef<string[]>([]);

  const getRankChange = (playerId: string, currentRankIdx: number) => {
    const prevRankIdx = prevSortedIdsRef.current.indexOf(playerId);
    if (prevRankIdx === -1) return 'stable';
    if (currentRankIdx < prevRankIdx) return 'up';
    if (currentRankIdx > prevRankIdx) return 'down';
    return 'stable';
  };

  const getLivePlayerRating = (playerId: string, cardRating: number) => {
    const liveP = livePlayers.find(p => p.id === playerId);
    return liveP ? liveP.rating : cardRating;
  };

  // Track sorted ratings for real-time ranking shifts
  useEffect(() => {
    if (prevSortedIdsRef.current.length === 0) {
      prevSortedIdsRef.current = [...livePlayers]
        .sort((a, b) => b.rating - a.rating)
        .map(p => p.id);
    }
  }, [livePlayers]);

  const simulateLiveMatchEvent = () => {
    // Increment match clock
    setLiveMatchTime(t => {
      if (t >= 90) {
        addLog(
          '🔄 The referee blows the final whistle! Match restarted from the 1st minute.',
          'RESTART',
          'SYS_CLK',
          '-',
          'RESET',
          'neutral'
        );
        // Reset player stats on full restart
        setLivePlayers(prev => prev.map(p => {
          const originalPlayer = PLAYER_MAP[p.id];
          return {
            ...p,
            rating: originalPlayer ? originalPlayer.baseRating : 80,
            goals: 0,
            assists: 0,
            recentEvents: []
          };
        }));
        return 1;
      }
      return t + Math.floor(Math.random() * 3) + 1;
    });

    // Pick random player
    const randomIdx = Math.floor(Math.random() * livePlayers.length);
    const liveP = livePlayers[randomIdx];
    const player = PLAYER_MAP[liveP.id];
    if (!player) return;

    // Pick event
    const eventTemplate = MATCH_EVENT_TEMPLATES[Math.floor(Math.random() * MATCH_EVENT_TEMPLATES.length)];

    // Trigger visual/icon animation on the pitch card
    triggerLiveEventAnimation(liveP.id, eventTemplate.type);

    // Save current sorted order to ref BEFORE updating state to calculate relative ranking shifts
    prevSortedIdsRef.current = [...livePlayers]
      .sort((a, b) => b.rating - a.rating)
      .map(p => p.id);

    const ratingChange = eventTemplate.points;
    const newRating = Math.max(40, Math.min(99, liveP.rating + ratingChange));

    setLivePlayers(prev => prev.map(p => {
      if (p.id !== liveP.id) return p;
      return {
        ...p,
        rating: newRating,
        goals: p.goals + (eventTemplate.type === 'Goal' ? 1 : 0),
        assists: p.assists + (eventTemplate.type === 'Assist' ? 1 : 0),
        recentEvents: [{
          id: `live-ev-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          playerName: player.name,
          playerId: player.id,
          type: eventTemplate.type,
          points: eventTemplate.points,
          description: eventTemplate.format(player.name)
        }, ...p.recentEvents].slice(0, 5)
      };
    }));

    // Floating text indicator
    const floatId = `float-${Date.now()}-${Math.random()}`;
    setFloatingScores(f => [...f, {
      id: floatId,
      cardId: `live-${liveP.id}`,
      text: ratingChange > 0 ? `+${ratingChange}` : `${ratingChange}`,
      isPositive: ratingChange > 0
    }]);
    setTimeout(() => {
      setFloatingScores(f => f.filter(x => x.id !== floatId));
    }, 1200);

    // Sync rating back to collection card if owned!
    setCollection(prev => {
      let updated = false;
      const nextCollection = prev.map(card => {
        if (card.playerId === liveP.id) {
          updated = true;
          return {
            ...card,
            rating: Math.max(40, Math.min(99, card.rating + ratingChange)),
            recentEvents: [{
              id: `ev-${Date.now()}-${Math.random()}`,
              timestamp: new Date(),
              playerName: player.name,
              playerId: player.id,
              type: eventTemplate.type,
              points: eventTemplate.points,
              description: eventTemplate.format(player.name)
            }, ...card.recentEvents].slice(0, 5)
          };
        }
        return card;
      });
      if (updated) {
        localStorage.setItem('pitchpacks_collection', JSON.stringify(nextCollection));
      }
      return nextCollection;
    });

    const symbol = `${player.nation === 'Spain' ? 'ESP' : 'ARG'}_${getPlayerSymbol(player.name)}`;
    addLog(
      `[${liveMatchTime}'] ${eventTemplate.format(player.name)}`,
      eventTemplate.type,
      symbol,
      newRating,
      ratingChange > 0 ? `+${ratingChange}` : `${ratingChange}`,
      ratingChange > 0 ? 'positive' : 'negative'
    );
  };

  // Helper to inject specific event for a specific player
  const handleInjectLiveEvent = (playerId: string, eventType: 'Goal' | 'Assist' | 'Corner' | 'Yellow Card' | 'Red Card') => {
    const liveP = livePlayers.find(p => p.id === playerId);
    const player = PLAYER_MAP[playerId];
    if (!liveP || !player) return;

    const template = MATCH_EVENT_TEMPLATES.find(t => t.type === eventType);
    if (!template) return;

    // Trigger visual/icon animation on the pitch card
    triggerLiveEventAnimation(playerId, eventType);

    prevSortedIdsRef.current = [...livePlayers]
      .sort((a, b) => b.rating - a.rating)
      .map(p => p.id);

    const ratingChange = template.points;
    const newRating = Math.max(40, Math.min(99, liveP.rating + ratingChange));

    setLivePlayers(prev => prev.map(p => {
      if (p.id !== playerId) return p;
      return {
        ...p,
        rating: newRating,
        goals: p.goals + (eventType === 'Goal' ? 1 : 0),
        assists: p.assists + (eventType === 'Assist' ? 1 : 0),
        recentEvents: [{
          id: `live-ev-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          playerName: player.name,
          playerId: player.id,
          type: eventType,
          points: template.points,
          description: template.format(player.name)
        }, ...p.recentEvents].slice(0, 5)
      };
    }));

    const floatId = `float-${Date.now()}-${Math.random()}`;
    setFloatingScores(f => [...f, {
      id: floatId,
      cardId: `live-${playerId}`,
      text: ratingChange > 0 ? `+${ratingChange}` : `${ratingChange}`,
      isPositive: ratingChange > 0
    }]);
    setTimeout(() => {
      setFloatingScores(f => f.filter(x => x.id !== floatId));
    }, 1200);

    setCollection(prev => {
      let updated = false;
      const nextCollection = prev.map(card => {
        if (card.playerId === playerId) {
          updated = true;
          return {
            ...card,
            rating: Math.max(40, Math.min(99, card.rating + ratingChange)),
            recentEvents: [{
              id: `ev-${Date.now()}-${Math.random()}`,
              timestamp: new Date(),
              playerName: player.name,
              playerId: player.id,
              type: eventType,
              points: template.points,
              description: template.format(player.name)
            }, ...card.recentEvents].slice(0, 5)
          };
        }
        return card;
      });
      if (updated) {
        localStorage.setItem('pitchpacks_collection', JSON.stringify(nextCollection));
      }
      return nextCollection;
    });

    const symbol = `${player.nation === 'Spain' ? 'ESP' : 'ARG'}_${getPlayerSymbol(player.name)}`;
    addLog(
      `[${liveMatchTime}'] ${template.format(player.name)}`,
      eventType,
      symbol,
      newRating,
      ratingChange > 0 ? `+${ratingChange}` : `${ratingChange}`,
      ratingChange > 0 ? 'positive' : 'negative'
    );
  };

  // Persist balance and collection on changes
  useEffect(() => {
    localStorage.setItem('pitchpacks_balance', balance.toFixed(2));
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('pitchpacks_collection', JSON.stringify(collection));
  }, [collection]);

  // Squad Builder assignments
  const [squadAssignments, setSquadAssignments] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('pitchpacks_squad');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });

  const [selectingPosition, setSelectingPosition] = useState<string | null>(null);
  const [selectSearch, setSelectSearch] = useState('');
  const [selectFilterLine, setSelectFilterLine] = useState<string>('ALL');

  useEffect(() => {
    localStorage.setItem('pitchpacks_squad', JSON.stringify(squadAssignments));
  }, [squadAssignments]);

  // Filter out any assigned squad cards that are no longer in the collection
  useEffect(() => {
    const collectionIds = new Set(collection.map(c => c.id));
    let changed = false;
    const cleanAssignments = { ...squadAssignments };
    for (const [pos, cardId] of Object.entries(squadAssignments)) {
      if (!collectionIds.has(cardId)) {
        delete cleanAssignments[pos];
        changed = true;
      }
    }
    if (changed) {
      setSquadAssignments(cleanAssignments);
    }
  }, [collection, squadAssignments]);

  // Map absolute positions for 4-3-3 formation
  const FORMATION_POSITIONS = [
    { key: 'LW', label: 'LW', top: '80%', left: '15%', line: 'FW' },
    { key: 'ST', label: 'ST', top: '86%', left: '50%', line: 'FW' },
    { key: 'RW', label: 'RW', top: '80%', left: '85%', line: 'FW' },
    { key: 'LCM', label: 'LCM', top: '56%', left: '20%', line: 'MF' },
    { key: 'CM', label: 'CM', top: '50%', left: '50%', line: 'MF' },
    { key: 'RCM', label: 'RCM', top: '56%', left: '80%', line: 'MF' },
    { key: 'LB', label: 'LB', top: '32%', left: '15%', line: 'DF' },
    { key: 'LCB', label: 'LCB', top: '26%', left: '36%', line: 'DF' },
    { key: 'RCB', label: 'RCB', top: '26%', left: '64%', line: 'DF' },
    { key: 'RB', label: 'RB', top: '32%', left: '85%', line: 'DF' },
    { key: 'GK', label: 'GK', top: '10%', left: '50%', line: 'GK' }
  ];

  // Let's refine formation list to be clean without duplicate LCB keys
  const FIXED_FORMATION_POSITIONS = [
    { key: 'LW', label: 'LW', top: '80%', left: '15%', line: 'FW' },
    { key: 'ST', label: 'ST', top: '86%', left: '50%', line: 'FW' },
    { key: 'RW', label: 'RW', top: '80%', left: '85%', line: 'FW' },
    { key: 'LCM', label: 'LCM', top: '56%', left: '20%', line: 'MF' },
    { key: 'CM', label: 'CM', top: '50%', left: '50%', line: 'MF' },
    { key: 'RCM', label: 'RCM', top: '56%', left: '80%', line: 'MF' },
    { key: 'LB', label: 'LB', top: '32%', left: '15%', line: 'DF' },
    { key: 'LCB', label: 'LCB', top: '26%', left: '36%', line: 'DF' },
    { key: 'RCB', label: 'RCB', top: '26%', left: '64%', line: 'DF' },
    { key: 'RB', label: 'RB', top: '32%', left: '85%', line: 'DF' },
    { key: 'GK', label: 'GK', top: '10%', left: '50%', line: 'GK' }
  ];

  const POSITION_LINE_MAP: Record<string, Position> = {
    GK: 'GK',
    LB: 'DF',
    LCB: 'DF',
    RCB: 'DF',
    RB: 'DF',
    LCM: 'MF',
    CM: 'MF',
    RCM: 'MF',
    LW: 'FW',
    ST: 'FW',
    RW: 'FW',
  };

  // Squad calculation details
  const getSquadMetrics = () => {
    const activeCards = Object.entries(squadAssignments)
      .map(([pos, cardId]) => {
        const card = collection.find(c => c.id === cardId);
        return card ? { pos, card, player: PLAYER_MAP[card.playerId] } : null;
      })
      .filter((item): item is { pos: string; card: CollectedCard; player: Player } => item !== null);

    if (activeCards.length === 0) {
      return { avgRating: 0, totalChemistry: 0, activeCount: 0 };
    }

    const totalRating = activeCards.reduce((sum, item) => sum + getLivePlayerRating(item.card.playerId, item.card.rating), 0);
    const avgRating = Math.round(totalRating / activeCards.length);

    // Count nations in squad
    const nationCounts = { Spain: 0, Argentina: 0 };
    activeCards.forEach(item => {
      if (item.player.nation === 'Spain' || item.player.nation === 'Argentina') {
        nationCounts[item.player.nation]++;
      }
    });

    let totalChemistry = 0;
    activeCards.forEach(item => {
      let playerChem = 0;
      
      // 1. Correct position line check
      const correctLine = POSITION_LINE_MAP[item.pos];
      if (item.player.position === correctLine) {
        playerChem += 1;
      }

      // 2. Nation chemistry thresholds
      const countForNation = nationCounts[item.player.nation] || 0;
      if (countForNation >= 3) {
        playerChem += 1;
      }
      if (countForNation >= 6) {
        playerChem += 1;
      }

      totalChemistry += playerChem;
    });

    return {
      avgRating,
      totalChemistry,
      activeCount: activeCards.length
    };
  };

  const { avgRating: squadAvgRating, totalChemistry: squadTotalChemistry, activeCount: squadActiveCount } = getSquadMetrics();

  const handleAssignPlayer = (pos: string, cardId: string) => {
    setSquadAssignments(prev => {
      const next = { ...prev };
      // If this card was assigned somewhere else, remove it from there (FUT swap rule)
      for (const [k, v] of Object.entries(next)) {
        if (v === cardId) {
          delete next[k];
        }
      }
      next[pos] = cardId;
      return next;
    });
    setSelectingPosition(null);
    
    // Add transaction log for the squad placement
    const card = collection.find(c => c.id === cardId);
    if (card) {
      const p = PLAYER_MAP[card.playerId];
      const symbol = `${p.nation === 'Spain' ? 'ESP' : 'ARG'}_${getPlayerSymbol(p.name)}`;
      const liveRating = getLivePlayerRating(card.playerId, card.rating);
      addLog(
        `Deployed ${p.name} to the active tactical field at ${pos}!`,
        'DEPLOY',
        symbol,
        liveRating,
        `+${liveRating} OVR`,
        'positive'
      );
    }
  };

  const handleUnassignPlayer = (pos: string) => {
    const cardId = squadAssignments[pos];
    if (cardId) {
      const card = collection.find(c => c.id === cardId);
      if (card) {
        const p = PLAYER_MAP[card.playerId];
        const symbol = `${p.nation === 'Spain' ? 'ESP' : 'ARG'}_${getPlayerSymbol(p.name)}`;
        addLog(
          `Benched ${p.name} from tactical position ${pos}.`,
          'BENCH',
          symbol,
          '-',
          'BENCHED',
          'neutral'
        );
      }
    }
    setSquadAssignments(prev => {
      const next = { ...prev };
      delete next[pos];
      return next;
    });
  };

  const handleAutoBuildSquad = () => {
    // Standard auto-builder:
    // Sort entire collection descending by rating
    const sortedAvailable = [...collection].sort((a, b) => getLivePlayerRating(b.playerId, b.rating) - getLivePlayerRating(a.playerId, a.rating));
    const newAssignments: Record<string, string> = {};
    const usedIds = new Set<string>();

    // For each slot in formation, let's find the highest rated player who matches the position line
    FIXED_FORMATION_POSITIONS.forEach(slot => {
      const correctLine = POSITION_LINE_MAP[slot.key];
      const matchCard = sortedAvailable.find(c => {
        if (usedIds.has(c.id)) return false;
        const p = PLAYER_MAP[c.playerId];
        return p && p.position === correctLine;
      });

      if (matchCard) {
        newAssignments[slot.key] = matchCard.id;
        usedIds.add(matchCard.id);
      }
    });

    // For any remaining empty slots, fill with any remaining highest rated cards
    FIXED_FORMATION_POSITIONS.forEach(slot => {
      if (!newAssignments[slot.key]) {
        const fallbackCard = sortedAvailable.find(c => !usedIds.has(c.id));
        if (fallbackCard) {
          newAssignments[slot.key] = fallbackCard.id;
          usedIds.add(fallbackCard.id);
        }
      }
    });

    setSquadAssignments(newAssignments);
    addLog(
      'Constructed dynamic AI Ultimate XI using top rated assets!',
      'AUTO_XI',
      'SYS_AUTO',
      '-',
      'SUCCESS',
      'positive'
    );
  };

  const handleClearSquad = () => {
    setSquadAssignments({});
    addLog(
      'Benched all players from the active tactical pitch.',
      'BENCH_ALL',
      'SYS_CLR',
      '-',
      'CLEARED',
      'neutral'
    );
  };

  // Automated match simulator loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoSimulate) {
      interval = setInterval(() => {
        simulateLiveMatchEvent();
      }, 5000); // Ticks every 5 seconds
    }
    return () => clearInterval(interval);
  }, [autoSimulate, livePlayers, liveMatchTime]);

  // Handle generating a new random 1-card pack
  const generatePackCards = (): CollectedCard[] => {
    const cards: CollectedCard[] = [];
    const pool = ALL_PLAYERS;
    
    // Draw exactly 1 random player per pack
    for (let i = 0; i < 1; i++) {
      const randomPlayer = pool[Math.floor(Math.random() * pool.length)];
      const liveP = livePlayers.find(p => p.id === randomPlayer.id);
      const startingRating = liveP ? liveP.rating : randomPlayer.baseRating;
      cards.push({
        id: `pack-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        playerId: randomPlayer.id,
        rating: startingRating,
        recentEvents: [],
        obtainedAt: new Date().toISOString()
      });
    }
    return cards;
  };

  // Open regular premium pack (1 Random Player)
  const handleOpenPack = () => {
    if (balance < 10) {
      alert('Insufficient funds! Please claim your Daily Allowance or quick-sell existing cards to buy this Pack.');
      return;
    }

    setBalance(prev => prev - 10);
    const newPack = generatePackCards();
    
    // Trigger animation
    setActiveDraft(newPack);
    setIsPackOpening(true);
    setRevealIndex(-1);
    setSelectedDraftIndex(0);
    
    // Reveal single card
    let currentReveal = -1;
    const timer = setInterval(() => {
      currentReveal += 1;
      setRevealIndex(currentReveal);
      setSelectedDraftIndex(currentReveal);
      if (currentReveal >= 0) {
        clearInterval(timer);
        setIsPackOpening(false);
      }
    }, 450);

    addLog(
      'Opened a Premium Pack for $10.00! Reviewing player card...',
      'BUY',
      'SYS_PACK',
      '-',
      '-$10.00',
      'negative'
    );
  };

  // Reopen Pack (Reroll Draft) for $5
  const handleReopenPack = () => {
    if (balance < 5) {
      alert('Insufficient funds to Reopen Pack! You need at least $5.00 to reroll this draft.');
      return;
    }

    setBalance(prev => prev - 5);
    const rerolledPack = generatePackCards();

    // Trigger animation again
    setActiveDraft(rerolledPack);
    setIsPackOpening(true);
    setRevealIndex(-1);
    setSelectedDraftIndex(0);

    let currentReveal = -1;
    const timer = setInterval(() => {
      currentReveal += 1;
      setRevealIndex(currentReveal);
      setSelectedDraftIndex(currentReveal);
      if (currentReveal >= 0) {
        clearInterval(timer);
        setIsPackOpening(false);
      }
    }, 400);

    addLog(
      'Reopened Pack for $5.00! Rerolled draft result...',
      'REROLL',
      'SYS_ROLL',
      '-',
      '-$5.00',
      'negative'
    );
  };

  // Commit the current draft pack to the Ledger
  const handleClaimPack = () => {
    if (!activeDraft) return;

    setCollection(prev => [...prev, ...activeDraft]);
    setActiveDraft(null);
    setRevealIndex(-1);

    addLog(
      'Saved all draft cards permanently to your Squad Ledger collection!',
      'SECURE',
      'SYS_SAVE',
      'LEDGER',
      'SUCCESS',
      'positive'
    );
  };

  // Commit only the currently viewed single player card from the draft pack
  const handleClaimSelectedPlayer = () => {
    if (!activeDraft) return;
    const selectedCard = activeDraft[selectedDraftIndex];
    if (!selectedCard) return;

    if (selectedDraftIndex > revealIndex) {
      alert('This player card is still locked! Please wait for it to be revealed.');
      return;
    }

    setCollection(prev => [...prev, selectedCard]);
    const player = PLAYER_MAP[selectedCard.playerId];
    setActiveDraft(null);
    setRevealIndex(-1);

    const symbol = `${player.nation === 'Spain' ? 'ESP' : 'ARG'}_${getPlayerSymbol(player.name)}`;
    addLog(
      `Signed ${player.name} (${selectedCard.rating} OVR) to your collection ledger!`,
      'SIGN',
      symbol,
      selectedCard.rating,
      `+${selectedCard.rating} OVR`,
      'positive'
    );
  };

  // Add Log message
  const addLog = (
    details: string,
    event: string = 'SYS',
    ticker: string = 'SYS_MSG',
    ovr: string | number = '-',
    change: string = '-',
    changeType: 'positive' | 'negative' | 'neutral' = 'neutral'
  ) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: time,
      ticker,
      event: event.toUpperCase(),
      details,
      ovr,
      change,
      changeType
    };
    setGlobalLogs(prev => [newEntry, ...prev.slice(0, 49)]);
  };

  // Interactive Match Event Simulation
  const simulateEventForCard = (
    cardId: string, 
    eventType: 'Goal' | 'Assist' | 'Corner' | 'Yellow Card' | 'Red Card'
  ) => {
    const template = MATCH_EVENT_TEMPLATES.find(t => t.type === eventType);
    if (!template) return;

    const cardInstance = collection.find(c => c.id === cardId);
    if (!cardInstance) return;

    const player = PLAYER_MAP[cardInstance.playerId];
    if (!player) return;

    // Retrieve the active rating before update (falling back to card rating if not starting)
    const currentRating = getLivePlayerRating(cardInstance.playerId, cardInstance.rating);
    const newRating = Math.max(40, Math.min(99, currentRating + template.points));

    // Update in collection
    setCollection(prev => {
      return prev.map(card => {
        if (card.playerId !== cardInstance.playerId) return card;

        const newEvent: MatchEvent = {
          id: `ev-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          playerName: player.name,
          playerId: card.playerId,
          type: eventType,
          points: template.points,
          description: template.format(player.name)
        };

        return {
          ...card,
          rating: newRating,
          recentEvents: [newEvent, ...card.recentEvents].slice(0, 5) // keep last 5
        };
      });
    });

    // Create log & sync with live simulator player
    const formattedChange = template.points > 0 ? `+${template.points}` : `${template.points}`;
    const symbol = `${player.nation === 'Spain' ? 'ESP' : 'ARG'}_${getPlayerSymbol(player.name)}`;
    
    // Trigger visual/icon animation on the pitch card
    triggerLiveEventAnimation(cardInstance.playerId, eventType);

    addLog(
      template.format(player.name),
      eventType,
      symbol,
      newRating,
      formattedChange,
      template.points > 0 ? 'positive' : 'negative'
    );

    // Dynamically sync and update the corresponding player in the Live Match status/Rankings
    const liveP = livePlayers.find(p => p.id === cardInstance.playerId);
    if (liveP) {
      prevSortedIdsRef.current = [...livePlayers]
        .sort((a, b) => b.rating - a.rating)
        .map(p => p.id);

      setLivePlayers(prev => prev.map(p => {
        if (p.id !== cardInstance.playerId) return p;
        return {
          ...p,
          rating: newRating,
          goals: p.goals + (eventType === 'Goal' ? 1 : 0),
          assists: p.assists + (eventType === 'Assist' ? 1 : 0),
          recentEvents: [{
            id: `live-ev-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            playerName: player.name,
            playerId: player.id,
            type: eventType,
            points: template.points,
            description: template.format(player.name)
          }, ...p.recentEvents].slice(0, 5)
        };
      }));

      // Also add floating points above the live player on the pitch
      const floatId = `float-${Date.now()}-${Math.random()}`;
      setFloatingScores(f => [...f, {
        id: floatId,
        cardId: `live-${cardInstance.playerId}`,
        text: template.points > 0 ? `+${template.points}` : `${template.points}`,
        isPositive: template.points > 0
      }]);
      setTimeout(() => {
        setFloatingScores(f => f.filter(x => x.id !== floatId));
      }, 1200);
    }

    // Also add floating points above the card in My Card Collection
    const floatId = `float-${Date.now()}-${Math.random()}`;
    setFloatingScores(f => [...f, {
      id: floatId,
      cardId: cardId,
      text: template.points > 0 ? `+${template.points}` : `${template.points}`,
      isPositive: template.points > 0
    }]);
    setTimeout(() => {
      setFloatingScores(f => f.filter(x => x.id !== floatId));
    }, 1200);
  };

  // Toggle favorite card
  const toggleFavorite = (cardId: string) => {
    setCollection(prev => 
      prev.map(c => c.id === cardId ? { ...c, isFavorite: !c.isFavorite } : c)
    );
  };

  // Quick sell card back to the bank
  const handleQuickSell = (cardId: string) => {
    const card = collection.find(c => c.id === cardId);
    if (!card) return;

    const player = PLAYER_MAP[card.playerId];
    if (!player) return;

    // Valuation formula: Base rarity value + dynamic rating modifier
    let baseValue = 3.00;
    if (player.rarity === 'Rare') baseValue = 6.00;
    if (player.rarity === 'Epic') baseValue = 12.00;
    if (player.rarity === 'Legendary') baseValue = 25.00;

    // Rating modifier: adds/subtracts value based on current rating relative to base rating
    const liveRating = getLivePlayerRating(card.playerId, card.rating);
    const ratingDiff = liveRating - player.baseRating;
    const finalValuation = Math.max(1.00, baseValue + (ratingDiff * 0.25));

    setBalance(prev => prev + finalValuation);
    setCollection(prev => prev.filter(c => c.id !== cardId));

    const symbol = `${player.nation === 'Spain' ? 'ESP' : 'ARG'}_${getPlayerSymbol(player.name)}`;
    addLog(
      `Sold ${player.name} (${player.rarity}) to the league for $${finalValuation.toFixed(2)}.`,
      'SELL',
      symbol,
      liveRating,
      `+$${finalValuation.toFixed(2)}`,
      'positive'
    );
  };

  // Add free funds if the user is out of money
  const handleClaimAllowance = () => {
    setBalance(prev => prev + 25.00);
    addLog(
      'Claimed $25.00 League Allowance sponsorship!',
      'SPONSOR',
      'SYS_ALW',
      '-',
      '+$25.00',
      'positive'
    );
  };

  // Reset entire collection
  const handleResetCollection = () => {
    if (window.confirm('Are you sure you want to reset your ledger collection? This will clear all cards and dynamic ratings.')) {
      localStorage.removeItem('pitchpacks_collection');
      setCollection([
        { id: 'start-1', playerId: 'es-22', rating: 91, recentEvents: [], obtainedAt: new Date().toISOString(), isFavorite: true },
        { id: 'start-2', playerId: 'ar-21', rating: 92, recentEvents: [], obtainedAt: new Date().toISOString(), isFavorite: true }
      ]);
      setBalance(100.00);
      setActiveDraft(null);
      addLog(
        'Reset squad collection back to starter cards.',
        'RESET',
        'SYS_RST',
        '-',
        'RESET',
        'neutral'
      );
    }
  };

  // Filter & Sort collection logic
  const filteredCollection = collection.filter(card => {
    const player = PLAYER_MAP[card.playerId];
    if (!player) return false;

    // Search query match
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          player.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Nation match
    const matchesNation = filterNation === 'All' || player.nation === filterNation;

    // Rarity match
    const matchesRarity = filterRarity === 'All' || player.rarity === filterRarity;

    // Position match
    const matchesPosition = filterPosition === 'All' || player.position === filterPosition;

    return matchesSearch && matchesNation && matchesRarity && matchesPosition;
  });

  // Sorting
  const sortedCollection = [...filteredCollection].sort((a, b) => {
    const playerA = PLAYER_MAP[a.playerId];
    const playerB = PLAYER_MAP[b.playerId];
    if (!playerA || !playerB) return 0;

    let compare = 0;
    if (sortBy === 'rating') {
      const ratingA = getLivePlayerRating(a.playerId, a.rating);
      const ratingB = getLivePlayerRating(b.playerId, b.rating);
      compare = ratingA - ratingB;
    } else if (sortBy === 'name') {
      compare = playerA.name.localeCompare(playerB.name);
    } else if (sortBy === 'obtained') {
      compare = new Date(a.obtainedAt).getTime() - new Date(b.obtainedAt).getTime();
    }

    return sortOrder === 'desc' ? -compare : compare;
  });

  return (
    <div id="main_dashboard_container" className="min-h-screen stadium-gradient text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 pb-12">
      
      {/* Visual background Pitch Lines decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.06),rgba(0,0,0,0))] pointer-events-none" />
      
      {/* Top sticky sports header */}
      <header id="pitchpacks_header" className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl shadow-lg shadow-emerald-500/20">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">LIVE SQUAD LEDGER</span>
              </div>
              <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 uppercase leading-none mt-0.5">
                PITCHPACKS
              </h1>
            </div>
          </div>

          {/* User economy status dashboard */}
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
            
            {/* Wallet representation */}
            <div id="balance_badge" className="flex items-center space-x-3 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 shadow-inner">
              <div className="p-1.5 bg-slate-800/80 rounded-lg text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">My Funds</p>
                <div className="flex items-center font-mono font-bold text-slate-50 text-base">
                  <span className="text-emerald-400 mr-0.5">$</span>
                  {balance.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Quick action sponsorship claim button */}
            <button
              id="claim_sponsorship_btn"
              onClick={handleClaimAllowance}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition duration-150 cursor-pointer shadow-md shadow-emerald-500/10"
              title="Add $25.00 free funds to simulate packs"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Claim +$25</span>
            </button>
            
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Dynamic Pack Drafter (if open or prompting to open) */}
        <section id="pack_arena_section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PACK ACTION PANEL */}
          <div className="lg:col-span-1 bento-cell p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase mb-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>PACK OPENING ARENA</span>
              </div>
              <h2 className="text-xl font-bold font-display tracking-tight text-slate-50 mb-3">
                Squad Pack Draft
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Open digital packs to sign random football stars from the combined <strong className="text-slate-300">Spain 🇪🇸</strong> and <strong className="text-slate-300">Argentina 🇦🇷</strong> national squad rosters. 
              </p>

              {/* Pack details box */}
              <div className="bg-slate-950/80 border border-white/5 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Draft Card Pool Size</span>
                  <span className="font-mono text-slate-300">52 Active Squad Players</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Cards Per Pack</span>
                  <span className="font-mono text-slate-300">1 Random Player</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2.5">
                  <span className="text-slate-400 font-medium">Standard Pack Cost</span>
                  <span className="font-mono text-emerald-400 font-bold">$10.00</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Reopen / Reroll Pack Fee</span>
                  <span className="font-mono text-amber-400 font-bold">$5.00</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {!activeDraft ? (
                <button
                  id="open_pack_btn"
                  onClick={handleOpenPack}
                  disabled={balance < 10}
                  className={`w-full py-4 rounded-xl font-semibold font-display transition duration-150 flex items-center justify-center space-x-2 border shadow-lg ${
                    balance >= 10
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 hover:from-emerald-400 hover:to-teal-500 active:scale-95 border-emerald-400/20 cursor-pointer shadow-emerald-500/10'
                      : 'bg-slate-900/60 text-slate-600 border-white/5 cursor-not-allowed'
                  }`}
                >
                  <Coins className="w-5 h-5" />
                  <span>Open Squad Pack ($10.00)</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="reopen_pack_btn"
                    onClick={handleReopenPack}
                    disabled={balance < 5 || isPackOpening}
                    className={`py-3 px-2 rounded-xl font-semibold text-xs font-display flex items-center justify-center space-x-1.5 transition duration-150 border ${
                      balance >= 5 && !isPackOpening
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 border-amber-300/30 cursor-pointer shadow-md'
                        : 'bg-slate-900/60 text-slate-600 border-white/5 cursor-not-allowed'
                    }`}
                    title="Deduct $5.00 and reroll the player card"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reroll Pack ($5)</span>
                  </button>

                  <button
                    id="claim_draft_btn"
                    onClick={handleClaimPack}
                    disabled={isPackOpening}
                    className={`py-3 px-2 rounded-xl font-bold text-xs font-display flex items-center justify-center space-x-1.5 transition duration-150 border ${
                      !isPackOpening
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 border-emerald-400/20 cursor-pointer shadow-md'
                        : 'bg-slate-900/60 text-slate-600 border-white/5 cursor-not-allowed'
                    }`}
                    title="Sign the generated player card to your Squad Ledger"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add to Collection</span>
                  </button>
                </div>
              )}
              
              {balance < 10 && !activeDraft && (
                <p className="text-center text-[11px] text-rose-400/90 flex items-center justify-center space-x-1 mt-2">
                  <span>⚠️ Balance low. Sell some cards or claim funds above!</span>
                </p>
              )}
            </div>
          </div>

          {/* ACTIVE PACK DRAFT ANIMATED BOARD */}
          <div className="lg:col-span-2 bento-cell p-6 relative overflow-hidden flex flex-col justify-between min-h-[360px] shadow-2xl">
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-slate-400">RANKING STATUS</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                {activeDraft ? 'Draft Live' : 'Collection Ready'}
              </span>
            </div>

            {/* Simulated Cards Arena */}
            <div className="flex-1 flex flex-col justify-between py-4">
              <AnimatePresence mode="wait">
                {!activeDraft ? (
                  <motion.div
                    key="empty_pack"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4 max-w-sm mx-auto px-4 py-8"
                  >
                    <div className="mx-auto w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 animate-bounce">
                      <Coins className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-slate-200 font-semibold text-sm">No Active Pack</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Trigger a "Squad Pack" using the left command button. Instantly preview 1 random player, and pay $5.00 to reopen until you find legendary players!
                      </p>
                    </div>
                  </motion.div>
                ) : (() => {
                  const activeSelectedCard = activeDraft[selectedDraftIndex];
                  const activeSelectedPlayer = activeSelectedCard ? PLAYER_MAP[activeSelectedCard.playerId] : null;
                  const isSelectedRevealed = selectedDraftIndex <= revealIndex;
                  const selectedStyles = activeSelectedPlayer ? getRarityStyles(activeSelectedPlayer.rarity) : null;

                  return (
                    <motion.div
                      key="active_pack_display"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full"
                    >
                      {/* Left part: Selected Player Card Display */}
                      <div className="md:col-span-5 flex flex-col items-center justify-center p-2">
                        <AnimatePresence mode="wait">
                          {!isSelectedRevealed ? (
                            <motion.div
                              key="card-back"
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.95, opacity: 0 }}
                              className="w-full max-w-[240px] min-h-[385px] rounded-2xl border-2 border-dashed border-slate-700 bg-gradient-to-b from-slate-955 to-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4 shadow-xl relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                              <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 animate-pulse">
                                <Sparkles className="w-6 h-6 text-amber-500/80" />
                              </div>
                              <div>
                                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-black">MYSTERY PACK PLAYER</span>
                                <h4 className="text-xs font-semibold text-slate-400 mt-1">LOCKED IN PACK</h4>
                                <p className="text-[9px] text-slate-600 mt-1 leading-relaxed">Reveals automatically with a dramatic animation...</p>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key={`card-front-${activeSelectedCard.id}`}
                              initial={{ rotateY: -90, scale: 0.9, opacity: 0 }}
                              animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', damping: 20 }}
                              className={`w-full max-w-[240px] min-h-[385px] rounded-2xl border ${selectedStyles?.border} bg-gradient-to-b ${selectedStyles?.bg} ${selectedStyles?.glow} p-5 flex flex-col justify-between relative overflow-hidden group shadow-2xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1`}
                            >
                              {/* Inner premium overlays */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.02] pointer-events-none z-0" />
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:translate-x-full pointer-events-none z-10" style={{ transform: 'skewX(-20deg)' }} />

                              {/* Card top row */}
                              <div className="flex justify-between items-start z-10 relative">
                                <div>
                                  <span className="text-3xl font-mono font-black tracking-tight leading-none text-slate-50">
                                    {getLivePlayerRating(activeSelectedCard.playerId, activeSelectedCard.rating)}
                                  </span>
                                  <div className="mt-1">
                                    <span className={`text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full border ${getPositionColor(activeSelectedPlayer!.position)}`}>
                                      {activeSelectedPlayer!.position}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-2xl" title={activeSelectedPlayer!.nation}>
                                    {activeSelectedPlayer!.nation === 'Spain' ? '🇪🇸' : '🇦🇷'}
                                  </span>
                                </div>
                              </div>

                              {/* Player Image Avatar */}
                              <div className="flex justify-center z-10 relative my-1">
                                <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 bg-slate-950/45 flex items-center justify-center shadow-inner relative group-hover:border-emerald-500/30 transition-colors duration-300">
                                  <img
                                    src={getMaleAvatarUrl(activeSelectedPlayer!.name)}
                                    alt={activeSelectedPlayer!.name}
                                    className="w-14 h-14 object-contain"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              </div>

                              {/* Player identity info */}
                              <div className="my-3 text-center z-10 relative">
                                <h3 className="text-base font-bold font-display tracking-tight text-slate-50 truncate group-hover:text-emerald-400 transition">
                                  {activeSelectedPlayer!.name}
                                </h3>
                                <p className="text-[10px] font-mono text-slate-400 mt-1">
                                  Base {activeSelectedPlayer!.baseRating} • Draft Card
                                </p>
                                <span className={`inline-block text-[9px] tracking-widest uppercase font-mono mt-1 px-2.5 py-0.5 rounded-full border ${selectedStyles?.badge}`}>
                                  {activeSelectedPlayer!.rarity}
                                </span>
                              </div>

                              {/* Stats with attribute grid bar displays */}
                              <div className="space-y-1.5 z-10 relative text-[10px] font-mono bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">PAC</span>
                                    <span className="font-semibold text-slate-100">{activeSelectedPlayer!.stats.pace}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">SHO</span>
                                    <span className="font-semibold text-slate-100">{activeSelectedPlayer!.stats.shooting}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">PAS</span>
                                    <span className="font-semibold text-slate-100">{activeSelectedPlayer!.stats.passing}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">DRI</span>
                                    <span className="font-semibold text-slate-100">{activeSelectedPlayer!.stats.dribbling}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">DEF</span>
                                    <span className="font-semibold text-slate-100">{activeSelectedPlayer!.stats.defending}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">PHY</span>
                                    <span className="font-semibold text-slate-100">{activeSelectedPlayer!.stats.physicality}</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>


                      </div>

                      {/* Right part: Performance Graph */}
                      <div className="md:col-span-7 flex flex-col justify-between bg-slate-950/50 border border-white/5 p-4 rounded-2xl relative overflow-hidden min-h-[250px]">
                        {!isSelectedRevealed ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 p-4">
                            <Clock className="w-8 h-8 text-slate-600 animate-spin" />
                            <div>
                              <h4 className="text-xs font-semibold text-slate-400">GRAPH BLOCKED</h4>
                              <p className="text-[10px] text-slate-500 mt-1 font-mono">Reveal the player card first to compile their Form Progression index.</p>
                            </div>
                          </div>
                        ) : (() => {
                          const history = getPlayerHistory(activeSelectedPlayer!.id, getLivePlayerRating(activeSelectedCard.playerId, activeSelectedCard.rating));
                          const ratings = history.map(h => h.rating);
                          const maxR = Math.max(...ratings);
                          const minR = Math.min(...ratings);
                          const rRange = maxR === minR ? 10 : (maxR - minR);
                          const pad = rRange * 0.15;
                          const yMin = minR - pad;
                          const yMax = maxR + pad;

                          const getY = (rating: number) => {
                            const percentage = (rating - yMin) / (yMax - yMin);
                            return 130 - (percentage * 105); // Map to y=25 to y=130 inside SVG viewbox
                          };

                          // Generate coordinate points for drawing path
                          const points = history.map((h, i) => ({
                            x: 30 + i * 68, // x spans 30 to 370
                            y: getY(h.rating),
                            rating: h.rating,
                            date: h.date
                          }));

                          // Construct lines
                          const linePath = points.reduce((path, p, i) => 
                            i === 0 ? `M ${p.x},${p.y}` : `${path} L ${p.x},${p.y}`, ''
                          );
                          const areaPath = `${linePath} L ${points[points.length-1].x},130 L ${points[0].x},130 Z`;

                          const startRating = ratings[0];
                          const endRating = ratings[ratings.length - 1];
                          const diff = endRating - startRating;

                          return (
                            <motion.div
                              key={`graph-${activeSelectedCard.id}`}
                              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                              transition={{ 
                                delay: 0.65,
                                duration: 0.5,
                                ease: [0.16, 1, 0.3, 1]
                              }}
                              className="flex-1 flex flex-col justify-between"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="text-xs font-bold font-display text-slate-200 uppercase tracking-wider">FORM TRAJECTORY</h4>
                                  <p className="text-[9px] font-mono text-slate-500">Historical form rating across last 6 games/dates</p>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                    diff > 0 ? 'text-emerald-400 bg-emerald-500/10' : diff < 0 ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 bg-slate-500/10'
                                  }`}>
                                    <TrendingUp className="w-3 h-3" />
                                    {diff > 0 ? `+${diff}` : diff} Delta
                                  </span>
                                </div>
                              </div>

                              {/* Interactive Graph Canvas */}
                              <div className="flex-1 min-h-[145px] relative">
                                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 155" preserveAspectRatio="none">
                                  <defs>
                                    <linearGradient id={`lineGrad-${activeSelectedCard.id}`} x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#10b981" />
                                      <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                    <linearGradient id={`areaGrad-${activeSelectedCard.id}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                    </linearGradient>
                                  </defs>
                                  
                                  {/* Grid lines */}
                                  <line x1="30" y1="25" x2="370" y2="25" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
                                  <line x1="30" y1="60" x2="370" y2="60" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
                                  <line x1="30" y1="95" x2="370" y2="95" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
                                  <line x1="30" y1="130" x2="370" y2="130" stroke="rgba(255,255,255,0.1)" />

                                  {/* Path Fill under line */}
                                  <motion.path 
                                    d={areaPath} 
                                    fill={`url(#areaGrad-${activeSelectedCard.id})`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2, duration: 0.4 }}
                                  />

                                  {/* The Line path */}
                                  <motion.path 
                                    d={linePath} 
                                    fill="none" 
                                    stroke={`url(#lineGrad-${activeSelectedCard.id})`} 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ 
                                      delay: 0.8, 
                                      duration: 0.8, 
                                      ease: "easeInOut" 
                                    }}
                                  />

                                  {/* Dots and Labels */}
                                  {points.map((p, i) => (
                                    <motion.g 
                                      key={i} 
                                      className="group/dot"
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      transition={{ 
                                        delay: 1.2 + i * 0.08, 
                                        type: 'spring', 
                                        stiffness: 150, 
                                        damping: 12 
                                      }}
                                    >
                                      {/* Hover Glow Ring */}
                                      <circle cx={p.x} cy={p.y} r="6" className="fill-emerald-400/20 opacity-0 group-hover/dot:opacity-100 transition-opacity duration-150" />
                                      {/* Center Bullet */}
                                      <circle cx={p.x} cy={p.y} r="3.5" className="fill-slate-950 stroke-emerald-400 stroke-[2px]" />
                                      
                                      {/* Rating popup above dot */}
                                      <text x={p.x} y={p.y - 8} textAnchor="middle" className="fill-slate-100 text-[9px] font-mono font-bold">
                                        {p.rating}
                                      </text>

                                      {/* Game/Date Label below graph */}
                                      <text x={p.x} y="146" textAnchor="middle" className="fill-slate-500 text-[8px] font-mono">
                                        {p.date}
                                      </text>
                                    </motion.g>
                                  ))}
                                </svg>
                              </div>

                              {/* Quick performance analysis line */}
                              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-slate-400">
                                <span>Peak Form: <strong className="text-emerald-400">{maxR}</strong></span>
                                <span>Rarity Tier Multiplier: <strong className="text-slate-300">{activeSelectedPlayer!.rarity === 'Legendary' ? 'x2.5' : activeSelectedPlayer!.rarity === 'Epic' ? 'x1.8' : 'x1.2'}</strong></span>
                              </div>
                            </motion.div>
                          );
                        })()}
                      </div>

                      {/* Bottom selection deck: Horizontal mini cards list */}
                      {activeDraft && activeDraft.length > 1 && (
                        <div className="col-span-1 md:col-span-12 border-t border-white/5 pt-4 mt-2">
                          <p className="text-[10px] font-mono text-slate-500 mb-2.5 uppercase tracking-widest text-center">
                            Review Draft Pool (Select a card to view Form Progression)
                          </p>
                          <div className="grid grid-cols-5 gap-2">
                            {activeDraft.map((card, idx) => {
                              const player = PLAYER_MAP[card.playerId];
                              const isRevealed = idx <= revealIndex;
                              const isSelected = idx === selectedDraftIndex;
                              const cardStyles = getRarityStyles(player.rarity);

                              return (
                                <button
                                  key={card.id}
                                  id={`draft_thumb_${idx}`}
                                  onClick={() => setSelectedDraftIndex(idx)}
                                  className={`flex flex-col justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer text-left h-20 border relative overflow-hidden ${
                                    isSelected 
                                      ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-400/20 scale-[1.03]' 
                                      : 'bg-slate-950/60 border-white/5 hover:border-slate-700 hover:bg-slate-900/40'
                                  }`}
                                >
                                  {!isRevealed ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                                      <span className="text-[8px] font-mono text-slate-600 font-bold tracking-tighter">SLOT {idx + 1}</span>
                                      <span className="text-[9px] font-mono text-slate-500 animate-pulse">LOCKED</span>
                                    </div>
                                  ) : (
                                    <div className="flex-1 flex flex-col justify-between w-full">
                                      <div className="flex justify-between items-center w-full">
                                        <span className="text-xs font-mono font-black text-slate-50">{getLivePlayerRating(card.playerId, card.rating)}</span>
                                        <span className="text-xs">{player.nation === 'Spain' ? '🇪🇸' : '🇦🇷'}</span>
                                      </div>
                                      <div className="truncate text-[9px] font-bold text-slate-300 leading-none">
                                        {player.name.split(' ').pop()}
                                      </div>
                                      <div className="text-[8px] font-mono text-slate-500 flex justify-between">
                                        <span>{player.position}</span>
                                        <span className={cardStyles.text}>{player.rarity}</span>
                                      </div>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

            {activeDraft && (
              <div className="text-center mt-3 text-xs text-slate-500 font-mono animate-pulse">
                💡 Review your player card. Reroll with "Reroll Pack ($5)" or sign them to your ledger.
              </div>
            )}
          </div>
        </section>

        {/* GRAND LIVE MATCH SIMULATOR TERMINAL */}
        <section id="mid_panels_grid" className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* LEFT/CENTER 2 COLS: LIVE MATCH STATUS WITH TWO PITCHES AND LEADERBOARD */}
            <div className="lg:col-span-2 flex flex-col space-y-6">
              
              {/* LIVE MATCH STATUS DASHBOARD */}
              <div className="bento-cell p-5 flex flex-col relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold font-display tracking-tight text-slate-100 flex items-center space-x-2">
                      <span className="animate-pulse inline-block w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>Live Match Status</span>
                    </h2>
                    <p className="text-[10.5px] text-slate-400 mt-1">
                      Real-time national squad tracking. Hover on any player to manually inject match events!
                    </p>
                  </div>

                  {/* Scoreboard Widget */}
                  <div className="flex items-center space-x-4 bg-slate-950 border border-white/5 px-3 py-1.5 rounded-2xl shrink-0 self-center">
                    {/* Spain */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-lg">🇪🇸</span>
                      <span className="text-[10px] font-bold text-slate-250">ESP</span>
                    </div>
                    {/* Score */}
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-black font-mono tracking-wider text-amber-400">
                        {livePlayers.filter(p => p.nation === 'Spain').reduce((sum, p) => sum + p.goals, 0)}
                        <span className="text-slate-600 mx-1">:</span>
                        {livePlayers.filter(p => p.nation === 'Argentina').reduce((sum, p) => sum + p.goals, 0)}
                      </span>
                      <span className="text-[8px] font-mono font-bold text-slate-500">
                        MIN {liveMatchTime}'
                      </span>
                    </div>
                    {/* Argentina */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold text-slate-250">ARG</span>
                      <span className="text-lg">🇦🇷</span>
                    </div>
                  </div>

                  {/* Simulation Controls */}
                  <div className="flex items-center space-x-2 shrink-0 self-center">
                    <button
                      id="toggle_autosim_btn"
                      onClick={() => setAutoSimulate(!autoSimulate)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer border ${
                        autoSimulate
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-950 text-slate-300 border-white/5 hover:bg-slate-800'
                      }`}
                    >
                      {autoSimulate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{autoSimulate ? 'Active' : 'Idle'}</span>
                    </button>
                    <button
                      onClick={simulateLiveMatchEvent}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-950 text-slate-300 border border-white/5 hover:border-white/10 hover:bg-slate-900 transition cursor-pointer"
                      title="Simulate Event"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Quick Event</span>
                    </button>
                  </div>
                </div>

                {/* TWO PITCHES SIDE-BY-SIDE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                  
                  {/* SPAIN FIELD */}
                  <div className="relative bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 border border-emerald-500/20 rounded-2xl p-3 overflow-hidden h-[460px] shadow-lg flex flex-col justify-between">
                    {/* Stadium vertical cut grass lawn mower visual lines */}
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.04)_0px,rgba(0,0,0,0.04)_50px,rgba(255,255,255,0.01)_50px,rgba(255,255,255,0.01)_100px)] pointer-events-none" />
                    
                    {/* Field Markings */}
                    <div className="absolute inset-x-0 top-0 h-[460px] border border-white/10 rounded-2xl pointer-events-none z-0">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-14 border-b border-x border-white/15" />
                      <div className="absolute top-14 left-1/2 -translate-x-1/2 w-16 h-8 border-b border-x border-white/15 rounded-b-full" />
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 border-b border-x border-white/25 bg-slate-950/40" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-12 border-t border-x border-white/15 rounded-t-full" />
                    </div>

                    <div className="flex justify-between items-center z-10 border-b border-white/10 pb-1.5 relative">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">🇪🇸</span>
                        <span className="text-[10px] font-bold font-display text-slate-200">SPAIN XI</span>
                      </div>
                      <span className="text-[8px] font-mono font-bold text-red-400/80 uppercase">Starter</span>
                    </div>

                    {/* Spain Starters Grid Layout */}
                    <div className="flex-1 relative w-full h-[380px]">
                      {SPAIN_STARTERS.map(slot => {
                        const liveP = livePlayers.find(p => p.id === slot.playerId);
                        if (!liveP) return null;
                        const player = PLAYER_MAP[slot.playerId];
                        if (!player) return null;
                        const styles = getRarityStyles(player.rarity);
                        const isOwned = collection.some(c => c.playerId === player.id);
                        
                        // Rank changes
                        const sortedIds = [...livePlayers].sort((a, b) => b.rating - a.rating).map(p => p.id);
                        const currentRankIdx = sortedIds.indexOf(player.id);
                        const rankChange = getRankChange(player.id, currentRankIdx);

                        // Position mapping lookup
                        const posDef = FIXED_FORMATION_POSITIONS.find(pos => pos.key === slot.key);
                        const top = posDef?.top || '50%';
                        const left = posDef?.left || '50%';

                        return (
                          <div
                            key={slot.playerId}
                            style={{ top: top, left: left }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 group/slot z-10"
                          >
                            {/* Floating Score Popup */}
                            {floatingScores
                              .filter(f => f.cardId === `live-${player.id}`)
                              .map(f => (
                                <div
                                  key={f.id}
                                  className={`absolute left-1/2 -translate-x-1/2 z-50 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap animate-bounce ${
                                    f.isPositive ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-slate-950'
                                  }`}
                                  style={{ bottom: '100%', marginBottom: '4px' }}
                                >
                                  {f.text}
                                </div>
                              ))}

                            {/* Live Event Visual Animation (Football, Target, Flag, Cards) */}
                            <AnimatePresence>
                              {liveEventAnimations
                                .filter(anim => anim.playerId === player.id)
                                .map(anim => {
                                  let emoji = '⚽';
                                  let bgColor = 'from-emerald-500 to-teal-600';
                                  let glowColor = 'rgba(16, 185, 129, 0.6)';
                                  let label = 'Goal!';
                                  let textColor = 'text-emerald-400';

                                  if (anim.type === 'Assist') {
                                    emoji = '🎯';
                                    bgColor = 'from-sky-500 to-blue-600';
                                    glowColor = 'rgba(14, 165, 233, 0.6)';
                                    label = 'Assist!';
                                    textColor = 'text-sky-400';
                                  } else if (anim.type === 'Corner') {
                                    emoji = '🚩';
                                    bgColor = 'from-amber-500 to-orange-600';
                                    glowColor = 'rgba(245, 158, 11, 0.6)';
                                    label = 'Corner!';
                                    textColor = 'text-amber-400';
                                  } else if (anim.type === 'Yellow Card') {
                                    emoji = '🟨';
                                    bgColor = 'from-yellow-400 to-yellow-500';
                                    glowColor = 'rgba(234, 179, 8, 0.6)';
                                    label = 'Yellow Card';
                                    textColor = 'text-yellow-400';
                                  } else if (anim.type === 'Red Card') {
                                    emoji = '🟥';
                                    bgColor = 'from-red-500 to-rose-600';
                                    glowColor = 'rgba(239, 68, 68, 0.6)';
                                    label = 'Red Card';
                                    textColor = 'text-red-500';
                                  }

                                  return (
                                    <motion.div
                                      key={anim.id}
                                      initial={{ scale: 0, opacity: 0, y: 15 }}
                                      animate={{ 
                                        scale: [0, 1.5, 1.3, 1.3, 0], 
                                        opacity: [0, 1, 1, 1, 0],
                                        y: [15, -15, -20, -25, -45],
                                        rotate: [0, 15, -15, 0, 0]
                                      }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={{ duration: 1.8, times: [0, 0.15, 0.3, 0.85, 1], ease: "easeInOut" }}
                                      className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
                                    >
                                      {/* Glowing radial wave */}
                                      <motion.div 
                                        initial={{ scale: 0.6, opacity: 0.8 }}
                                        animate={{ scale: 2.2, opacity: 0 }}
                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                        className="absolute w-12 h-12 rounded-full border border-dashed pointer-events-none"
                                        style={{ borderColor: glowColor, boxShadow: `0 0 15px ${glowColor}` }}
                                      />

                                      {/* Event Badge with 3D shadow & pulse */}
                                      <div 
                                        className={`flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br ${bgColor} border border-white/30 shadow-2xl relative`}
                                        style={{ boxShadow: `0 0 20px ${glowColor}` }}
                                      >
                                        <span className="text-base sm:text-lg filter drop-shadow-md select-none">
                                          {emoji}
                                        </span>
                                      </div>

                                      {/* Micro Label */}
                                      <span className={`text-[7px] font-black font-mono uppercase tracking-wider ${textColor} bg-slate-950/90 px-1 py-0.5 rounded border border-white/10 mt-1 whitespace-nowrap shadow`}>
                                        {label}
                                      </span>
                                    </motion.div>
                                  );
                                })
                              }
                            </AnimatePresence>

                            {/* Hover Quick Action */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-950 border border-white/10 rounded-lg p-1 shadow-2xl opacity-0 group-hover/slot:opacity-100 transition-opacity duration-200 z-50 flex items-center space-x-0.5 pointer-events-none group-hover/slot:pointer-events-auto">
                              <button onClick={() => handleInjectLiveEvent(player.id, 'Goal')} className="w-4 h-4 rounded hover:bg-white/10 text-[9px] flex items-center justify-center cursor-pointer" title="Goal">⚽</button>
                              <button onClick={() => handleInjectLiveEvent(player.id, 'Assist')} className="w-4 h-4 rounded hover:bg-white/10 text-[9px] flex items-center justify-center cursor-pointer" title="Assist">🎯</button>
                              <button onClick={() => handleInjectLiveEvent(player.id, 'Yellow Card')} className="w-4 h-4 rounded hover:bg-white/10 text-[9px] flex items-center justify-center cursor-pointer" title="Yellow">🟨</button>
                              <button onClick={() => handleInjectLiveEvent(player.id, 'Red Card')} className="w-4 h-4 rounded hover:bg-white/10 text-[9px] flex items-center justify-center cursor-pointer" title="Red">🟥</button>
                            </div>

                            {/* Card Badge */}
                            <div className={`relative w-[38px] h-[46px] sm:w-[44px] sm:h-[54px] rounded-md border ${styles.border} bg-gradient-to-b ${styles.bg} p-0.5 flex flex-col justify-between transition-all duration-300 group-hover/slot:scale-105 shadow ${
                              isOwned ? 'ring-2 ring-emerald-400/40' : ''
                            }`}>
                              <div className="flex justify-between items-center leading-none text-[8px]">
                                <span className="font-mono font-black text-slate-50">{liveP.rating}</span>
                                <span>🇪🇸</span>
                              </div>
                              <div className="truncate text-center text-[7px] font-black text-slate-100 leading-none">
                                {player.name.split(' ').pop()}
                              </div>
                              <div className="flex justify-between items-center text-[6px] font-mono text-slate-400 leading-none">
                                <span>{slot.key}</span>
                                {isOwned && <span className="text-[5px] text-emerald-400 font-bold">OWN</span>}
                              </div>

                              {/* Live stats floating bubble */}
                              {liveP.goals > 0 && (
                                <div className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-black rounded-full w-3 h-3 text-[7px] flex items-center justify-center border border-slate-950">
                                  {liveP.goals}
                                </div>
                              )}
                              {rankChange === 'up' && (
                                <div className="absolute -top-1 -left-1 text-[6px] text-emerald-400">▲</div>
                              )}
                              {rankChange === 'down' && (
                                <div className="absolute -top-1 -left-1 text-[6px] text-rose-400">▼</div>
                              )}
                            </div>
                            <div className="text-center mt-0.5">
                              <p className="text-[7px] font-mono text-slate-400 truncate max-w-[40px] leading-none">
                                {player.name.split(' ').pop()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ARGENTINA FIELD */}
                  <div className="relative bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 border border-emerald-500/20 rounded-2xl p-3 overflow-hidden h-[460px] shadow-lg flex flex-col justify-between">
                    {/* Stadium vertical cut grass lawn mower visual lines */}
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.04)_0px,rgba(0,0,0,0.04)_50px,rgba(255,255,255,0.01)_50px,rgba(255,255,255,0.01)_100px)] pointer-events-none" />
                    
                    {/* Field Markings */}
                    <div className="absolute inset-x-0 top-0 h-[460px] border border-white/10 rounded-2xl pointer-events-none z-0">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-14 border-b border-x border-white/15" />
                      <div className="absolute top-14 left-1/2 -translate-x-1/2 w-16 h-8 border-b border-x border-white/15 rounded-b-full" />
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 border-b border-x border-white/25 bg-slate-950/40" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-12 border-t border-x border-white/15 rounded-t-full" />
                    </div>

                    <div className="flex justify-between items-center z-10 border-b border-white/10 pb-1.5 relative">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">🇦🇷</span>
                        <span className="text-[10px] font-bold font-display text-slate-200">ARGENTINA XI</span>
                      </div>
                      <span className="text-[8px] font-mono font-bold text-sky-400/80 uppercase">Starter</span>
                    </div>

                    {/* Argentina Starters Grid Layout */}
                    <div className="flex-1 relative w-full h-[380px]">
                      {ARGENTINA_STARTERS.map(slot => {
                        const liveP = livePlayers.find(p => p.id === slot.playerId);
                        if (!liveP) return null;
                        const player = PLAYER_MAP[slot.playerId];
                        if (!player) return null;
                        const styles = getRarityStyles(player.rarity);
                        const isOwned = collection.some(c => c.playerId === player.id);
                        
                        // Rank changes
                        const sortedIds = [...livePlayers].sort((a, b) => b.rating - a.rating).map(p => p.id);
                        const currentRankIdx = sortedIds.indexOf(player.id);
                        const rankChange = getRankChange(player.id, currentRankIdx);

                        // Position mapping lookup
                        const posDef = FIXED_FORMATION_POSITIONS.find(pos => pos.key === slot.key);
                        const top = posDef?.top || '50%';
                        const left = posDef?.left || '50%';

                        return (
                          <div
                            key={slot.playerId}
                            style={{ top: top, left: left }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 group/slot z-10"
                          >
                            {/* Floating Score Popup */}
                            {floatingScores
                              .filter(f => f.cardId === `live-${player.id}`)
                              .map(f => (
                                <div
                                  key={f.id}
                                  className={`absolute left-1/2 -translate-x-1/2 z-50 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap animate-bounce ${
                                    f.isPositive ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-slate-950'
                                  }`}
                                  style={{ bottom: '100%', marginBottom: '4px' }}
                                >
                                  {f.text}
                                </div>
                              ))}

                            {/* Live Event Visual Animation (Football, Target, Flag, Cards) */}
                            <AnimatePresence>
                              {liveEventAnimations
                                .filter(anim => anim.playerId === player.id)
                                .map(anim => {
                                  let emoji = '⚽';
                                  let bgColor = 'from-emerald-500 to-teal-600';
                                  let glowColor = 'rgba(16, 185, 129, 0.6)';
                                  let label = 'Goal!';
                                  let textColor = 'text-emerald-400';

                                  if (anim.type === 'Assist') {
                                    emoji = '🎯';
                                    bgColor = 'from-sky-500 to-blue-600';
                                    glowColor = 'rgba(14, 165, 233, 0.6)';
                                    label = 'Assist!';
                                    textColor = 'text-sky-400';
                                  } else if (anim.type === 'Corner') {
                                    emoji = '🚩';
                                    bgColor = 'from-amber-500 to-orange-600';
                                    glowColor = 'rgba(245, 158, 11, 0.6)';
                                    label = 'Corner!';
                                    textColor = 'text-amber-400';
                                  } else if (anim.type === 'Yellow Card') {
                                    emoji = '🟨';
                                    bgColor = 'from-yellow-400 to-yellow-500';
                                    glowColor = 'rgba(234, 179, 8, 0.6)';
                                    label = 'Yellow Card';
                                    textColor = 'text-yellow-400';
                                  } else if (anim.type === 'Red Card') {
                                    emoji = '🟥';
                                    bgColor = 'from-red-500 to-rose-600';
                                    glowColor = 'rgba(239, 68, 68, 0.6)';
                                    label = 'Red Card';
                                    textColor = 'text-red-500';
                                  }

                                  return (
                                    <motion.div
                                      key={anim.id}
                                      initial={{ scale: 0, opacity: 0, y: 15 }}
                                      animate={{ 
                                        scale: [0, 1.5, 1.3, 1.3, 0], 
                                        opacity: [0, 1, 1, 1, 0],
                                        y: [15, -15, -20, -25, -45],
                                        rotate: [0, 15, -15, 0, 0]
                                      }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={{ duration: 1.8, times: [0, 0.15, 0.3, 0.85, 1], ease: "easeInOut" }}
                                      className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
                                    >
                                      {/* Glowing radial wave */}
                                      <motion.div 
                                        initial={{ scale: 0.6, opacity: 0.8 }}
                                        animate={{ scale: 2.2, opacity: 0 }}
                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                        className="absolute w-12 h-12 rounded-full border border-dashed pointer-events-none"
                                        style={{ borderColor: glowColor, boxShadow: `0 0 15px ${glowColor}` }}
                                      />

                                      {/* Event Badge with 3D shadow & pulse */}
                                      <div 
                                        className={`flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br ${bgColor} border border-white/30 shadow-2xl relative`}
                                        style={{ boxShadow: `0 0 20px ${glowColor}` }}
                                      >
                                        <span className="text-base sm:text-lg filter drop-shadow-md select-none">
                                          {emoji}
                                        </span>
                                      </div>

                                      {/* Micro Label */}
                                      <span className={`text-[7px] font-black font-mono uppercase tracking-wider ${textColor} bg-slate-950/90 px-1 py-0.5 rounded border border-white/10 mt-1 whitespace-nowrap shadow`}>
                                        {label}
                                      </span>
                                    </motion.div>
                                  );
                                })
                              }
                            </AnimatePresence>

                            {/* Hover Quick Action */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-950 border border-white/10 rounded-lg p-1 shadow-2xl opacity-0 group-hover/slot:opacity-100 transition-opacity duration-200 z-50 flex items-center space-x-0.5 pointer-events-none group-hover/slot:pointer-events-auto">
                              <button onClick={() => handleInjectLiveEvent(player.id, 'Goal')} className="w-4 h-4 rounded hover:bg-white/10 text-[9px] flex items-center justify-center cursor-pointer" title="Goal">⚽</button>
                              <button onClick={() => handleInjectLiveEvent(player.id, 'Assist')} className="w-4 h-4 rounded hover:bg-white/10 text-[9px] flex items-center justify-center cursor-pointer" title="Assist">🎯</button>
                              <button onClick={() => handleInjectLiveEvent(player.id, 'Yellow Card')} className="w-4 h-4 rounded hover:bg-white/10 text-[9px] flex items-center justify-center cursor-pointer" title="Yellow">🟨</button>
                              <button onClick={() => handleInjectLiveEvent(player.id, 'Red Card')} className="w-4 h-4 rounded hover:bg-white/10 text-[9px] flex items-center justify-center cursor-pointer" title="Red">🟥</button>
                            </div>

                            {/* Card Badge */}
                            <div className={`relative w-[38px] h-[46px] sm:w-[44px] sm:h-[54px] rounded-md border ${styles.border} bg-gradient-to-b ${styles.bg} p-0.5 flex flex-col justify-between transition-all duration-300 group-hover/slot:scale-105 shadow ${
                              isOwned ? 'ring-2 ring-emerald-400/40' : ''
                            }`}>
                              <div className="flex justify-between items-center leading-none text-[8px]">
                                <span className="font-mono font-black text-slate-50">{liveP.rating}</span>
                                <span>🇦🇷</span>
                              </div>
                              <div className="truncate text-center text-[7px] font-black text-slate-100 leading-none">
                                {player.name.split(' ').pop()}
                              </div>
                              <div className="flex justify-between items-center text-[6px] font-mono text-slate-400 leading-none">
                                <span>{slot.key}</span>
                                {isOwned && <span className="text-[5px] text-emerald-400 font-bold">OWN</span>}
                              </div>

                              {/* Live stats floating bubble */}
                              {liveP.goals > 0 && (
                                <div className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-black rounded-full w-3 h-3 text-[7px] flex items-center justify-center border border-slate-950">
                                  {liveP.goals}
                                </div>
                              )}
                              {rankChange === 'up' && (
                                <div className="absolute -top-1 -left-1 text-[6px] text-emerald-400">▲</div>
                              )}
                              {rankChange === 'down' && (
                                <div className="absolute -top-1 -left-1 text-[6px] text-rose-400">▼</div>
                              )}
                            </div>
                            <div className="text-center mt-0.5">
                              <p className="text-[7px] font-mono text-slate-400 truncate max-w-[40px] leading-none">
                                {player.name.split(' ').pop()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* LIVE PLAYER RANKINGS BOARD */}
              <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 mt-4">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">🏆 Live Player Rankings</span>
                  <span className="text-[8px] font-mono text-slate-500">Sorted by Live Form Performance</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[110px] overflow-y-auto pr-1 custom-scrollbar">
                  {[...livePlayers]
                    .sort((a, b) => b.rating - a.rating)
                    .map((liveP, idx) => {
                      const p = PLAYER_MAP[liveP.id];
                      if (!p) return null;
                      const prevRankIdx = prevSortedIdsRef.current.indexOf(liveP.id);
                      const rankDiff = prevRankIdx === -1 ? 0 : prevRankIdx - idx;

                      return (
                        <div key={liveP.id} className="bg-slate-900/60 border border-white/[0.03] rounded-lg p-1.5 flex items-center justify-between text-[10px]">
                          <span className="text-[9px] font-mono text-slate-500 font-bold">#{idx+1}</span>
                          <span className="font-bold text-slate-200 truncate ml-1">{p.name.split(' ').pop()} {p.nation === 'Spain' ? '🇪🇸' : '🇦🇷'}</span>
                          <div className="flex items-center space-x-1 shrink-0 ml-1">
                            <span className="font-mono text-amber-400 font-bold">{liveP.rating}</span>
                            {rankDiff > 0 ? (
                              <span className="text-[8px] text-emerald-400 font-bold">▲{rankDiff}</span>
                            ) : rankDiff < 0 ? (
                              <span className="text-[8px] text-rose-400 font-bold">▼{Math.abs(rankDiff)}</span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>
            
            {/* RIGHT COLUMN: SIM FEED */}
            <div className="lg:col-span-1 bento-cell p-4 flex flex-col h-[740px] lg:h-full shadow-2xl">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold font-display text-slate-100">Live Sim Feed</h3>
                </div>
              </div>

              {/* Scrolling output console log */}
              <div className="flex-1 flex flex-col bg-slate-950/90 border border-emerald-500/20 rounded-xl overflow-hidden shadow-inner">
                
                {/* Column Headers */}
                <div className="flex items-center px-2 py-1 bg-slate-900 border-b border-white/5 text-[8px] font-mono font-bold tracking-widest text-slate-500 uppercase select-none">
                  <div className="w-[35px] flex-none">MIN</div>
                  <div className="flex-1 pl-1">EVENT DESCRIPTION</div>
                  <div className="w-[35px] flex-none text-right">PTS</div>
                </div>

                {/* Logs Content */}
                <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                  <AnimatePresence initial={false}>
                    {globalLogs.map((log) => {
                      return (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          key={log.id} 
                          className="flex items-start px-1.5 py-0.5 rounded hover:bg-white/[0.02] border-b border-white/[0.01] last:border-0 transition text-[9px] leading-tight"
                        >
                          {/* Minute */}
                          <div className="w-[35px] flex-none text-slate-500 font-mono pt-0.5">
                            {log.details.startsWith('[') ? log.details.match(/\[(.*?)\]/)?.[1] : 'Live'}
                          </div>

                          {/* Description */}
                          <div className="flex-1 pl-1 text-slate-300">
                            <span className="font-bold text-slate-400 block text-[8px]">{log.ticker}</span>
                            {log.details.replace(/\[.*?\]\s*/, '')}
                          </div>

                          {/* Rating points */}
                          <div className={`w-[35px] flex-none text-right font-bold font-mono pt-0.5 ${
                            log.changeType === 'positive' ? 'text-emerald-400' :
                            log.changeType === 'negative' ? 'text-rose-400' : 'text-slate-400'
                          }`}>
                            {log.change}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[8px] text-slate-650">
                <span>⚠️ Simulated Match</span>
                <button
                  id="clear_ticker_btn"
                  onClick={() => setGlobalLogs([{
                    id: 'clear-1',
                    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
                    ticker: 'SYS_CLR',
                    event: 'CLEAR',
                    details: 'Logs cleared. Ready for next football events.',
                    ovr: 'SECURE',
                    change: 'RESET',
                    changeType: 'neutral'
                  }])}
                  className="text-slate-400 hover:text-slate-300 transition underline cursor-pointer"
                >
                  Clear Log
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* SIDE-BY-SIDE GRID: MY CARD COLLECTION LEDGER ON LEFT, TACTICAL FOOTBALL PITCH ON RIGHT */}
        <div id="ledger_pitch_grid_container" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mt-12">

          {/* LEFT HALF: MY CARD COLLECTION LEDGER */}
          <section id="collection_ledger_section" className="space-y-6 bg-slate-900/40 border border-white/5 p-4 md:p-6 rounded-2xl shadow-xl flex flex-col lg:h-[860px]">
            
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="text-base font-bold font-display tracking-tight text-slate-100 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <span>My Card Collection ({collection.length})</span>
                </h2>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Manage, search, sort, and trigger live match events for each card.
                </p>
              </div>

              {/* Admin utilities */}
              <div>
                <button
                  id="reset_app_btn"
                  onClick={handleResetCollection}
                  className="flex items-center space-x-1 px-3 py-1.5 text-[10px] font-mono rounded-lg bg-slate-950/60 border border-white/5 hover:border-white/10 hover:bg-slate-900/60 text-rose-400 transition cursor-pointer font-bold"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Reset Collection</span>
                </button>
              </div>
            </div>

            {/* Filtering bar and inputs */}
            <div className="bg-slate-950/40 border border-white/[0.03] p-4 rounded-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    id="search_player_input"
                    type="text"
                    placeholder="Search name or stats..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-555/10 transition"
                  />
                </div>

                {/* Nation filter */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">Nation</span>
                  <select
                    id="filter_nation_select"
                    value={filterNation}
                    onChange={e => setFilterNation(e.target.value as any)}
                    className="w-full bg-slate-950/80 border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/40 transition"
                  >
                    <option value="All">🌍 All</option>
                    <option value="Spain">🇪🇸 Spain</option>
                    <option value="Argentina">🇦🇷 Argentina</option>
                  </select>
                </div>

                {/* Rarity filter */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">Rarity</span>
                  <select
                    id="filter_rarity_select"
                    value={filterRarity}
                    onChange={e => setFilterRarity(e.target.value as any)}
                    className="w-full bg-slate-950/80 border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/40 transition"
                  >
                    <option value="All">💎 All</option>
                    <option value="Common">Slate Common</option>
                    <option value="Rare">Cyan Rare</option>
                    <option value="Epic">Purple Epic</option>
                    <option value="Legendary">Gold Legendary</option>
                  </select>
                </div>

                {/* Position filter */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">Pos</span>
                  <select
                    id="filter_position_select"
                    value={filterPosition}
                    onChange={e => setFilterPosition(e.target.value as any)}
                    className="w-full bg-slate-950/80 border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/40 transition"
                  >
                    <option value="All">🏃 All</option>
                    <option value="GK">GK (Keeper)</option>
                    <option value="DF">DF (Defender)</option>
                    <option value="MF">MF (Midfield)</option>
                    <option value="FW">FW (Forward)</option>
                  </select>
                </div>

              </div>

              {/* Sorting controls */}
              <div className="flex flex-wrap items-center justify-between border-t border-white/5 pt-2.5 text-xs gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] text-slate-550">Sort</span>
                  <div className="flex bg-slate-950/80 border border-white/5 rounded-lg p-0.5">
                    <button
                      id="sort_rating_btn"
                      onClick={() => { setSortBy('rating'); }}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${sortBy === 'rating' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Rating
                    </button>
                    <button
                      id="sort_name_btn"
                      onClick={() => { setSortBy('name'); }}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${sortBy === 'name' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Name
                    </button>
                    <button
                      id="sort_obtained_btn"
                      onClick={() => { setSortBy('obtained'); }}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${sortBy === 'obtained' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Date
                    </button>
                  </div>
                </div>

                {/* Order toggler */}
                <button
                  id="toggle_sort_order_btn"
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-slate-950/80 border border-white/5 rounded-lg text-slate-300 hover:bg-slate-800/80 transition cursor-pointer"
                >
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  <span className="font-mono text-[10px]">
                    {sortOrder === 'desc' ? 'DESC' : 'ASC'}
                  </span>
                </button>
              </div>
            </div>

            {/* Cards Inventory Scrollable Wrapper */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
              {sortedCollection.length === 0 ? (
              <div className="bg-slate-950/30 border border-white/5 rounded-xl py-12 px-4 text-center max-w-sm mx-auto space-y-3">
                <p className="text-slate-400 font-semibold text-xs">No matching players</p>
                <p className="text-[10px] text-slate-550 leading-relaxed">
                  Try adjusting filters or purchasing packs.
                </p>
                <button
                  id="clear_filters_btn"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterNation('All');
                    setFilterRarity('All');
                    setFilterPosition('All');
                  }}
                  className="px-3 py-1.5 bg-slate-850 hover:bg-slate-850 border border-slate-700 rounded-xl text-[10px] font-mono font-medium transition cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {sortedCollection.map(card => {
                    const player = PLAYER_MAP[card.playerId];
                    if (!player) return null;

                    const styles = getRarityStyles(player.rarity);
                    const positionStyles = getPositionColor(player.position);
                    const isLegendary = player.rarity === 'Legendary';

                    // Calculate valuation for Quick Sell
                    let baseValue = 3.00;
                    if (player.rarity === 'Rare') baseValue = 6.00;
                    if (player.rarity === 'Epic') baseValue = 12.00;
                    if (player.rarity === 'Legendary') baseValue = 25.00;
                    const liveRating = getLivePlayerRating(card.playerId, card.rating);
                    const ratingDiff = liveRating - player.baseRating;
                    const cardValuation = Math.max(1.00, baseValue + (ratingDiff * 0.25));

                    const isInSquad = Object.values(squadAssignments).includes(card.id);

                    // Compute live match rank
                    const sortedLiveIds = [...livePlayers].sort((a, b) => b.rating - a.rating).map(p => p.id);
                    const liveRankIdx = sortedLiveIds.indexOf(card.playerId);

                    return (
                      <motion.div
                        key={card.id}
                        layoutId={`collect-card-${card.id}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className={`relative rounded-xl border ${styles.border} bg-gradient-to-b ${styles.bg} ${styles.glow} p-4 flex flex-col justify-between min-h-[350px] group overflow-hidden transition-all duration-300 hover:scale-[1.01] ${isInSquad ? 'ring-2 ring-emerald-500/40 shadow-inner' : ''}`}
                      >
                        {/* Premium card metallic and glowing elements */}
                        {isLegendary && (
                          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-yellow-500/10 pointer-events-none z-0" />
                        )}
                        
                        {/* Interactive shine mask on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-750 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full pointer-events-none z-10" style={{ transform: 'skewX(-20deg)' }} />

                        {/* Header Row */}
                        <div className="flex justify-between items-start z-10 relative">
                          <div>
                            <span className="text-2xl font-mono font-black tracking-tight leading-none text-slate-50">
                              {liveRating}
                            </span>
                            <div className="mt-1 flex flex-wrap gap-1 items-center">
                              <span className={`text-[8.5px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-full border ${positionStyles}`}>
                                {player.position}
                              </span>
                              {liveRankIdx !== -1 && (
                                <span className="text-[8.5px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                  🏆 Live Rank #{liveRankIdx + 1}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Country Flag Flag, Favorite Button, and Quick sell icon */}
                          <div className="flex items-center space-x-1.5">
                            {isInSquad && (
                              <span className="text-[7.5px] font-mono font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded">
                                Fielded
                              </span>
                            )}
                            <button
                              id={`fav_btn_${card.id}`}
                              onClick={() => toggleFavorite(card.id)}
                              className="p-1 bg-slate-950/80 border border-white/5 hover:border-white/10 rounded-lg transition text-slate-400 hover:text-red-400 cursor-pointer"
                            >
                              <Heart className={`w-3 h-3 ${card.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>
                            <span className="text-xl" title={player.nation}>
                              {player.nation === 'Spain' ? '🇪🇸' : '🇦🇷'}
                            </span>
                          </div>
                        </div>

                        {/* Floating points popup feedback wrapper */}
                        <AnimatePresence>
                          {floatingScores
                            .filter(f => f.cardId === card.id)
                            .map(f => (
                              <motion.div
                                key={f.id}
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: -40, scale: 1.2 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={`absolute left-1/2 transform -translate-x-1/2 font-mono font-black text-lg z-30 drop-shadow-md ${
                                  f.isPositive ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {f.text}
                              </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Player Image Avatar */}
                        <div className="flex justify-center z-10 relative my-0.5">
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-slate-950/45 flex items-center justify-center shadow-inner relative group-hover:border-emerald-500/30 transition-colors duration-300">
                            <img
                              src={getMaleAvatarUrl(player.name)}
                              alt={player.name}
                              className="w-10 h-10 object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>

                        {/* Name Plate & Nation */}
                        <div className="my-1.5 text-center z-10 relative">
                          <h3 className="text-sm font-bold font-display tracking-tight text-slate-50 truncate group-hover:text-emerald-400 transition">
                            {player.name}
                          </h3>
                          <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                            Base {player.baseRating} • Acquired {new Date(card.obtainedAt).toLocaleDateString()}
                          </p>
                          <span className={`inline-block text-[8px] tracking-widest uppercase font-mono mt-0.5 px-2 py-0.5 rounded-full border ${styles.badge}`}>
                            {player.rarity}
                          </span>
                        </div>

                        {/* Attributes grid bar displays */}
                        <div className="space-y-1 z-10 relative text-[9px] font-mono bg-slate-950/60 p-2 rounded-xl border border-white/5">
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-300">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">PAC</span>
                              <span className="font-semibold text-slate-100">{player.stats.pace}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">SHO</span>
                              <span className="font-semibold text-slate-100">{player.stats.shooting}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">PAS</span>
                              <span className="font-semibold text-slate-100">{player.stats.passing}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">DRI</span>
                              <span className="font-semibold text-slate-100">{player.stats.dribbling}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">DEF</span>
                              <span className="font-semibold text-slate-100">{player.stats.defending}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">PHY</span>
                              <span className="font-semibold text-slate-100">{player.stats.physicality}</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Match Event Sim buttons */}
                        <div className="mt-2 pt-2 border-t border-slate-800/80 z-10 relative space-y-1.5">
                          <p className="text-[8px] font-mono tracking-wider text-slate-500 uppercase text-center">
                            Live Simulation Triggers
                          </p>
                          
                          {/* Event Sim Actions row */}
                          <div className="grid grid-cols-5 gap-0.5">
                            
                            {/* Goal */}
                            <button
                              id={`sim_goal_${card.id}`}
                              onClick={() => simulateEventForCard(card.id, 'Goal')}
                              className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/20 text-emerald-400 py-1 rounded text-[9px] font-semibold text-center transition cursor-pointer"
                              title="Simulate Goal (+10 Rating)"
                            >
                              ⚽
                            </button>

                            {/* Assist */}
                            <button
                              id={`sim_assist_${card.id}`}
                              onClick={() => simulateEventForCard(card.id, 'Assist')}
                              className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/20 text-emerald-400 py-1 rounded text-[9px] font-semibold text-center transition cursor-pointer"
                              title="Simulate Assist (+6 Rating)"
                            >
                              🎯
                            </button>

                            {/* Corner */}
                            <button
                              id={`sim_corner_${card.id}`}
                              onClick={() => simulateEventForCard(card.id, 'Corner')}
                              className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/20 text-emerald-400 py-1 rounded text-[9px] font-semibold text-center transition cursor-pointer"
                              title="Simulate Corner Kick (+2 Rating)"
                            >
                              🚩
                            </button>

                            {/* Yellow Card */}
                            <button
                              id={`sim_yellow_${card.id}`}
                              onClick={() => simulateEventForCard(card.id, 'Yellow Card')}
                              className="bg-rose-950 hover:bg-rose-900 border border-rose-500/20 text-rose-300 py-1 rounded text-[9px] font-semibold text-center transition cursor-pointer"
                              title="Simulate Yellow Card (-5 Rating)"
                            >
                              🟨
                            </button>

                            {/* Red Card */}
                            <button
                              id={`sim_red_${card.id}`}
                              onClick={() => simulateEventForCard(card.id, 'Red Card')}
                              className="bg-rose-950 hover:bg-rose-900 border border-rose-500/20 text-rose-300 py-1 rounded text-[9px] font-semibold text-center transition cursor-pointer"
                              title="Simulate Red Card (-15 Rating)"
                            >
                              🟥
                            </button>

                          </div>

                          {/* Recent Event Log preview */}
                          {card.recentEvents.length > 0 ? (
                            <div className="bg-slate-950/90 border border-white/5 rounded-lg p-1 text-[8px] font-mono text-slate-300 flex items-center justify-between">
                              <span className="truncate max-w-[100px]">
                                {card.recentEvents[0].type === 'Goal' ? '⚽ Goal!' :
                                 card.recentEvents[0].type === 'Assist' ? '🎯 Assist!' :
                                 card.recentEvents[0].type === 'Corner' ? '🚩 Corner' :
                                 card.recentEvents[0].type === 'Yellow Card' ? '🟨 Yellow' : '🟥 Red Card!'}
                              </span>
                              <span className={card.recentEvents[0].points > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {card.recentEvents[0].points > 0 ? `+${card.recentEvents[0].points}` : card.recentEvents[0].points} pts
                              </span>
                            </div>
                          ) : (
                            <div className="text-center text-[8px] text-slate-650 font-mono py-0.5">
                              No match events
                            </div>
                          )}


                          {/* Removed Quick Sell bottom action per user request */}

                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
            </div>

          </section>

          {/* RIGHT HALF: FOOTBALL GOAL FIELD TACTICAL SQUAD BUILDER */}
          <div id="tactical_pitch_column" className="space-y-6 bg-slate-900/40 border border-white/5 p-4 md:p-6 rounded-2xl shadow-xl flex flex-col lg:h-[860px]">
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="text-base font-bold font-display tracking-tight text-slate-100 flex items-center space-x-2">
                  <span className="text-base">⚽</span>
                  <span>Ultimate XI Pitch Builder</span>
                </h2>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Place up to 11 players. Select a slot to assign or swap.
                </p>
              </div>

              {/* Utility buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  id="auto_build_squad_btn"
                  onClick={handleAutoBuildSquad}
                  className="flex items-center space-x-1 px-3 py-1.5 text-[10px] font-mono rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-400 transition cursor-pointer font-bold"
                  title="Auto-assign highest rated players matching roles"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto Build</span>
                </button>
                <button
                  id="clear_squad_pitch_btn"
                  onClick={handleClearSquad}
                  className="flex items-center space-x-1 px-3 py-1.5 text-[10px] font-mono rounded-lg bg-slate-950/60 border border-white/5 hover:border-white/10 text-rose-400 hover:bg-slate-900/60 transition cursor-pointer font-bold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Pitch</span>
                </button>
              </div>
            </div>

            {/* Squad Stats Badges Panel */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 text-center">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">ACTIVE SQUAD</p>
                <p className="text-base font-mono font-bold text-slate-100 mt-1">{squadActiveCount} / 11</p>
              </div>
              <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 text-center">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">TEAM RATING</p>
                <div className="flex items-center justify-center space-x-1 mt-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <p className="text-base font-mono font-bold text-amber-400">{squadAvgRating}</p>
                </div>
              </div>
              <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 text-center">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">FUT CHEM</p>
                <div className="flex items-center justify-center space-x-1 mt-1">
                  <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <p className="text-base font-mono font-bold text-emerald-400">
                    {squadTotalChemistry} <span className="text-[10px] text-slate-500">/ 33</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Stadium football field grass canvas container */}
            <div 
              className="relative w-full aspect-[3/4] lg:aspect-auto lg:flex-1 min-h-[580px] lg:min-h-0 rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 select-none"
            >
              {/* Stadium vertical cut grass lawn mower visual lines */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.04)_0px,rgba(0,0,0,0.04)_50px,rgba(255,255,255,0.01)_50px,rgba(255,255,255,0.01)_100px)] pointer-events-none" />

              {/* Pitch layout line drawings - Half Pitch with Goal at the Top */}
              {/* Outside pitch bounds */}
              <div className="absolute inset-4 border border-white/15 rounded-2xl pointer-events-none" />
              
              {/* Top Goal representation */}
              <div className="absolute -top-1 left-1/2 w-24 h-5 border-b border-x border-dashed border-white/25 bg-slate-950/40 rounded-b-lg -translate-x-1/2 flex items-center justify-center pointer-events-none">
                <span className="text-[6px] font-mono text-white/25 tracking-widest font-bold">GOAL</span>
              </div>

              {/* Penalty Area (18-yard box at top) */}
              <div className="absolute top-4 left-1/2 w-[180px] h-20 border-b border-x border-white/15 -translate-x-1/2 pointer-events-none" />
              
              {/* Goal Area (6-yard box at top) */}
              <div className="absolute top-4 left-1/2 w-[80px] h-7 border-b border-x border-white/10 -translate-x-1/2 pointer-events-none" />
              
              {/* Penalty Spot */}
              <div className="absolute top-16 left-1/2 w-1.5 h-1.5 rounded-full bg-white/20 -translate-x-1/2 pointer-events-none" />
              
              {/* Penalty Arc (curving down from penalty box) */}
              <div className="absolute top-24 left-1/2 w-20 h-5 border-b border-white/10 rounded-b-full -translate-x-1/2 opacity-25 pointer-events-none" />

              {/* Top Corner Arcs */}
              <div className="absolute top-4 left-4 w-3 h-3 border-b border-r border-white/15 rounded-br-full pointer-events-none" />
              <div className="absolute top-4 right-4 w-3 h-3 border-b border-l border-white/15 rounded-bl-full pointer-events-none" />

              {/* Center Circle Arc at the bottom (representing the halfway line circle) */}
              <div className="absolute bottom-4 left-1/2 w-32 h-16 border-t border-x border-white/15 rounded-t-full -translate-x-1/2 pointer-events-none" />

              {/* Render the 11 Footballer slots on the pitch */}
              {FIXED_FORMATION_POSITIONS.map(slot => {
                const assignedCardId = squadAssignments[slot.key];
                const assignedCard = assignedCardId ? collection.find(c => c.id === assignedCardId) : null;
                const assignedPlayer = assignedCard ? PLAYER_MAP[assignedCard.playerId] : null;

                return (
                  <div
                    key={slot.key}
                    id={`pitch_slot_${slot.key}`}
                    className="absolute cursor-pointer select-none group/slot"
                    style={{
                      top: slot.top,
                      left: slot.left,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 20
                    }}
                    onClick={() => setSelectingPosition(slot.key)}
                  >
                    {assignedCard && assignedPlayer ? (
                      // Compact FIFA-Style Mini Player Card on Pitch
                      <motion.div
                        layoutId={`pitch-card-${assignedCard.id}`}
                        className="relative flex flex-col items-center"
                      >
                        {/* Interactive mini card box */}
                        <div className={`w-[68px] sm:w-[76px] h-[85px] sm:h-[98px] rounded-xl border ${getRarityStyles(assignedPlayer.rarity).border} bg-gradient-to-b ${getRarityStyles(assignedPlayer.rarity).bg} flex flex-col justify-between p-1 text-center shadow-lg group-hover/slot:scale-105 group-hover/slot:brightness-110 transition duration-350 relative`}>
                          
                          {/* Close icon to unassign with ease */}
                          <button
                            id={`unassign_btn_${slot.key}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnassignPlayer(slot.key);
                            }}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 border border-white/10 hover:bg-rose-500 rounded-full flex items-center justify-center text-white text-[8px] font-black shadow z-30 transition opacity-0 group-hover/slot:opacity-100"
                            title="Unassign player"
                          >
                            ×
                          </button>

                          {/* Top row of card */}
                          <div className="flex justify-between items-center text-slate-100 leading-none">
                            <span className="text-[10px] sm:text-[11px] font-mono font-black">{getLivePlayerRating(assignedCard.playerId, assignedCard.rating)}</span>
                            <span className="text-[8px] sm:text-[9.5px]" title={assignedPlayer.nation}>
                              {assignedPlayer.nation === 'Spain' ? '🇪🇸' : '🇦🇷'}
                            </span>
                          </div>

                          {/* Avatar icon inside pitch */}
                          <div className="flex justify-center my-0.5">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-950/40 border border-white/10 flex items-center justify-center overflow-hidden">
                              <img
                                src={getMaleAvatarUrl(assignedPlayer.name)}
                                alt={assignedPlayer.name}
                                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>

                          {/* Name and Position Label */}
                          <div className="leading-none mt-0.5">
                            <p className="text-[7.5px] sm:text-[8.5px] font-bold text-slate-100 truncate w-full px-0.5" title={assignedPlayer.name}>
                              {assignedPlayer.name.split(' ').pop()}
                            </p>
                            <span className="text-[6.5px] font-mono font-black text-slate-400 tracking-wider uppercase">
                              {slot.key}
                            </span>
                          </div>
                        </div>

                        {/* Position Indicator tag under card */}
                        <div className="mt-1 flex items-center justify-center">
                          <span className={`text-[6px] font-mono font-black px-1 rounded-sm tracking-wider leading-none uppercase ${
                            assignedPlayer.position === POSITION_LINE_MAP[slot.key]
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          }`}>
                            {assignedPlayer.position === POSITION_LINE_MAP[slot.key] ? '✓ MATCH' : '⚠ OFF'}
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      // Empty position slot with add button
                      <div className="flex flex-col items-center">
                        <div className="w-[56px] sm:w-[64px] h-[68px] sm:h-[80px] rounded-xl border border-dashed border-white/20 bg-slate-950/40 hover:bg-slate-900/40 hover:border-emerald-500/30 transition-all flex flex-col items-center justify-center duration-300 shadow">
                          <span className="text-white/20 font-black text-xs group-hover/slot:text-emerald-400 transition">+</span>
                          <span className="text-[7px] sm:text-[8px] font-mono font-black tracking-widest text-slate-400 uppercase mt-1">
                            {slot.key}
                          </span>
                        </div>
                        <span className="text-[6px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                          {POSITION_LINE_MAP[slot.key]}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </main>

      {/* SELECTION MODAL TO PLACE PLAYER ON THE PITCH */}
      <AnimatePresence>
        {selectingPosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setSelectingPosition(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 bg-slate-950 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <span className="text-emerald-400">⚽</span>
                    <span>Assign Player to {selectingPosition} ({POSITION_LINE_MAP[selectingPosition]})</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Select a card from your squad ledger. Matching the actual position role yields maximum FUT chemistry.
                  </p>
                </div>
                <button
                  onClick={() => setSelectingPosition(null)}
                  className="p-1 text-slate-400 hover:text-slate-100 transition rounded-lg hover:bg-white/5"
                >
                  <span className="text-base font-bold">×</span>
                </button>
              </div>

              {/* Modal Filters */}
              <div className="p-3 bg-slate-900/60 border-b border-white/5 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search player name..."
                    value={selectSearch}
                    onChange={e => setSelectSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>

                <div className="flex bg-slate-950 border border-white/5 rounded-lg p-0.5">
                  {['ALL', 'FW', 'MF', 'DF', 'GK'].map(line => (
                    <button
                      key={line}
                      onClick={() => setSelectFilterLine(line)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition ${
                        selectFilterLine === line
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {line}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Cards Grid List */}
              <div className="flex-1 overflow-y-auto p-4">
                {(() => {
                  const currentAssignedId = squadAssignments[selectingPosition];

                  // Filter the collection based on modal query
                  const eligibleCards = collection.filter(card => {
                    const p = PLAYER_MAP[card.playerId];
                    if (!p) return false;

                    // Name search
                    if (selectSearch.trim() !== '') {
                      if (!p.name.toLowerCase().includes(selectSearch.toLowerCase())) {
                        return false;
                      }
                    }

                    // Line filter
                    if (selectFilterLine !== 'ALL') {
                      if (p.position !== selectFilterLine) return false;
                    }

                    return true;
                  });

                  if (eligibleCards.length === 0) {
                    return (
                      <div className="text-center py-12 text-xs text-slate-500 font-mono">
                        No ledger cards matching the filter.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Optional Slot Unassign Option if currently assigned */}
                      {currentAssignedId && (
                        <div 
                          className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/15 transition cursor-pointer flex items-center justify-between"
                          onClick={() => {
                            handleUnassignPlayer(selectingPosition);
                            setSelectingPosition(null);
                          }}
                        >
                          <div>
                            <p className="text-xs font-bold text-rose-400">Leave Slot Empty</p>
                            <p className="text-[10px] text-slate-450">Remove the currently assigned player</p>
                          </div>
                          <span className="text-rose-400 text-xs font-bold">Unassign</span>
                        </div>
                      )}

                      {eligibleCards.map(card => {
                        const p = PLAYER_MAP[card.playerId];
                        const alreadyInAnotherPos = Object.entries(squadAssignments).find(([pos, id]) => id === card.id && pos !== selectingPosition);
                        const isCurrentInThisPos = squadAssignments[selectingPosition] === card.id;
                        const matchLine = p.position === POSITION_LINE_MAP[selectingPosition];
                        const rarityStyles = getRarityStyles(p.rarity);

                        return (
                          <div
                            key={card.id}
                            className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between group ${
                              isCurrentInThisPos
                                ? 'bg-emerald-500/10 border-emerald-500/40'
                                : alreadyInAnotherPos
                                ? 'bg-slate-950/20 border-white/5 opacity-60 hover:opacity-90'
                                : 'bg-slate-950/40 border-white/5 hover:border-emerald-500/20 hover:bg-slate-900/40'
                            }`}
                            onClick={() => handleAssignPlayer(selectingPosition, card.id)}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              {/* Small card avatar badge */}
                              <div className={`w-8 h-10 rounded-md border ${rarityStyles.border} bg-gradient-to-b ${rarityStyles.bg} flex flex-col items-center justify-center leading-none flex-shrink-0 text-center`}>
                                <span className="text-[9px] font-black font-mono text-slate-50">{getLivePlayerRating(card.playerId, card.rating)}</span>
                                <span className="text-[7px] font-mono font-black text-slate-450 mt-0.5">{p.position}</span>
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-50 truncate">{p.name}</p>
                                <div className="flex items-center space-x-1.5 mt-0.5 text-[9px] font-mono text-slate-400">
                                  <span>{p.nation === 'Spain' ? '🇪🇸' : '🇦🇷'}</span>
                                  <span>•</span>
                                  <span className={p.position === POSITION_LINE_MAP[selectingPosition] ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                                    {p.position === POSITION_LINE_MAP[selectingPosition] ? 'Match Correct Pos' : `Role: ${p.position}`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0 font-mono">
                              {isCurrentInThisPos ? (
                                <span className="text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">Active</span>
                              ) : alreadyInAnotherPos ? (
                                <span className="text-[9px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">Swap from {alreadyInAnotherPos[0]}</span>
                              ) : (
                                <span className="text-[9px] font-medium text-slate-400 group-hover:text-emerald-400 transition">Assign ➔</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-slate-950 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Ledger Balance: {collection.length} cards</span>
                <button
                  onClick={() => setSelectingPosition(null)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer id="dashboard_footer" className="bg-slate-950/40 border-t border-white/5 mt-20 py-8 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>⚽ PitchPacks: The Live Squad Ledger © 2026. Built with high-fidelity digital trading card simulation technology.</p>
          <p className="text-slate-600">Rosters restricted exclusively to the official 26-man squads of Spain and Argentina.</p>
        </div>
      </footer>
      
    </div>
  );
}
