// ============================================
// 🎮 GAME TYPES - Tipos relacionados ao gameplay
// ============================================

/**
 * Posição no grid (coordenadas discretas)
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Direção de movimento (vetor unitário)
 */
export interface Direction {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
}

/**
 * Direções disponíveis
 */
export type DirectionName = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

/**
 * Mapa de direções
 */
export type DirectionMap = Record<DirectionName, Direction>;

/**
 * Teclas mapeadas para direções
 */
export type KeyMap = Record<string, DirectionName>;

/**
 * Cores do jogo
 */
export interface Colors {
  background: string;
  grid: string;
  snake: string;
  snakeHead: string;
  food: string;
  text: string;
}

/**
 * Tipo de comida
 */
export interface FoodType {
  id: string;
  name: string;
  emoji: string;
  color: string;
  pointsBase: number;
  pointsMultiplier: number;
  weight: number;
  powerUp: string | null;
}

/**
 * Mapa de tipos de comida
 */
export type FoodTypeMap = Record<string, FoodType>;

/**
 * Power-up base
 */
export interface PowerUp {
  id: string;
  name: string;
  emoji: string;
  color: string;
  duration: number;
  description: string;
}

/**
 * Power-up ativo (com informações de tempo)
 */
export interface ActivePowerUp extends PowerUp {
  startTime: number;
  endTime: number;
  timeoutId: number | null;
  pausedTimeRemaining?: number;
}

/**
 * Mapa de power-ups
 */
export type PowerUpMap = Record<string, PowerUp>;

/**
 * Níveis de dificuldade
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Configurações de dificuldade
 */
export interface DifficultySettings {
  baseSpeed: number;
  speedIncrease: number;
  pointsMultiplier: number;
}

/**
 * Mapa de configurações de dificuldade
 */
export type DifficultySettingsMap = Record<Difficulty, DifficultySettings>;

/**
 * Estatísticas do jogo atual
 */
export interface GameStats {
  score: number;
  foodEaten: number;
  currentStreak: number;
  level: number;
  difficulty: Difficulty;
  gameSpeed: number;
  levelProgress: number;
  pointsToNextLevel: number;
  isMaxLevel: boolean;
}

/**
 * Informações sobre pontuação ao comer comida
 */
export interface EatFoodResult {
  points: number;
  totalScore: number;
  isCombo: boolean;
  comboStreak: number;
  leveledUp: boolean;
  currentLevel: number;
}

/**
 * Debug info de power-ups
 */
export interface PowerUpDebugInfo {
  count: number;
  active: Array<{
    id: string;
    name: string;
    timeRemaining: number;
    progress: number;
  }>;
  modifiers: {
    doublePoints: boolean;
    shield: boolean;
    speedModifier: number;
  };
}

/**
 * Estado completo do jogo (snapshot)
 */
export interface GameStateData {
  score: number;
  level: number;
  snakeBody: Position[];
  foodPosition: Position | null;
  foodType: FoodType | null;
  activePowerUps: ActivePowerUp[];
  isGameOver: boolean;
  isPaused: boolean;
}