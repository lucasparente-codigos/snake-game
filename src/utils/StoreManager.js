// ============================================
// 💾 STORAGE MANAGER - Gerencia localStorage
// ============================================

const STORAGE_KEYS = {
  HIGH_SCORE: 'snake_high_score',
  GAMES_PLAYED: 'snake_games_played',
  TOTAL_FOOD_EATEN: 'snake_total_food_eaten',
  BEST_STREAK: 'snake_best_streak',
  SETTINGS: 'snake_settings',
};

export class StorageManager {
  /**
   * Salva o high score se for maior que o atual
   * @param {number} score - Pontuação atual
   * @returns {boolean} True se salvou um novo record
   */
  static saveHighScore(score) {
    const currentHighScore = this.getHighScore();
    
    if (score > currentHighScore) {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
      return true; // Novo record!
    }
    
    return false;
  }

  /**
   * Retorna o high score atual
   * @returns {number} High score
   */
  static getHighScore() {
    const score = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    return score ? parseInt(score, 10) : 0;
  }

  /**
   * Incrementa o contador de jogos jogados
   */
  static incrementGamesPlayed() {
    const current = this.getGamesPlayed();
    localStorage.setItem(STORAGE_KEYS.GAMES_PLAYED, (current + 1).toString());
  }

  /**
   * Retorna quantos jogos foram jogados
   * @returns {number} Número de jogos
   */
  static getGamesPlayed() {
    const games = localStorage.getItem(STORAGE_KEYS.GAMES_PLAYED);
    return games ? parseInt(games, 10) : 0;
  }

  /**
   * Adiciona comidas comidas ao total
   * @param {number} amount - Quantidade de comidas
   */
  static addFoodEaten(amount = 1) {
    const current = this.getTotalFoodEaten();
    localStorage.setItem(STORAGE_KEYS.TOTAL_FOOD_EATEN, (current + amount).toString());
  }

  /**
   * Retorna total de comidas já comidas
   * @returns {number} Total de comidas
   */
  static getTotalFoodEaten() {
    const food = localStorage.getItem(STORAGE_KEYS.TOTAL_FOOD_EATEN);
    return food ? parseInt(food, 10) : 0;
  }

  /**
   * Salva o melhor streak (comidas seguidas sem pausar)
   * @param {number} streak - Streak atual
   */
  static saveBestStreak(streak) {
    const current = this.getBestStreak();
    
    if (streak > current) {
      localStorage.setItem(STORAGE_KEYS.BEST_STREAK, streak.toString());
    }
  }

  /**
   * Retorna o melhor streak
   * @returns {number} Melhor streak
   */
  static getBestStreak() {
    const streak = localStorage.getItem(STORAGE_KEYS.BEST_STREAK);
    return streak ? parseInt(streak, 10) : 0;
  }

  /**
   * Salva as configurações do jogo
   * @param {Object} settings - Objeto com configurações
   */
  static saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  /**
   * Retorna as configurações salvas
   * @returns {Object} Configurações ou defaults
   */
  static getSettings() {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    
    if (settings) {
      try {
        return JSON.parse(settings);
      } catch (error) {
        console.error('Erro ao parsear settings:', error);
        return this.getDefaultSettings();
      }
    }
    
    return this.getDefaultSettings();
  }

  /**
   * Retorna configurações padrão
   * @returns {Object} Configurações default
   */
  static getDefaultSettings() {
    return {
      difficulty: 'medium',
      soundEnabled: false,
      gridLinesEnabled: true,
    };
  }

  /**
   * Retorna todas as estatísticas
   * @returns {Object} Objeto com todas as stats
   */
  static getAllStats() {
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
  static resetAllStats() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('📊 Todas as estatísticas foram resetadas!');
  }

  /**
   * Verifica se o localStorage está disponível
   * @returns {boolean} True se disponível
   */
  static isAvailable() {
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