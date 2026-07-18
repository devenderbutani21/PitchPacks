import { Player } from './types';

export const SPAIN_PLAYERS: Omit<Player, 'id'>[] = [
  { name: 'David Raya', nation: 'Spain', position: 'GK', baseRating: 84, rarity: 'Rare', stats: { pace: 83, shooting: 45, passing: 81, dribbling: 82, defending: 46, physicality: 78 } },
  { name: 'Joan García', nation: 'Spain', position: 'GK', baseRating: 79, rarity: 'Common', stats: { pace: 77, shooting: 40, passing: 74, dribbling: 76, defending: 44, physicality: 75 } },
  { name: 'Unai Simón', nation: 'Spain', position: 'GK', baseRating: 86, rarity: 'Epic', stats: { pace: 82, shooting: 48, passing: 79, dribbling: 81, defending: 50, physicality: 83 } },
  { name: 'Marc Pubill', nation: 'Spain', position: 'DF', baseRating: 77, rarity: 'Common', stats: { pace: 81, shooting: 55, passing: 68, dribbling: 72, defending: 75, physicality: 78 } },
  { name: 'Alejandro Grimaldo', nation: 'Spain', position: 'DF', baseRating: 84, rarity: 'Rare', stats: { pace: 85, shooting: 78, passing: 86, dribbling: 84, defending: 78, physicality: 72 } },
  { name: 'Eric García', nation: 'Spain', position: 'DF', baseRating: 79, rarity: 'Common', stats: { pace: 68, shooting: 50, passing: 76, dribbling: 73, defending: 80, physicality: 74 } },
  { name: 'Pedro Porro', nation: 'Spain', position: 'DF', baseRating: 82, rarity: 'Rare', stats: { pace: 84, shooting: 72, passing: 80, dribbling: 81, defending: 77, physicality: 79 } },
  { name: 'Aymeric Laporte', nation: 'Spain', position: 'DF', baseRating: 84, rarity: 'Rare', stats: { pace: 70, shooting: 50, passing: 72, dribbling: 70, defending: 85, physicality: 81 } },
  { name: 'Pau Cubarsí', nation: 'Spain', position: 'DF', baseRating: 81, rarity: 'Rare', stats: { pace: 72, shooting: 42, passing: 79, dribbling: 75, defending: 82, physicality: 74 } },
  { name: 'Marc Cucurella', nation: 'Spain', position: 'DF', baseRating: 83, rarity: 'Rare', stats: { pace: 80, shooting: 60, passing: 78, dribbling: 79, defending: 81, physicality: 80 } },
  { name: 'Marcos Llorente', nation: 'Spain', position: 'MF', baseRating: 83, rarity: 'Rare', stats: { pace: 89, shooting: 78, passing: 80, dribbling: 82, defending: 79, physicality: 82 } },
  { name: 'Mikel Merino', nation: 'Spain', position: 'MF', baseRating: 84, rarity: 'Rare', stats: { pace: 72, shooting: 77, passing: 81, dribbling: 80, defending: 82, physicality: 85 } },
  { name: 'Fabián Ruiz', nation: 'Spain', position: 'MF', baseRating: 85, rarity: 'Rare', stats: { pace: 75, shooting: 80, passing: 84, dribbling: 83, defending: 78, physicality: 79 } },
  { name: 'Gavi', nation: 'Spain', position: 'MF', baseRating: 86, rarity: 'Epic', stats: { pace: 79, shooting: 74, passing: 81, dribbling: 85, defending: 80, physicality: 84 } },
  { name: 'Dani Olmo', nation: 'Spain', position: 'MF', baseRating: 86, rarity: 'Epic', stats: { pace: 82, shooting: 83, passing: 85, dribbling: 87, defending: 62, physicality: 70 } },
  { name: 'Yéremy Pino', nation: 'Spain', position: 'FW', baseRating: 79, rarity: 'Common', stats: { pace: 82, shooting: 76, passing: 74, dribbling: 81, defending: 42, physicality: 68 } },
  { name: 'Álex Baena', nation: 'Spain', position: 'MF', baseRating: 82, rarity: 'Rare', stats: { pace: 78, shooting: 79, passing: 85, dribbling: 82, defending: 65, physicality: 72 } },
  { name: 'Rodri', nation: 'Spain', position: 'MF', baseRating: 90, rarity: 'Legendary', stats: { pace: 73, shooting: 81, passing: 89, dribbling: 84, defending: 89, physicality: 87 } },
  { name: 'Martín Zubimendi', nation: 'Spain', position: 'MF', baseRating: 83, rarity: 'Rare', stats: { pace: 74, shooting: 68, passing: 80, dribbling: 79, defending: 82, physicality: 78 } },
  { name: 'Pedri', nation: 'Spain', position: 'MF', baseRating: 88, rarity: 'Epic', stats: { pace: 78, shooting: 76, passing: 89, dribbling: 89, defending: 72, physicality: 71 } },
  { name: 'Ferran Torres', nation: 'Spain', position: 'FW', baseRating: 81, rarity: 'Rare', stats: { pace: 83, shooting: 81, passing: 78, dribbling: 81, defending: 40, physicality: 72 } },
  { name: 'Nico Williams', nation: 'Spain', position: 'FW', baseRating: 87, rarity: 'Epic', stats: { pace: 94, shooting: 82, passing: 80, dribbling: 88, defending: 44, physicality: 75 } },
  { name: 'Lamine Yamal', nation: 'Spain', position: 'FW', baseRating: 91, rarity: 'Legendary', stats: { pace: 92, shooting: 86, passing: 88, dribbling: 93, defending: 46, physicality: 70 } },
  { name: 'Mikel Oyarzabal', nation: 'Spain', position: 'FW', baseRating: 83, rarity: 'Rare', stats: { pace: 80, shooting: 82, passing: 81, dribbling: 81, defending: 52, physicality: 76 } },
  { name: 'Víctor Muñoz', nation: 'Spain', position: 'FW', baseRating: 75, rarity: 'Common', stats: { pace: 80, shooting: 72, passing: 70, dribbling: 76, defending: 38, physicality: 69 } },
  { name: 'Borja Iglesias', nation: 'Spain', position: 'FW', baseRating: 78, rarity: 'Common', stats: { pace: 70, shooting: 80, passing: 68, dribbling: 72, defending: 40, physicality: 82 } }
];

