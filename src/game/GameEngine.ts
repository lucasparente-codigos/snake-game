// ============================================
// 🎮 GAME ENGINE - Tipos Principais
// ============================================

import { Grid } from './Grid';
import { Snake } from './Snake';
import { Food } from './Food';
import { DIRECTIONS, KEYS, COLORS } from '../utils/constants';
import { ScoreManager } from '../utils/ScoreManager';
import { StorageManager } from '../utils/StorageManager';
import { PowerUpManager } from '../utils/PowerUpManager';
import { calculateFoodPoints } from '../utils/foodTypes';
import type { Difficulty, DirectionName } from '../types';

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
  }

  private startGameLoop(): void {
    if (this.gameLoopInterval !== null) {
      clearInterval(this.gameLoopInterval);
    }

    let speed = this.scoreManager.getGameSpeed();
    const speedModifier = this.powerUpManager.getSpeedModifier();
    speed = Math.floor(speed * speedModifier);

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
    this.scoreManager.lastEat