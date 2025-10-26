// ============================================
// 🎮 GAME STATE MANAGER - Gerenciador de Estados
// ============================================

/**
 * Estados possíveis do jogo
 */
export enum GameState {
  MENU = 'MENU',
  SETTINGS = 'SETTINGS',
  STATS = 'STATS',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

/**
 * Transições permitidas entre estados
 */
const ALLOWED_TRANSITIONS: Record<GameState, GameState[]> = {
  [GameState.MENU]: [GameState.SETTINGS, GameState.STATS, GameState.PLAYING],
  [GameState.SETTINGS]: [GameState.MENU],
  [GameState.STATS]: [GameState.MENU],
  [GameState.PLAYING]: [GameState.PAUSED, GameState.GAME_OVER, GameState.MENU],
  [GameState.PAUSED]: [GameState.PLAYING, GameState.MENU],
  [GameState.GAME_OVER]: [GameState.MENU, GameState.PLAYING],
};

export class GameStateManager {
  private currentState: GameState;
  private previousState: GameState | null = null;
  
  // Callbacks para mudanças de estado
  private onStateChangeCallbacks: Map<GameState, (() => void)[]> = new Map();
  
  // Callback global para qualquer mudança
  public onStateChange: ((from: GameState, to: GameState) => void) | null = null;

  constructor(initialState: GameState = GameState.MENU) {
    this.currentState = initialState;
    
    console.log(`🎮 GameStateManager inicializado no estado: ${initialState}`);
  }

  /**
   * Retorna o estado atual
   */
  getCurrentState(): GameState {
    return this.currentState;
  }

  /**
   * Retorna o estado anterior
   */
  getPreviousState(): GameState | null {
    return this.previousState;
  }

  /**
   * Verifica se está em um estado específico
   */
  is(state: GameState): boolean {
    return this.currentState === state;
  }

  /**
   * Verifica se pode fazer transição para um novo estado
   */
  canTransitionTo(newState: GameState): boolean {
    const allowedStates = ALLOWED_TRANSITIONS[this.currentState];
    return allowedStates.includes(newState);
  }

  /**
   * Muda para um novo estado
   */
  transitionTo(newState: GameState): boolean {
    if (this.currentState === newState) {
      console.warn(`⚠️ Já está no estado ${newState}`);
      return false;
    }

    if (!this.canTransitionTo(newState)) {
      console.error(`❌ Transição inválida: ${this.currentState} → ${newState}`);
      return false;
    }

    const oldState = this.currentState;
    this.previousState = oldState;
    this.currentState = newState;

    console.log(`🔄 Transição: ${oldState} → ${newState}`);

    // Chama callbacks específicos do novo estado
    this.triggerStateCallbacks(newState);

    // Chama callback global
    if (this.onStateChange) {
      this.onStateChange(oldState, newState);
    }

    return true;
  }

  /**
   * Volta para o estado anterior
   */
  goBack(): boolean {
    if (!this.previousState) {
      console.warn('⚠️ Não há estado anterior');
      return false;
    }

    return this.transitionTo(this.previousState);
  }

  /**
   * Registra callback para um estado específico
   */
  onEnter(state: GameState, callback: () => void): void {
    if (!this.onStateChangeCallbacks.has(state)) {
      this.onStateChangeCallbacks.set(state, []);
    }

    this.onStateChangeCallbacks.get(state)!.push(callback);
  }

  /**
   * Remove todos os callbacks de um estado
   */
  clearCallbacks(state: GameState): void {
    this.onStateChangeCallbacks.delete(state);
  }

  /**
   * Dispara todos os callbacks de um estado
   */
  private triggerStateCallbacks(state: GameState): void {
    const callbacks = this.onStateChangeCallbacks.get(state);
    
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }

  /**
   * Reseta para o estado inicial
   */
  reset(): void {
    this.previousState = this.currentState;
    this.currentState = GameState.MENU;
    
    console.log('🔄 Estado resetado para MENU');
  }

  /**
   * Retorna informações de debug
   */
  getDebugInfo() {
    return {
      current: this.currentState,
      previous: this.previousState,
      allowedTransitions: ALLOWED_TRANSITIONS[this.currentState],
    };
  }
}