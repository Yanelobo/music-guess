/**
 * Models e Interfaces do jogo Music Guess
 * Definem as estruturas de dados utilizadas em toda a aplicação
 */

/**
 * Interface para humor musical disponível
 */
export interface Mood {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
}

/**
 * Interface para dados do jogador
 */
export interface Player {
  id: string;
  name: string;
  createdAt: number;
  dailyPlays: number;
  totalPlays: number;
  dailyScore?: number; // Score do dia atual
}

/**
 * Interface para score/ranking
 */
export interface GameScore {
  playerId: string;
  playerName: string;
  mood: string;
  userGuess: string;
  matchPercentage: number;
  date: string;
  timestamp: number;
}

/**
 * Interface para customização do personagem
 */
export interface Character {
  playerId: string;
  skinColor: string; // Ex: "light", "medium", "dark"
  hairStyle: string; // Ex: "short", "long", "curly"
  outfit: string; // Ex: "casual", "cozy", "elegant"
  accessories: string[]; // Ex: ["hat", "glasses", "scarf"]
  lastUpdated: number;
}

/**
 * Interface para estado do jogo
 */
export interface GameState {
  isLoading: boolean;
  hasPlayedToday: boolean;
  currentMood: Mood | null;
  currentScore: GameScore | null;
  selectedCharacter: Character | null;
  error: string | null;
}

/**
 * Tipo para respostas de matching de música
 */
export interface MatchResult {
  percentage: number; // 0-100
  feedback: string; // Mensagem de feedback para o jogador
}

/**
 * Const com moods disponíveis no jogo
 */
export const AVAILABLE_MOODS: Mood[] = [
  {
    id: 'chill',
    name: 'Chill',
    description: 'Relaxado, tranquilo, perfeito para descansar',
    emoji: '😌',
    color: '#a8d8ea',
  },
  {
    id: 'energetic',
    name: 'Energético',
    description: 'Cheio de energia, para se mexer',
    emoji: '⚡',
    color: '#ffd93d',
  },
  {
    id: 'melancholic',
    name: 'Melancólico',
    description: 'Reflexivo, profundo, emotivo',
    emoji: '🌙',
    color: '#6c5ce7',
  },
  {
    id: 'joyful',
    name: 'Alegre',
    description: 'Feliz, divertido, animado',
    emoji: '🎉',
    color: '#ff7675',
  },
  {
    id: 'focus',
    name: 'Foco',
    description: 'Concentrado, produtivo, determinado',
    emoji: '🎯',
    color: '#00b894',
  },
];

/**
 * Const com opções de customização de personagem
 */
export const CHARACTER_OPTIONS = {
  skinColors: [
    { id: 'light', name: 'Claro' },
    { id: 'medium', name: 'Médio' },
    { id: 'dark', name: 'Escuro' },
  ],
  hairStyles: [
    { id: 'short', name: 'Curto' },
    { id: 'long', name: 'Longo' },
    { id: 'curly', name: 'Encaracolado' },
  ],
  outfits: [
    { id: 'casual', name: 'Casual' },
    { id: 'cozy', name: 'Aconchegante' },
    { id: 'elegant', name: 'Elegante' },
  ],
  accessories: [
    { id: 'hat', name: 'Chapéu' },
    { id: 'glasses', name: 'Óculos' },
    { id: 'scarf', name: 'Lenço' },
    { id: 'headphones', name: 'Fones' },
  ],
};
