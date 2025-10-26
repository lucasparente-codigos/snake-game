// ============================================
// 💾 STORAGE MANAGER - Gerencia localStorage
// ============================================

import type { GlobalStats, GameSettings } from '../types';

const STORAGE_KEYS = {
  HIGH_SCORE: 'snake_high_score',
  GAMES_PLAYED: 'snake_games_played',
  TOTAL_FOOD_EATEN: 'snake_total_food_eaten',
  BEST_STREAK: 'snake_best_streak',
  SETTINGS: 'snake_settings',
} as const;

export class StorageManager {
  /**
   * Salva o high score se for maior que o atual
   * @param score - Pontuação atual
   * @returns True se salvou um novo record
   */
  static saveHighScore(score: number): boolean {
    const currentHighScore = this.getHighScore();
    
    if (score > currentHighScore) {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
      return true; // Novo record!
    }
    
    return false;
  }

  /**
   * Retorna o high score atual
   * @returns High score
   */
  static getHighScore(): number {
    const score = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    return score ? parseInt(score, 10) : 0;
  }

  /**
   * Incrementa o contador de jogos jogados
   */
  static incrementGamesPlayed(): void {
    const current = this.getGamesPlayed();
    localStorage.setItem(STORAGE_KEYS.GAMES_PLAYED, (current + 1).toString());
  }

  /**
   * Retorna quantos jogos foram jogados
   * @returns Número de jogos
   */
  static getGamesPlayed(): number {
    const games = localStorage.getItem(STORAGE_KEYS.GAMES_PLAYED);
    return games ? parseInt(games, 10) : 0;
  }

  /**
   * Adiciona comidas comidas ao total
   * @param amount - Quantidade de comidas
   */
  static addFoodEaten(amount: number = 1): void {
    const current = this.getTotalFoodEaten();
    localStorage.setItem(STORAGE_KEYS.TOTAL_FOOD_EATEN, (current + amount).toString());
  }

  /**
   * Retorna total de comidas já comidas
   * @returns Total de comidas
   */
  static getTotalFoodEaten(): number {
    const food = localStorage.getItem(STORAGE_KEYS.TOTAL_FOOD_EATEN);
    return food ? parseInt(food, 10) : 0;
  }

  /**
   * Salva o melhor streak (comidas seguidas sem pausar)
   * @param streak - Streak atual
   */
  static saveBestStreak(streak: number): void {
    const current = this.getBestStreak();
    
    if (streak > current) {
      localStorage.setItem(STORAGE_KEYS.BEST_STREAK, streak.toString());
    }
  }

  /**
   * Retorna o melhor streak
   * @returns Melhor streak
   */
  static getBestStreak(): number {
    const streak = localStorage.getItem(STORAGE_KEYS.BEST_STREAK);
    return streak ? parseInt(streak, 10) : 0;
  }

  /**
   * Salva as configurações do jogo
   * @param settings - Objeto com configurações
   */
  static saveSettings(settings: GameSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  /**
   * Retorna as configurações salvas
   * @returns Configurações ou defaults
   */
  static getSettings(): GameSettings {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    
    if (settings) {
      try {
        return JSON.parse(settings) as GameSettings;
      } catch (error) {
        console.error('Erro ao parsear settings:', error);
        return this.getDefaultSettings();
      }
    }
    
    return this.getDefaultSettings();
  }

  /**
   * Retorna configurações padrão
   * @returns Configurações default
   */
  static getDefaultSettings(): GameSettings {
    return {
      difficulty: 'medium',
      soundEnabled: false,
      gridLinesEnabled: true,
    };
  }

  /**
   * Retorna todas as estatísticas
   * @returns Objeto com todas as stats
   */
  static getAllStats(): GlobalStats {
    return {
      highScore: this.getHighScore(),
      gamesPlayed: this.getGamesPlayed(),
      totalFoodEaten: this.getTotalFoodEaten(),
      bestStreak: this.getBestStreak(),
    };
  }

  /**
   * Reseta todas as estatísticas (útil pra debug/reset)
   */
  static resetAllStats(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('📊 Todas as estatísticas foram resetadas!');
  }

  /**
   * Verifica se o localStorage está disponível
   * @returns True se disponível
   */
  static isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('localStorage não disponível:', error);
      return false;
    }
  }
}