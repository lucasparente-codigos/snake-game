// ============================================
// 🎮 GAME ENGINE - Orquestrador do Jogo
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
  private gameLoopInterval: number | null;
  private isNewRecord: boolean;
  private highScore: number;
  
  // Animações
  private showLevelUpAnimation: boolean;
  private levelUpAnimationTime: number;
  private showPowerUpNotification: boolean;
  private powerUpNotificationText: string;
  private powerUpNotificationTime: number;

  constructor(canvas: HTMLCanvasElement, difficulty: Difficulty = 'medium') {
    this.canvas = canvas;
    
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
    this.gameLoopInterval = null;
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
        this.startGameLoop();
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
    this.startGameLoop();
    this.render();
    console.log('🎮 Jogo iniciado!');
    console.log('📊 Dificuldade:', this.scoreManager.difficulty);
  }

  private startGameLoop(): void {
    if (this.gameLoopInterval !== null) {
      clearInterval(this.gameLoopInterval);
    }

    let speed = this.scoreManager.getGameSpeed();
    const speedModifier = this.powerUpManager.getSpeedModifier();
    speed = Math.floor(speed * speedModifier);

    console.log(`🏃 Velocidade ajustada: ${speed}ms (modifier: ${speedModifier})`);

    this.gameLoopInterval = window.setInterval(() => {
      if (!this.isPaused && !this.isGameOver) {
        this.update();
        this.render();
      }
    }, speed);
  }

  stop(): void {
    if (this.gameLoopInterval !== null) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
    document.removeEventListener('keydown', this.handleKeyPress);
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
          this.startGameLoop();
        }
      }
    }
    
    const leveledUp = this.scoreManager.checkLevelUp();
    
    if (leveledUp) {
      this.showLevelUpAnimation = true;
      this.levelUpAnimationTime = Date.now();
      this.startGameLoop();
      console.log('🎉 LEVEL UP! Nível:', this.scoreManager.level);
    }
    
    console.log(`🍎 Comeu ${foodType.name}: +${points} pontos (Total: ${this.scoreManager.score})`);
    
    this.food.spawn(this.snake.body);
  }

  private render(): void {
    this.grid.draw();
    this.food.draw();
    this.snake.draw();
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

    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = 'bold 40px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'GAME OVER',
      this.canvas.width / 2,
      this.canvas.height / 2 - 60
    );

    this.ctx.font = 'bold 20px monospace';
    this.ctx.fillText(
      `Score: ${stats.score}`,
      this.canvas.width / 2,
      this.canvas.height / 2 - 20
    );

    this.ctx.font = '16px monospace';
    this.ctx.fillStyle = '#aaa';
    this.ctx.fillText(
      `Level: ${stats.level}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 10
    );

    this.ctx.fillText(
      `Food: ${stats.foodEaten}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 35
    );

    if (this.isNewRecord) {
      this.ctx.fillStyle = COLORS.snakeHead;
      this.ctx.font = 'bold 18px monospace';
      this.ctx.fillText(
        '🏆 NEW RECORD!',
        this.canvas.width / 2,
        this.canvas.height / 2 + 65
      );
    }

    this.ctx.fillStyle = '#666';
    this.ctx.font = '14px monospace';
    this.ctx.fillText(
      'Press SPACE to restart',
      this.canvas.width / 2,
      this.canvas.height / 2 + 100
    );
  }

  private drawPaused(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = 'bold 32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'PAUSED',
      this.canvas.width / 2,
      this.canvas.height / 2
    );

    this.ctx.font = '14px monospace';
    this.ctx.fillStyle = '#888';
    this.ctx.fillText(
      'Press ESC or P to resume',
      this.canvas.width / 2,
      this.canvas.height / 2 + 30
    );
  }

  private handleKeyPress(event: KeyboardEvent): void {
    const key = event.key;

    if (key.startsWith('Arrow')) {
      event.preventDefault();
    }

    if (this.isGameOver) {
      if (key === ' ') {
        this.restart();
      }
      return;
    }

    if (key === 'Escape' || key === 'p' || key === 'P') {
      this.togglePause();
      return;
    }

    const direction = KEYS[key];
    if (direction && !this.isPaused) {
      this.snake.setDirection(DIRECTIONS[direction]);
    }
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      this.scoreManager.resetCombo();
      this.powerUpManager.pause();
      this.render();
    } else {
      this.powerUpManager.resume();
    }
  }

  private gameOver(): void {
    this.isGameOver = true;

    const stats = this.scoreManager.getStats();

    StorageManager.incrementGamesPlayed();
    StorageManager.saveBestStreak(stats.currentStreak);
    this.isNewRecord = StorageManager.saveHighScore(stats.score);
    this.powerUpManager.clearAll();

    console.log('📊 Estatísticas da partida:', stats);
    console.log('📊 Estatísticas globais:', StorageManager.getAllStats());
  }

  restart(): void {
    this.isGameOver = false;
    this.isPaused = false;
    this.isNewRecord = false;
    this.showLevelUpAnimation = false;
    this.showPowerUpNotification = false;
    
    this.snake.reset();
    this.scoreManager.reset();
    this.powerUpManager.clearAll();
    this.food.spawn(this.snake.body);
    
    this.highScore = StorageManager.getHighScore();
    this.startGameLoop();
    this.render();
  }

  getScore(): number {
    return this.scoreManager.score;
  }

  getStats() {
    return {
      ...this.scoreManager.getStats(),
      highScore: this.highScore,
      globalStats: StorageManager.getAllStats(),
      powerUps: this.powerUpManager.getDebugInfo(),
    };
  }
}