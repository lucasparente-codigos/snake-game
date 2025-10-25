// ============================================
// ⚡ POWER-UP MANAGER - Gerencia Efeitos Ativos
// ============================================

import { POWER_UPS } from './foodTypes.js';

export class PowerUpManager {
  constructor() {
    // Power-ups ativos (Map para fácil acesso por ID)
    this.activePowerUps = new Map();
    
    // Callbacks para quando power-ups expiram
    this.onPowerUpExpired = null;
  }

  /**
   * Ativa um power-up
   * @param {string} powerUpId - ID do power-up
   * @returns {Object|null} Informações do power-up ativado
   */
  activate(powerUpId) {
    const powerUp = POWER_UPS[powerUpId];
    
    if (!powerUp) {
      console.warn(`Power-up "${powerUpId}" não encontrado`);
      return null;
    }

    // Se já tiver esse power-up ativo, reseta o timer
    if (this.activePowerUps.has(powerUpId)) {
      this.deactivate(powerUpId);
    }

    // Cria dados do power-up ativo
    const activePowerUp = {
      ...powerUp,
      startTime: Date.now(),
      endTime: Date.now() + powerUp.duration,
      timeoutId: null,
    };

    // Agenda a remoção automática
    activePowerUp.timeoutId = setTimeout(() => {
      this.deactivate(powerUpId);
    }, powerUp.duration);

    // Adiciona ao Map
    this.activePowerUps.set(powerUpId, activePowerUp);

    console.log(`⚡ Power-up ativado: ${powerUp.name} por ${powerUp.duration}ms`);

    return activePowerUp;
  }

  /**
   * Desativa um power-up
   * @param {string} powerUpId - ID do power-up
   * @returns {boolean} True se foi desativado
   */
  deactivate(powerUpId) {
    const powerUp = this.activePowerUps.get(powerUpId);
    
    if (!powerUp) {
      return false;
    }

    // Cancela o timeout
    if (powerUp.timeoutId) {
      clearTimeout(powerUp.timeoutId);
    }

    // Remove do Map
    this.activePowerUps.delete(powerUpId);

    console.log(`⚡ Power-up expirado: ${powerUp.name}`);

    // Chama callback se existir
    if (this.onPowerUpExpired) {
      this.onPowerUpExpired(powerUpId);
    }

    return true;
  }

  /**
   * Verifica se um power-up específico está ativo
   * @param {string} powerUpId - ID do power-up
   * @returns {boolean} True se está ativo
   */
  isActive(powerUpId) {
    return this.activePowerUps.has(powerUpId);
  }

  /**
   * Retorna tempo restante de um power-up em ms
   * @param {string} powerUpId - ID do power-up
   * @returns {number} Milissegundos restantes (0 se não ativo)
   */
  getTimeRemaining(powerUpId) {
    const powerUp = this.activePowerUps.get(powerUpId);
    
    if (!powerUp) {
      return 0;
    }

    const remaining = powerUp.endTime - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Retorna progresso de um power-up (0-1)
   * @param {string} powerUpId - ID do power-up
   * @returns {number} Progresso de 0 a 1
   */
  getProgress(powerUpId) {
    const powerUp = this.activePowerUps.get(powerUpId);
    
    if (!powerUp) {
      return 0;
    }

    const elapsed = Date.now() - powerUp.startTime;
    const total = powerUp.duration;
    
    return Math.min(1, elapsed / total);
  }

  /**
   * Retorna todos os power-ups ativos
   * @returns {Array} Array de power-ups ativos
   */
  getActivePowerUps() {
    return Array.from(this.activePowerUps.values());
  }

  /**
   * Verifica efeitos específicos
   */
  hasDoublePoints() {
    return this.isActive('double_points');
  }

  hasShield() {
    return this.isActive('shield');
  }

  hasSlowMotion() {
    return this.isActive('slow_motion');
  }

  hasSpeedBoost() {
    return this.isActive('speed_boost');
  }

  /**
   * Retorna modificador de velocidade baseado nos power-ups
   * @returns {number} Multiplicador de velocidade
   */
  getSpeedModifier() {
    if (this.hasSlowMotion()) {
      return 1.5; // 50% mais lento (aumenta intervalo)
    }
    
    if (this.hasSpeedBoost()) {
      return 0.7; // 30% mais rápido (diminui intervalo)
    }
    
    return 1; // Normal
  }

  /**
   * Limpa todos os power-ups ativos
   */
  clearAll() {
    // Cancela todos os timeouts
    this.activePowerUps.forEach(powerUp => {
      if (powerUp.timeoutId) {
        clearTimeout(powerUp.timeoutId);
      }
    });

    // Limpa o Map
    this.activePowerUps.clear();
    
    console.log('⚡ Todos os power-ups foram limpos');
  }

  /**
   * Retorna informações de debug
   * @returns {Object} Estado atual dos power-ups
   */
  getDebugInfo() {
    const active = this.getActivePowerUps();
    
    return {
      count: active.length,
      active: active.map(p => ({
        id: p.id,
        name: p.name,
        timeRemaining: this.getTimeRemaining(p.id),
        progress: this.getProgress(p.id),
      })),
      modifiers: {
        doublePoints: this.hasDoublePoints(),
        shield: this.hasShield(),
        speedModifier: this.getSpeedModifier(),
      },
    };
  }

  /**
   * Pausa todos os power-ups (útil quando pausa o jogo)
   */
  pause() {
    this.activePowerUps.forEach(powerUp => {
      if (powerUp.timeoutId) {
        clearTimeout(powerUp.timeoutId);
        powerUp.timeoutId = null;
      }
      
      // Salva quanto tempo faltava
      powerUp.pausedTimeRemaining = this.getTimeRemaining(powerUp.id);
    });
  }

  /**
   * Resume todos os power-ups
   */
  resume() {
    this.activePowerUps.forEach((powerUp, powerUpId) => {
      if (powerUp.pausedTimeRemaining) {
        // Recalcula o endTime
        powerUp.startTime = Date.now();
        powerUp.endTime = Date.now() + powerUp.pausedTimeRemaining;
        
        // Agenda novo timeout
        powerUp.timeoutId = setTimeout(() => {
          this.deactivate(powerUpId);
        }, powerUp.pausedTimeRemaining);
        
        delete powerUp.pausedTimeRemaining;
      }
    });
  }
}