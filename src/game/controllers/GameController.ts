// ============================================
// 🎮 GAME CONTROLLER - Controlador Principal
// Sugestões de Melhoria Aplicadas:
// - Uso do callback onGameOver do GameEngine para melhor encapsulamento.
// - Simplificação da lógica de menu.
// ============================================

import { GameEngine } from './GameEngine';
import { GameStateManager, GameState } from '../managers/GameStateManager';
import { MenuRenderer } from '../renderers/MenuRenderer';
import { StorageManager } from '../../utils/managers/StorageManager';
import type { Difficulty, MenuItem } from '../../types';

export class GameController {
  private canvas: HTMLCanvasElement;
  private gameEngine: GameEngine | null = null;
  private stateManager: GameStateManager;
  private menuRenderer: MenuRenderer;
  
  private difficulty: Difficulty = 'medium';
  private soundEnabled: boolean = false;
  private gridLinesEnabled: boolean = true;
  
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.stateManager = new GameStateManager(GameState.MENU);
    this.menuRenderer = new MenuRenderer(canvas);
    
    // Carrega configurações
    const settings = StorageManager.getSettings();
    this.difficulty = settings.difficulty;
    this.soundEnabled = settings.soundEnabled;
    this.gridLinesEnabled = settings.gridLinesEnabled;
    
    // Bind
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.gameLoop = this.gameLoop.bind(this);
    
    // Setup callbacks de estado
    this.setupStateCallbacks();
    
