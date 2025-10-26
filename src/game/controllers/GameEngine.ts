// ============================================
// 🎮 GAME ENGINE - Orquestrador do Jogo
// Sugestões de Melhoria Aplicadas:
// - Uso de callback onGameOver para melhor encapsulamento.
// - Encapsulamento da lógica de setInterval em setGameLoop.
// - Renomeado gameLoopInterval para gameLoopTimerId.
// ============================================

import { Grid } from '../entities/Grid';
import { Snake } from '../entities/Snake';
import { Food } from '../entities/Food';
import { DIRECTIONS, KEYS, COLORS } from '../../utils/constants';
import { ScoreManager } from '../../utils/managers/ScoreManager';
import { StorageManager } from '../../utils/managers/StorageManager';
import { PowerUpManager } from '../../utils/managers/PowerUpManager';
import { calculateFoodPoints } from '../../utils/foodTypes';
import type { Difficulty } from '../../types';

// Tipo para o callback de Game Over
type GameOverCallback = (score: number, isNewRecord: boolean) => void;

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  // Componentes do jogo
  private grid: Grid;
  private snake: Snake;
  private food: Food;
  private scoreManager: ScoreManager;
  private powerUpManager: PowerUpManager;
  
  // Estado
  private isGameOver: boolean;
  private isPaused: boolean;
  private gameLoopTimerId: number | null; // Renomeado
  private isNewRecord: boolean;
  private highScore: number;
  
  // Callbacks
  private onGameOver: GameOverCallback;
  
  // Animações
  private showLevelUpAnimation: boolean;
  private levelUpAnimationTime: number;
  private showPowerUpNotification: boolean;
  private powerUpNotificationText: string;
  private powerUpNotificationTime: number;

  constructor(
    canvas: HTMLCanvasElement, 
    difficulty: Difficulty = 'medium',
    onGameOver: GameOverCallback // Recebe o callback no construtor
  ) {
    this.canvas = canvas;
    this.onGameOver = onGameOver;
    
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Não foi possível obter contexto 2D do canvas');
    }
    this.ctx = context;

    // Inicializa componentes
    this.grid = new Grid(canvas);
    this.snake = new Snake(this.grid);
    this.food = new Food(this.grid);
    this.scoreManager = new ScoreManager(difficulty);
    this.powerUpManager = new PowerUpManager();

    // Estado inicial
    this.isGameOver = false;
    this.isPaused = false;
    this.gameLoopTimerId = null;
    this.isNewRecord = false;
    this.showLevelUpAnimation = false;
    this.levelUpAnimationTime = 0;
    this.showPowerUpNotification = false;
    this.powerUpNotificationText = '';
    this.powerUpNotificationTime = 0;

    // Bind
    this.handleKeyPress = this.handleKeyPress.bind(this);
    
    // Callback power-up
    this.powerUpManager.onPowerUpExpired = (powerUpId: string) => {
      console.log(`⏰ Power-up expirou: ${powerUpId}`);
      if (powerUpId === 'slow_motion' || powerUpId === 'speed_boost') {
        this.setGameLoop(); // Reinicia o loop com a velocidade normal
      }
    };

    // Spawna primeira comida
    this.food.spawn(this.snake.body);
    
    // Carrega high score
    this.highScore = StorageManager.getHighScore();
    
    console.log('🎮 GameEngine inicializado!');
  }

  start(): void {
    document.addEventListener('keydown', this.handleKeyPress);
    this.setGameLoop();
    this.render();
    console.log('🎮 Jogo iniciado!');
    console.log('📊 Dificuldade:', this.scoreManager.difficulty);
  }

  stop(): void {
    if (this.gameLoopTimerId !== null) {
      clearInterval(this.gameLoopTimerId);
      this.gameLoopTimerId = null;
    }
    document.removeEventListener('keydown', this.handleKeyPress);
  }
  
  /**
   * Encapsula a lógica de iniciar/reiniciar o loop de jogo com a velocidade correta.
   */
  private setGameLoop(): void {
    if (this.gameLoopTimerId !== null) {
      clearInterval(this.gameLoopTimerId);
    }

    let speed = this.scoreManager.getGameSpeed();
    const speedModifier = this.powerUpManager.getSpeedModifier();
    speed = Math.floor(speed * speedModifier);

    console.log(`🏃 Velocidade ajustada: ${speed}ms (modifier: ${speedModifier})`);

    this.gameLoopTimerId = window.setInterval(() => {
      if (!this.isPaused && !this.isGameOver) {
        this.update();
        this.render();
      }
    }, speed);
  }

  private update(): void {
    this.snake.move();

    if (!this.powerUpManager.hasShield() && this.snake.checkCollision()) {
      this.gameOver();
      return;
    }

    if (this.food.isEaten(this.snake.getHead())) {
      this.handleFoodEaten();
    }
  }

  private handleFoodEaten(): void {
    this.snake.eat();
    
    const foodType = this.food.getType();
    const powerUp = this.food.getPowerUp();
    
    if (!foodType) return;
    
    const hasDoublePoints = this.powerUpManager.hasDoublePoints();
    const points = calculateFoodPoints(foodType, 1, hasDoublePoints);
    
    this.scoreManager.score += points;
    this.scoreManager.foodEaten++;
    this.scoreManager.currentStreak++;
    this.scoreManager.lastEatTime = Date.now();
    
    StorageManager.addFoodEaten(1);
    
    if (powerUp) {
      const activatedPowerUp = this.powerUpManager.activate(powerUp);
      
      if (activatedPowerUp) {
        this.showPowerUpNotification = true;
        this.powerUpNotificationText = `${activatedPowerUp.emoji} ${activatedPowerUp.name}!`;
        this.powerUpNotificationTime = Date.now();
        
        if (powerUp === 'slow_motion' || powerUp === 'speed_boost') {
          this.setGameLoop(); // Reinicia o loop com a nova velocidade
        }
      }
    }
    
    const leveledUp = this.scoreManager.checkLevelUp();
    
    if (leveledUp) {
      this.showLevelUpAnimation = true;
      this.levelUpAnimationTime = Date.now();
      this.setGameLoop(); // Reinicia o loop com a nova velocidade
      console.log('🎉 LEVEL UP! Nível:', this.scoreManager.level);
    }
    
    console.log(`🍎 Comeu ${foodType.name}: +${points} pontos (Total: ${this.scoreManager.score})`);
    
    this.food.spawn(this.snake.body);
  }

  private render(): void {
    // Renderização dos componentes principais
    this.grid.draw();
    this.food.draw();
    this.snake.draw();
    
    // Renderização do HUD e Status
    this.drawHUD();
    this.drawActivePowerUps();

    if (this.showLevelUpAnimation) {
      this.drawLevelUpAnimation();
    }
    
    if (this.showPowerUpNotification) {
      this.drawPowerUpNotification();
    }

    if (this.isGameOver) {
      this.drawGameOver();
    }

    if (this.isPaused) {
      this.drawPaused();
    }
  }

  private drawHUD(): void {
    const stats = this.scoreManager.getStats();

    this.ctx.fillStyle = COLORS.text;
    this.ctx.textAlign = 'left';

    this.ctx.font = 'bold 16px monospace';
    this.ctx.fillText(`SCORE: ${stats.score}`, 10, 25);
    
    this.ctx.font = '12px monospace';
    this.ctx.fillStyle = '#888';
    this.ctx.fillText(`HIGH: ${this.highScore}`, 10, 42);

    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = 'bold 16px monospace';
    this.ctx.fillText(`LEVEL: ${stats.level}`, 10, 65);
    
    if (!stats.isMaxLevel) {
      const barX = 10;
      const barY = 72;
      const barWidth = 100;
      const barHeight = 4;
      const progress = stats.levelProgress;

      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(barX, barY, barWidth, barHeight);

      this.ctx.fillStyle = COLORS.text;
      this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    }

    if (stats.currentStreak > 1) {
      this.ctx.textAlign = 'right';
      this.ctx.font = 'bold 20px monospace';
      this.ctx.fillStyle = COLORS.snakeHead;
      this.ctx.fillText(`COMBO x${stats.currentStreak}`, this.canvas.width - 10, 30);
    }

    this.ctx.textAlign = 'right';
    this.ctx.font = '10px monospace';
    this.ctx.fillStyle = '#666';
    this.ctx.fillText(
      stats.difficulty.toUpperCase(),
      this.canvas.width - 10,
      this.canvas.height - 10
    );
  }
  
  private drawActivePowerUps(): void {
    const activePowerUps = this.powerUpManager.getActivePowerUps();
    
    if (activePowerUps.length === 0) return;
    
    const startX = this.canvas.width - 10;
    const startY = 60;
    const spacing = 35;
    
    activePowerUps.forEach((powerUp, index) => {
      const y = startY + (index * spacing);
      const timeRemaining = this.powerUpManager.getTimeRemaining(powerUp.id);
      const progress = 1 - this.powerUpManager.getProgress(powerUp.id);
      
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(startX - 60, y, 60, 20);
      
      this.ctx.fillStyle = powerUp.color;
      this.ctx.globalAlpha = 0.7;
      this.ctx.fillRect(startX - 60, y, 60 * progress, 20);
      this.ctx.globalAlpha = 1;
      
      this.ctx.fillStyle = COLORS.text;
      this.ctx.font = '16px monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(powerUp.emoji, startX - 55, y + 15);
      
      this.ctx.font = '10px monospace';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(
        `${Math.ceil(timeRemaining / 1000)}s`,
        startX - 5,
        y + 14
      );
    });
  }

  private drawLevelUpAnimation(): void {
    const elapsed = Date.now() - this.levelUpAnimationTime;
    const duration = 1500;

    if (elapsed > duration) {
      this.showLevelUpAnimation = false;
      return;
    }

    const opacity = Math.max(0, 1 - (elapsed / duration));

    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = 'bold 36px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'LEVEL UP!',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    this.ctx.restore();
  }
  
  private drawPowerUpNotification(): void {
    const elapsed = Date.now() - this.powerUpNotificationTime;
    const duration = 2000;

    if (elapsed > duration) {
      this.showPowerUpNotification = false;
      return;
    }

    const progress = elapsed / duration;
    const opacity = Math.max(0, 1 - progress);
    const yOffset = progress * 30;

    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = '#ffd43b';
    this.ctx.font = 'bold 24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      this.powerUpNotificationText,
      this.canvas.width / 2,
      this.canvas.height / 2 + 50 - yOffset
    );
    this.ctx.restore();
  }

  private drawGameOver(): void {
    const stats = this.scoreManager.getStats();

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = 'bold 48px monospace';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);

    this.ctx.font = 'bold 24px monospace';
    this.ctx.fillText(`SCORE: ${stats.score}`, this.canvas.width / 2, this.canvas.height / 2);
    
    if (this.isNewRecord) {
      this.ctx.fillStyle = '#ffd43b';
      this.ctx.font = 'bold 20px monospace';
      this.ctx.fillText('NEW HIGH SCORE!', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }

    this.ctx.fillStyle = '#888';
    this.ctx.font = '16px monospace';
    this.ctx.fillText('Voltando ao Menu em 3 segundos...', this.canvas.width / 2, this.canvas.height / 2 + 100);
  }

  private drawPaused(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = 'bold 48px monospace';
    this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);

    this.ctx.fillStyle = '#888';
    this.ctx.font = '16px monospace';
    this.ctx.fillText('Pressione ESPAÇO para continuar', this.canvas.width / 2, this.canvas.height / 2 + 50);
  }

  private gameOver(): void {
    if (this.isGameOver) return;

    this.isGameOver = true;
    this.stop(); // Para o loop de jogo

    const finalScore = this.scoreManager.score;
    this.isNewRecord = StorageManager.saveHighScore(finalScore);
    
    // Salva estatísticas de jogo
    StorageManager.incrementGamesPlayed();
    // Não existe um método addScore no StorageManager. Vamos remover a chamada.
    
    console.log(`💀 GAME OVER. Score: ${finalScore}. Novo Recorde: ${this.isNewRecord}`);
    
    // Renderiza a tela de Game Over imediatamente
    this.render();

    // Chama o callback para o GameController lidar com a transição de estado
    this.onGameOver(finalScore, this.isNewRecord);
  }

  private handleKeyPress(event: KeyboardEvent): void {
    const key = event.key;
    
    // Previne scroll com as setas e espaço
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
      event.preventDefault();
    }

    if (this.isGameOver) return;

    if (key === ' ' && !this.isGameOver) {
      this.isPaused = !this.isPaused;
      this.render();
      console.log(`⏸️ Jogo ${this.isPaused ? 'pausado' : 'retomado'}`);
      return;
    }

    if (this.isPaused) return;

    const direction = KEYS[key as keyof typeof KEYS];
    if (direction) {
      this.snake.setDirection(DIRECTIONS[direction]);
    }
  }
}
