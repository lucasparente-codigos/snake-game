// ============================================
// 🎯 SCORE MANAGER - Sistema de Pontuação
// ============================================

import type { Difficulty, DifficultySettingsMap, GameStats, EatFoodResult } from '../types';

/**
 * Configurações de dificuldade
 */
const DIFFICULTY_SETTINGS: DifficultySettingsMap = {
  easy: {
    baseSpeed: 200,
    speedIncrease: 5,
    pointsMultiplier: 0.8,
  },
  medium: {
    baseSpeed: 150,
    speedIncrease: 8,
    pointsMultiplier: 1,
  },
  hard: {
    baseSpeed: 100,
    speedIncrease: 12,
    pointsMultiplier: 1.5,
  },
};

/**
 * Níveis de progressão (a cada X pontos, sobe de nível)
 */
const LEVEL_THRESHOLDS = [0, 50, 120, 200, 300, 420, 560, 720, 900, 1100] as const;

export class ScoreManager {
  public difficulty: Difficulty;
  private settings: DifficultySettingsMap[Difficulty];
  
  // Estado do score
  public score: number = 0;
  public foodEaten: number = 0;
  public currentStreak: number = 0;
  public level: number = 1;
  
  // Tracking de tempo para combos
  public lastEatTime: number = 0;
  private comboTimeWindow: number = 2000; // 2 segundos para manter combo

  constructor(difficulty: Difficulty = 'medium') {
    this.difficulty = difficulty;
    this.settings = DIFFICULTY_SETTINGS[difficulty];
  }

  /**
   * Adiciona pontos ao comer comida
   * @returns Informações sobre a pontuação
   */
  eatFood(): EatFoodResult {
    this.foodEaten++;
    this.currentStreak++;
    
    const now = Date.now();
    const timeSinceLastEat = now - this.lastEatTime;
    
    // Verifica se manteve o combo (comeu rápido)
    const isCombo = timeSinceLastEat < this.comboTimeWindow && this.lastEatTime > 0;
    
    // Calcula pontos base
    let points = 10;
    
    // Multiplica por dificuldade
    points *= this.settings.pointsMultiplier;
    
    // Bonus de combo (aumenta a cada comida seguida)
    if (isCombo) {
      const comboBonus = Math.min(this.currentStreak * 2, 50); // Max +50
      points += comboBonus;
    } else {
      // Perdeu o combo
      this.currentStreak = 1;
    }
    
    // Bonus de nível
    const levelBonus = (this.level - 1) * 5;
    points += levelBonus;
    
    // Arredonda pra inteiro
    points = Math.floor(points);
    
    // Adiciona ao score total
    this.score += points;
    
    // Atualiza tempo
    this.lastEatTime = now;
    
    // Verifica se subiu de nível
    const leveledUp = this.checkLevelUp();
    
    return {
      points,
      totalScore: this.score,
      isCombo,
      comboStreak: this.currentStreak,
      leveledUp,
      currentLevel: this.level,
    };
  }

  /**
   * Verifica e atualiza o nível baseado no score
   * @returns True se subiu de nível
   */
  checkLevelUp(): boolean {
    const newLevel = this.calculateLevel(this.score);
    
    if (newLevel > this.level) {
      this.level = newLevel;
      return true;
    }
    
    return false;
  }

  /**
   * Calcula o nível baseado no score
   * @param score - Pontuação atual
   * @returns Nível calculado
   */
  calculateLevel(score: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (score >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * Calcula a velocidade do jogo baseada no nível
   * @returns Intervalo em ms (menor = mais rápido)
   */
  getGameSpeed(): number {
    const baseSpeed = this.settings.baseSpeed;
    const speedDecrease = (this.level - 1) * this.settings.speedIncrease;
    const newSpeed = Math.max(baseSpeed - speedDecrease, 50); // Min 50ms
    
    return newSpeed;
  }

  /**
   * Retorna o progresso até o próximo nível (0-1)
   * @returns Porcentagem de progresso
   */
  getLevelProgress(): number {
    const currentThreshold = LEVEL_THRESHOLDS[this.level - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[this.level] || currentThreshold + 200;
    
    const progress = (this.score - currentThreshold) / (nextThreshold - currentThreshold);
    
    return Math.min(Math.max(progress, 0), 1);
  }

  /**
   * Retorna pontos necessários para o próximo nível
   * @returns Pontos faltando
   */
  getPointsToNextLevel(): number {
    const nextThreshold = LEVEL_THRESHOLDS[this.level];
    
    if (!nextThreshold) {
      return 0; // Nível máximo
    }
    
    return Math.max(nextThreshold - this.score, 0);
  }

  /**
   * Verifica se atingiu o nível máximo
   * @returns True se está no nível máximo
   */
  isMaxLevel(): boolean {
    return this.level >= LEVEL_THRESHOLDS.length;
  }

  /**
   * Reseta o combo (útil quando pausa)
   */
  resetCombo(): void {
    this.currentStreak = 0;
    this.lastEatTime = 0;
  }

  /**
   * Retorna estatísticas completas
   * @returns Todas as stats
   */
  getStats(): GameStats {
    return {
      score: this.score,
      foodEaten: this.foodEaten,
      currentStreak: this.currentStreak,
      level: this.level,
      difficulty: this.difficulty,
      gameSpeed: this.getGameSpeed(),
      levelProgress: this.getLevelProgress(),
      pointsToNextLevel: this.getPointsToNextLevel(),
      isMaxLevel: this.isMaxLevel(),
    };
  }

  /**
   * Reseta o score manager
   */
  reset(): void {
    this.score = 0;
    this.foodEaten = 0;
    this.currentStreak = 0;
    this.level = 1;
    this.lastEatTime = 0;
  }
}