export const ARGENTINA_PLAYERS: Omit<Player, 'id'>[] = [
  { name: 'Juan Musso', nation: 'Argentina', position: 'GK', baseRating: 79, rarity: 'Common', stats: { pace: 78, shooting: 41, passing: 72, dribbling: 76, defending: 42, physicality: 77 } },
  { name: 'Gerónimo Rulli', nation: 'Argentina', position: 'GK', baseRating: 80, rarity: 'Common', stats: { pace: 79, shooting: 43, passing: 75, dribbling: 78, defending: 45, physicality: 78 } },
  { name: 'Emiliano Martínez', nation: 'Argentina', position: 'GK', baseRating: 88, rarity: 'Epic', stats: { pace: 84, shooting: 48, passing: 83, dribbling: 85, defending: 52, physicality: 86 } },
  { name: 'Marcos Senesi', nation: 'Argentina', position: 'DF', baseRating: 80, rarity: 'Common', stats: { pace: 68, shooting: 52, passing: 70, dribbling: 69, defending: 81, physicality: 80 } },
  { name: 'Nicolás Tagliafico', nation: 'Argentina', position: 'DF', baseRating: 81, rarity: 'Rare', stats: { pace: 78, shooting: 58, passing: 74, dribbling: 75, defending: 81, physicality: 80 } },
  { name: 'Gonzalo Montiel', nation: 'Argentina', position: 'DF', baseRating: 79, rarity: 'Common', stats: { pace: 80, shooting: 60, passing: 72, dribbling: 74, defending: 78, physicality: 79 } },
  { name: 'Lisandro Martínez', nation: 'Argentina', position: 'DF', baseRating: 85, rarity: 'Rare', stats: { pace: 77, shooting: 56, passing: 81, dribbling: 79, defending: 86, physicality: 83 } },
  { name: 'Cristian Romero', nation: 'Argentina', position: 'DF', baseRating: 86, rarity: 'Epic', stats: { pace: 79, shooting: 52, passing: 70, dribbling: 71, defending: 87, physicality: 86 } },
  { name: 'Nicolás Otamendi', nation: 'Argentina', position: 'DF', baseRating: 82, rarity: 'Rare', stats: { pace: 64, shooting: 55, passing: 66, dribbling: 65, defending: 83, physicality: 84 } },
  { name: 'Facundo Medina', nation: 'Argentina', position: 'DF', baseRating: 79, rarity: 'Common', stats: { pace: 74, shooting: 50, passing: 73, dribbling: 72, defending: 79, physicality: 81 } },
  { name: 'Nahuel Molina', nation: 'Argentina', position: 'DF', baseRating: 81, rarity: 'Rare', stats: { pace: 85, shooting: 68, passing: 76, dribbling: 78, defending: 77, physicality: 75 } },
  { name: 'Leandro Paredes', nation: 'Argentina', position: 'MF', baseRating: 81, rarity: 'Rare', stats: { pace: 65, shooting: 74, passing: 82, dribbling: 79, defending: 78, physicality: 80 } },
  { name: 'Rodrigo De Paul', nation: 'Argentina', position: 'MF', baseRating: 84, rarity: 'Rare', stats: { pace: 78, shooting: 76, passing: 82, dribbling: 81, defending: 78, physicality: 84 } },
  { name: 'Valentín Barco', nation: 'Argentina', position: 'DF', baseRating: 77, rarity: 'Common', stats: { pace: 82, shooting: 65, passing: 76, dribbling: 80, defending: 72, physicality: 70 } },
  { name: 'Giovani Lo Celso', nation: 'Argentina', position: 'MF', baseRating: 82, rarity: 'Rare', stats: { pace: 74, shooting: 77, passing: 83, dribbling: 84, defending: 68, physicality: 72 } },
  { name: 'Exequiel Palacios', nation: 'Argentina', position: 'MF', baseRating: 81, rarity: 'Rare', stats: { pace: 73, shooting: 72, passing: 80, dribbling: 80, defending: 77, physicality: 78 } },
  { name: 'Thiago Almada', nation: 'Argentina', position: 'MF', baseRating: 80, rarity: 'Common', stats: { pace: 84, shooting: 75, passing: 79, dribbling: 83, defending: 50, physicality: 65 } },
  { name: 'Nico Paz', nation: 'Argentina', position: 'MF', baseRating: 78, rarity: 'Common', stats: { pace: 76, shooting: 74, passing: 77, dribbling: 81, defending: 55, physicality: 70 } },
  { name: 'Alexis Mac Allister', nation: 'Argentina', position: 'MF', baseRating: 86, rarity: 'Epic', stats: { pace: 74, shooting: 80, passing: 85, dribbling: 84, defending: 78, physicality: 78 } },
  { name: 'Enzo Fernández', nation: 'Argentina', position: 'MF', baseRating: 84, rarity: 'Rare', stats: { pace: 72, shooting: 78, passing: 84, dribbling: 81, defending: 77, physicality: 80 } },
  { name: 'Julián Álvarez', nation: 'Argentina', position: 'FW', baseRating: 85, rarity: 'Rare', stats: { pace: 85, shooting: 84, passing: 78, dribbling: 83, defending: 55, physicality: 80 } },
  { name: 'Lionel Messi', nation: 'Argentina', position: 'FW', baseRating: 92, rarity: 'Legendary', stats: { pace: 85, shooting: 91, passing: 92, dribbling: 94, defending: 35, physicality: 65 } },
  { name: 'Nico González', nation: 'Argentina', position: 'FW', baseRating: 80, rarity: 'Common', stats: { pace: 84, shooting: 76, passing: 73, dribbling: 79, defending: 58, physicality: 79 } },
  { name: 'Giuliano Simeone', nation: 'Argentina', position: 'FW', baseRating: 76, rarity: 'Common', stats: { pace: 83, shooting: 73, passing: 68, dribbling: 75, defending: 45, physicality: 74 } },
  { name: 'José Manuel López', nation: 'Argentina', position: 'FW', baseRating: 75, rarity: 'Common', stats: { pace: 72, shooting: 75, passing: 66, dribbling: 71, defending: 38, physicality: 79 } },
  { name: 'Lautaro Martínez', nation: 'Argentina', position: 'FW', baseRating: 89, rarity: 'Epic', stats: { pace: 81, shooting: 88, passing: 74, dribbling: 84, defending: 48, physicality: 84 } }
];

export const ALL_PLAYERS: Player[] = [
  ...SPAIN_PLAYERS.map((p, i) => ({ ...p, id: `es-${i}` })),
  ...ARGENTINA_PLAYERS.map((p, i) => ({ ...p, id: `ar-${i}` }))
];

export const PLAYER_MAP: Record<string, Player> = ALL_PLAYERS.reduce((acc, player) => {
  acc[player.id] = player;
  return acc;
}, {} as Record<string, Player>);

export const MATCH_EVENT_TEMPLATES = [
  { type: 'Goal' as const, points: 10, format: (name: string) => `⚽ ${name} scores an incredible goal!` },
  { type: 'Assist' as const, points: 6, format: (name: string) => `🎯 ${name} provides a brilliant assist!` },
  { type: 'Corner' as const, points: 2, format: (name: string) => `🚩 ${name} takes a precision corner kick!` },
  { type: 'Yellow Card' as const, points: -5, format: (name: string) => `🟨 Yellow Card shown to ${name} for a hard tackle.` },
  { type: 'Red Card' as const, points: -15, format: (name: string) => `🟥 Red Card! ${name} is sent off!` }
];
