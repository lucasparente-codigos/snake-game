// ============================================
// 🎮 GAME CONTROLLER - Controlador Principal
// ============================================

import { GameEngine } from './GameEngine';
import { GameStateManager, GameState } from './GameStateManager';
import { MenuRenderer } from './MenuRenderer';
import { StorageManager } from '../utils/StorageManager';
import type { Difficulty, MenuItem } from '../types';

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
    this.transitionToMenu();
    
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
   * Transição para o menu principal
   */
  private transitionToMenu(): void {
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
        action: () => this.transitionToMenu(),
      },
    ];
    
    this.menuRenderer.setMenuItems(menuItems);
  }

  /**
   * Abre tela de estatísticas
   */
  private openStats(): void {
    this.stateManager.transitionTo(GameState.STATS);
  }

  /**
   * Inicia o jogo
   */
  private startGame(): void {
    console.log('🎮 Iniciando jogo...');
    
    this.stateManager.transitionTo(GameState.PLAYING);
    
    // Cria nova instância do game engine
    this.gameEngine = new GameEngine(this.canvas, this.difficulty);
    
    // Callback quando o jogo termina
    const originalGameOver = this.gameEngine['gameOver'].bind(this.gameEngine);
    this.gameEngine['gameOver'] = () => {
      originalGameOver();
      
      // Aguarda um momento antes de voltar ao menu
      setTimeout(() => {
        this.transitionToMenu();
      }, 3000); // 3 segundos pra ver a tela de game over
    };
    
    this.gameEngine.start();
  }

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
    
    // Se está jogando, delega pro GameEngine
    if (state === GameState.PLAYING) {
      return;
    }
    
    // Previne scroll
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
      event.preventDefault();
    }
    
    // Navegação no menu
    if (state === GameState.MENU || state === GameState.SETTINGS) {
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        this.menuRenderer.moveUp();
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        this.menuRenderer.moveDown();
      } else if (key === 'Enter' || key === ' ') {
        this.menuRenderer.select();
      }
    }
    
    // ESC volta para o menu
    if (key === 'Escape') {
      if (state === GameState.SETTINGS || state === GameState.STATS) {
        this.transitionToMenu();
      } else if (state === GameState.PLAYING && this.gameEngine) {
        // Para o jogo e volta pro menu
        this.gameEngine.stop();
        this.transitionToMenu();
      }
    }
  }
}