    console.log('🎮 GameController inicializado');
  }

  /**
   * Inicia o controller
   */
  start(): void {
    document.addEventListener('keydown', this.handleKeyPress);
    
    // Inicia no menu
    this.navigateToMenu();
    
    // Inicia o loop de renderização
    this.startGameLoop();
    
    console.log('✅ GameController iniciado');
  }

  /**
   * Para o controller
   */
  stop(): void {
    document.removeEventListener('keydown', this.handleKeyPress);
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    if (this.gameEngine) {
      this.gameEngine.stop();
    }
  }

  /**
   * Loop principal de renderização
   */
  private gameLoop(): void {
    const currentState = this.stateManager.getCurrentState();
    
    // Se está jogando, o GameEngine renderiza sozinho
    if (currentState !== GameState.PLAYING) {
      this.render();
    }
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  /**
   * Inicia o loop
   */
  private startGameLoop(): void {
    this.gameLoop();
  }

  /**
   * Renderiza o estado atual
   */
  private render(): void {
    const state = this.stateManager.getCurrentState();
    const stats = StorageManager.getAllStats();
    
    switch (state) {
      case GameState.MENU:
        this.menuRenderer.updateAnimations();
        this.menuRenderer.renderMainMenu(stats);
        break;
        
      case GameState.STATS:
        this.menuRenderer.renderStatsScreen(stats);
        break;
        
      case GameState.SETTINGS:
        this.menuRenderer.renderSettingsScreen({
          difficulty: this.difficulty,
          soundEnabled: this.soundEnabled,
          gridLinesEnabled: this.gridLinesEnabled,
        });
        break;
    }
  }

  /**
   * Configura callbacks para mudanças de estado
   */
  private setupStateCallbacks(): void {
    this.stateManager.onStateChange = (from, to) => {
      console.log(`🔄 Estado mudou: ${from} → ${to}`);
      
      // Quando sai do jogo, para o engine
      if (from === GameState.PLAYING && this.gameEngine) {
        this.gameEngine.stop();
      }
    };
  }

  /**
   * Navega para o menu principal
   */
  private navigateToMenu(): void {
    this.stateManager.transitionTo(GameState.MENU);
    
    const menuItems: MenuItem[] = [
      {
        text: 'PLAY',
        action: () => this.startGame(),
      },
      {
        text: 'SETTINGS',
        action: () => this.openSettings(),
      },
      {
        text: 'STATISTICS',
        action: () => this.openStats(),
      },
    ];
    
    this.menuRenderer.setMenuItems(menuItems);
  }

  /**
   * Abre tela de configurações
   */
  private openSettings(): void {
    this.stateManager.transitionTo(GameState.SETTINGS);
    
    const menuItems: MenuItem[] = [
      {
        text: `Difficulty: ${this.difficulty.toUpperCase()}`,
        action: () => this.cycleDifficulty(),
      },
      {
        text: `Sound: ${this.soundEnabled ? 'ON' : 'OFF'}`,
        action: () => this.toggleSound(),
      },
      {
        text: `Grid Lines: ${this.gridLinesEnabled ? 'ON' : 'OFF'}`,
        action: () => this.toggleGridLines(),
      },
      {
        text: 'BACK',
        action: () => this.navigateToMenu(),
      },
    ];
    
    this.menuRenderer.setMenuItems(menuItems);
  }

  /**
   * Abre tela de estatísticas
   */
  private openStats(): void {
    this.stateManager.transitionTo(GameState.STATS);
    
    // O MenuRenderer lida com a renderização, mas precisamos definir os itens
    // para que a navegação por teclado funcione (tecla ESC para voltar)
    const menuItems: MenuItem[] = [
      {
        text: 'BACK',
        action: () => this.navigateToMenu(),
      },
    ];
    this.menuRenderer.setMenuItems(menuItems);
  }

  /**
   * Inicia o jogo
   */
  private startGame(): void {
    console.log('🎮 Iniciando jogo...');
    
    this.stateManager.transitionTo(GameState.PLAYING);
    
    // Cria nova instância do game engine, passando o callback de Game Over
    this.gameEngine = new GameEngine(this.canvas, this.difficulty, this.handleGameOver);
    
    this.gameEngine.start();
  }

  /**
   * Callback chamado pelo GameEngine quando o jogo termina (Game Over).
   */
  private handleGameOver = (finalScore: number, isNewRecord: boolean): void => {
    console.log(`💀 Game Over tratado pelo Controller. Score: ${finalScore}. Novo Recorde: ${isNewRecord}`);
    
    // Aguarda um momento para o jogador ver a tela de Game Over
    setTimeout(() => {
      this.navigateToMenu();
    }, 3000); // 3 segundos
  };

  /**
   * Alterna dificuldade
   */
  private cycleDifficulty(): void {
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
    const currentIndex = difficulties.indexOf(this.difficulty);
    const nextIndex = (currentIndex + 1) % difficulties.length;
    
    this.difficulty = difficulties[nextIndex];
    this.saveSettings();
    
    // Atualiza menu
    this.openSettings();
  }

  /**
   * Alterna som
   */
  private toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    this.saveSettings();
    this.openSettings();
  }

  /**
   * Alterna linhas do grid
   */
  private toggleGridLines(): void {
    this.gridLinesEnabled = !this.gridLinesEnabled;
    this.saveSettings();
    this.openSettings();
  }

  /**
   * Salva configurações
   */
  private saveSettings(): void {
    StorageManager.saveSettings({
      difficulty: this.difficulty,
      soundEnabled: this.soundEnabled,
      gridLinesEnabled: this.gridLinesEnabled,
    });
    
    console.log('💾 Configurações salvas');
  }

  /**
   * Gerencia teclas pressionadas
   */
  private handleKeyPress(event: KeyboardEvent): void {
    const key = event.key;
    const state = this.stateManager.getCurrentState();
    
    // Previne scroll com as setas e espaço
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
      event.preventDefault();
    }
    
    // ============================================
    // 🎮 ESTADO: PLAYING
    // ============================================
    if (state === GameState.PLAYING) {
      // ESC: Para o jogo e volta pro menu
      if (key === 'Escape' && this.gameEngine) {
        this.gameEngine.stop();
        this.navigateToMenu();
      }
      
      // Outras teclas: GameEngine cuida (movimento da cobra, pausa)
      return;
    }
    
    // ============================================
    // 🎯 ESTADO: MENU, SETTINGS ou STATS
    // ============================================
    if (state === GameState.MENU || state === GameState.SETTINGS || state === GameState.STATS) {
      // Navegação vertical
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        this.menuRenderer.moveUp();
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        this.menuRenderer.moveDown();
      }
      // Seleção
      else if (key === 'Enter' || key === ' ') {
        this.menuRenderer.select();
      }
    }
    
    // ============================================
    // ⬅️ ESC: Volta para o menu
    // ============================================
    if (key === 'Escape') {
      if (state === GameState.SETTINGS || state === GameState.STATS) {
        this.navigateToMenu();
      }
      // Nota: PLAYING já foi tratado acima
    }
  }
}
