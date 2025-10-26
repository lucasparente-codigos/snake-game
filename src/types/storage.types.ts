// ============================================
// 💾 STORAGE TYPES - Tipos relacionados a persistência
// ============================================

import type { Difficulty } from './game.types';

/**
 * Estatísticas globais (persistidas)
 */
export interface GlobalStats {
  highScore: number;
  gamesPlayed: number;
  totalFoodEaten: number;
  bestStreak: number;
}

/**
 * Configurações do jogo (persistidas)
 */
export interface GameSettings {
  difficulty: Difficulty;
  soundEnabled: boolean;
  gridLinesEnabled: boolean;
}

/**
 * Chaves do localStorage
 */
export enum StorageKey {
  HIGH_SCORE = 'snake_high_score',
  GAMES_PLAYED = 'snake_games_played',
  TOTAL_FOOD_EATEN = 'snake_total_food_eaten',
  BEST_STREAK = 'snake_best_streak',
  SETTINGS = 'snake_settings',
  LAST_GAME_STATE = 'snake_last_game_state',
}

/**
 * Resultado de operação de storage
 */
export interface StorageOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Opções para salvar dados
 */
export interface SaveOptions {
  overwrite?: boolean;
  validate?: boolean;
}

/**
 * Opções para carregar dados
 */
export interface LoadOptions {
  fallback?: unknown;
  validate?: boolean;
}

/**
 * Metadados de save
 */
export interface SaveMetadata {
  timestamp: number;
  version: string;
  checksum?: string;
}

/**
 * Save completo com metadados
 */
export interface SaveData<T = unknown> {
  data: T;
  metadata: SaveMetadata;
}

/**
 * Histórico de partidas (opcional, para futuro)
 */
export interface GameHistory {
  id: string;
  timestamp: number;
  score: number;
  level: number;
  difficulty: Difficulty;
  foodEaten: number;
  duration: number;
}

/**
 * Conquistas/Achievements (opcional, para futuro)
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
  icon: string;
}

/**
 * Perfil do jogador (opcional, para futuro)
 */
export interface PlayerProfile {
  name: string;
  createdAt: number;
  stats: GlobalStats;
  settings: GameSettings;
  achievements: Achievement[];
  history: GameHistory[];
}