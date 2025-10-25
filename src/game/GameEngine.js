import { Grid } from './Grid.js';
import { Snake } from './Snake.js';
import { Food } from './Food.js';
import { DIRECTIONS, KEYS, COLORS } from '../utils/constants.js';
import { ScoreManager } from '../utils/ScoreManager.js';
import { StorageManager } from '../utils/StorageManager.js';
import { PowerUpManager } from '../utils/PowerUpManager.js';
import { calculateFoodPoints } from '../utils/foodTypes.js';

// ============================================
// 🎮 GAME ENGINE - Orquestrador do Jogo
// ============================================

export class GameEngine {
  constructor(canvas, difficulty = 'medium') {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Inicializa os componentes
    this.grid = new Grid(canvas);
    this.snake = new Snake(this.grid);
    this.food = new Food(this.grid);
    this.scoreManager = new ScoreManager(difficulty);
    this.powerUpManager = new PowerUpManager();

    // Estado do jogo
    this.isGameOver = false;
    this.isPaused = false;
    this.gameLoopInterval = null;
    this.isNewRecord = false;

    // Animação de level up
    this.showLevelUpAnimation = false;
    this.levelUpAnimationTime = 0;
    
    // Animação de power-up coletado
    this.showPowerUpNotification = false;
    this.powerUpNotificationText = '';
    this.powerUpNotificationTime = 0;

    // Bind dos métodos
    this.handleKeyPress = this.handleKeyPress.bind(this);
    
    // Callback quando power-up expira
    this.powerUpManager.onPowerUpExpired = (powerUpId) => {
      console.log(`⏰ Power-up expirou: ${powerUpId}`);
      // Se era slow motion ou speed boost, ajusta velocidade
      if (powerUpId === 'slow_motion' || powerUpId === 'speed_boost') {
        this.startGameLoop();
      }
    };

    // Spawna a primeira comida
    this.food.spawn(this.snake.body);

    // Carrega high score
    this.highScore = StorageManager.getHighScore();
    
    console.log('🎮 GameEngine inicializado!');
  }

  /**
   * Inicia o jogo
   */
  start() {
    // Adiciona listener de teclado
    document.addEventListener('keydown', this.handleKeyPress);

    // Inicia o game loop com velocidade dinâmica
    this.startGameLoop();

    // Renderiza o primeiro frame
    this.render();

    console.log('🎮 Jogo iniciado!');
    console.log('📊 Dificuldade:', this.scoreManager.difficulty);
  }

  /**
   * Inicia/reinicia o game loop com velocidade atualizada
   */
  startGameLoop() {
    // Limpa o loop anterior se existir
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
    }

    // Pega a velocidade base do ScoreManager
    let speed = this.scoreManager.getGameSpeed();
    
    // Aplica modificador de power-ups
    const speedModifier = this.powerUpManager.getSpeedModifier();
    speed = Math.floor(speed * speedModifier);

    console.log(`🏃 Velocidade ajustada: ${speed}ms (modifier: ${speedModifier})`);

    // Inicia novo loop
    this.gameLoopInterval = setInterval(() => {
      if (!this.isPaused && !this.isGameOver) {
        this.update();
        this.render();
      }
    }, speed);
  }

  /**
   * Para o jogo e limpa recursos
   */
  stop() {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
    document.removeEventListener('keydown', this.handleKeyPress);
  }

  /**
   * Atualiza a lógica do jogo (executado a cada frame)
   */
  update() {
    // Move a cobra
    this.snake.move();

    // Verifica colisões (a não ser que tenha shield)
    if (!this.powerUpManager.hasShield() && this.snake.checkCollision()) {
      this.gameOver();
      return;
    }

    // Verifica se comeu a comida
    if (this.food.isEaten(this.snake.getHead())) {
      this.handleFoodEaten();
    }
  }

  /**
   * Processa quando a cobra come a comida
   */
  handleFoodEaten() {
    // Marca que a cobra comeu
    this.snake.eat();
    
    // Pega informações da comida
    const foodType = this.food.getType();
    const powerUp = this.food.getPowerUp();
    
    // Calcula pontos considerando tipo de comida e power-ups
    const hasDoublePoints = this.powerUpManager.hasDoublePoints();
    const levelMultiplier = 1; // Pode adicionar multiplicador de nível aqui
    const points = calculateFoodPoints(foodType, levelMultiplier, hasDoublePoints);
    
    // Adiciona pontos manualmente (não usa eatFood do ScoreManager)
    this.scoreManager.score += points;
    this.scoreManager.foodEaten++;
    this.scoreManager.currentStreak++;
    
    // Atualiza tempo para combo
    this.scoreManager.lastEatTime = Date.now();
    
    // Atualiza estatísticas globais
    StorageManager.addFoodEaten(1);
    
    // Se a comida tem power-up, ativa
    if (powerUp) {
      const activatedPowerUp = this.powerUpManager.activate(powerUp);
      
      if (activatedPowerUp) {
        // Mostra notificação
        this.showPowerUpNotification = true;
        this.powerUpNotificationText = `${activatedPowerUp.emoji} ${activatedPowerUp.name}!`;
        this.powerUpNotificationTime = Date.now();
        
        // Se é slow motion ou speed boost, ajusta velocidade
        if (powerUp === 'slow_motion' || powerUp === 'speed_boost') {
          this.startGameLoop();
        }
      }
    }
    
    // Verifica se subiu de nível
    const leveledUp = this.scoreManager.checkLevelUp();
    
    if (leveledUp) {
      this.showLevelUpAnimation = true;
      this.levelUpAnimationTime = Date.now();
      this.startGameLoop(); // Atualiza velocidade!
      console.log('🎉 LEVEL UP! Nível:', this.scoreManager.level);
    }
    
    // Log de informações
    console.log(`🍎 Comeu ${foodType.name}: +${points} pontos (Total: ${this.scoreManager.score})`);
    
    // Spawna nova comida
    this.food.spawn(this.snake.body);
  }

  /**
   * Renderiza tudo na tela
   */
  render() {
    // Limpa e desenha o grid
    this.grid.draw();

    // Desenha a comida
    this.food.draw();

    // Desenha a cobra
    this.snake.draw();

    // Desenha o HUD (score, nível, etc)
    this.drawHUD();
    
    // Desenha power-ups ativos
    this.drawActivePowerUps();

    // Animação de Level Up
    if (this.showLevelUpAnimation) {
      this.drawLevelUpAnimation();
    }
    
    // Notificação de power-up coletado
    if (this.showPowerUpNotification) {
      this.drawPowerUpNotification();
    }

    // Se game over, desenha a tela de fim
    if (this.isGameOver) {
      this.drawGameOver();
    }

    // Se pausado, desenha indicador
    if (this.isPaused) {
      this.drawPaused();
    }
  }

  /**
   * Desenha o HUD (pontuação, nível, progresso)
   */
  drawHUD() {
    const stats = this.scoreManager.getStats();

    this.ctx.fillStyle = COLORS.text;
    this.ctx.textAlign = 'left';

    // Score e High Score
    this.ctx.font = 'bold 16px monospace';
    this.ctx.fillText(`SCORE: ${stats.score}`, 10, 25);
    
    this.ctx.font = '12px monospace';
    this.ctx.fillStyle = '#888';
    this.ctx.fillText(`HIGH: ${this.highScore}`, 10, 42);

    // Nível e velocidade
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = 'bold 16px monospace';
    this.ctx.fillText(`LEVEL: ${stats.level}`, 10, 65);
    
    // Barra de progresso do nível
    if (!stats.isMaxLevel) {
      const barX = 10;
      const barY = 72;
      const barWidth = 100;
      const barHeight = 4;
      const progress = stats.levelProgress;

      // Fundo da barra
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(barX, barY, barWidth, barHeight);

      // Progresso
      this.ctx.fillStyle = COLORS.text;
      this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    }

    // Combo streak (só mostra se tiver combo ativo)
    if (stats.currentStreak > 1) {
      this.ctx.textAlign = 'right';
      this.ctx.font = 'bold 20px monospace';
      this.ctx.fillStyle = COLORS.snakeHead;
      this.ctx.fillText(`COMBO x${stats.currentStreak}`, this.canvas.width - 10, 30);
    }

    // Informação de dificuldade (canto inferior direito)
    this.ctx.textAlign = 'right';
    this.ctx.font = '10px monospace';
    this.ctx.fillStyle = '#666';
    this.ctx.fillText(
      stats.difficulty.toUpperCase(),
      this.canvas.width - 10,
      this.canvas.height - 10
    );
  }
  
  /**
   * Desenha power-ups ativos no canto superior direito
   */
  drawActivePowerUps() {
    const activePowerUps = this.powerUpManager.getActivePowerUps();
    
    if (activePowerUps.length === 0) return;
    
    const startX = this.canvas.width - 10;
    const startY = 60;
    const spacing = 35;
    
    activePowerUps.forEach((powerUp, index) => {
      const y = startY + (index * spacing);
      const timeRemaining = this.powerUpManager.getTimeRemaining(powerUp.id);
      const progress = 1 - this.powerUpManager.getProgress(powerUp.id);
      
      // Fundo da barra
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(startX - 60, y, 60, 20);
      
      // Progresso (barra que diminui)
      this.ctx.fillStyle = powerUp.color;
      this.ctx.globalAlpha = 0.7;
      this.ctx.fillRect(startX - 60, y, 60 * progress, 20);
      this.ctx.globalAlpha = 1;
      
      // Ícone do power-up
      this.ctx.fillStyle = COLORS.text;
      this.ctx.font = '16px monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(powerUp.emoji, startX - 55, y + 15);
      
      // Tempo restante
      this.ctx.font = '10px monospace';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(
        `${Math.ceil(timeRemaining / 1000)}s`,
        startX - 5,
        y + 14
      );
    });
  }

  /**
   * Desenha animação de Level Up
   */
  drawLevelUpAnimation() {
    const elapsed = Date.now() - this.levelUpAnimationTime;
    const duration = 1500; // 1.5 segundos

    if (elapsed > duration) {
      this.showLevelUpAnimation = false;
      return;
    }

    // Calcula opacidade (fade out)
    const opacity = Math.max(0, 1 - (elapsed / duration));

    // Salva contexto
    this.ctx.save();

    // Texto "LEVEL UP!"
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = 'bold 36px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'LEVEL UP!',
      this.canvas.width / 2,
      this.canvas.height / 2
    );

    // Restaura contexto
    this.ctx.restore();
  }
  
  /**
   * Desenha notificação de power-up coletado
   */
  drawPowerUpNotification() {
    const elapsed = Date.now() - this.powerUpNotificationTime;
    const duration = 2000; // 2 segundos

    if (elapsed > duration) {
      this.showPowerUpNotification = false;
      return;
    }

    // Calcula opacidade e movimento (sobe e desaparece)
    const progress = elapsed / duration;
    const opacity = Math.max(0, 1 - progress);
    const yOffset = progress * 30; // Sobe 30px

    // Salva contexto
    this.ctx.save();

    // Texto do power-up
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = '#ffd43b';
    this.ctx.font = 'bold 24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      this.powerUpNotificationText,
      this.canvas.width / 2,
      this.canvas.height / 2 + 50 - yOffset
    );

    // Restaura contexto
    this.ctx.restore();
  }

  /**
   * Desenha a tela de Game Over
   */
  drawGameOver() {
    const stats = this.scoreManager.getStats();

    // Overlay semi-transparente
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Texto "GAME OVER"
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = 'bold 40px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'GAME OVER',
      this.canvas.width / 2,
      this.canvas.height / 2 - 60
    );

    // Score final
    this.ctx.font = 'bold 20px monospace';
    this.ctx.fillText(
      `Score: ${stats.score}`,
      this.canvas.width / 2,
      this.canvas.height / 2 - 20
    );

    // Level alcançado
    this.ctx.font = '16px monospace';
    this.ctx.fillStyle = '#aaa';
    this.ctx.fillText(
      `Level: ${stats.level}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 10
    );

    // Comidas comidas
    this.ctx.fillText(
      `Food: ${stats.foodEaten}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 35
    );

    // Novo record!
    if (this.isNewRecord) {
      this.ctx.fillStyle = COLORS.snakeHead;
      this.ctx.font = 'bold 18px monospace';
      this.ctx.fillText(
        '🏆 NEW RECORD!',
        this.canvas.width / 2,
        this.canvas.height / 2 + 65
      );
    }

    // Instruções
    this.ctx.fillStyle = '#666';
    this.ctx.font = '14px monospace';
    this.ctx.fillText(
      'Press SPACE to restart',
      this.canvas.width / 2,
      this.canvas.height / 2 + 100
    );
  }

  /**
   * Desenha o indicador de pausa
   */
  drawPaused() {
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

  /**
   * Gerencia as teclas pressionadas
   */
  handleKeyPress(event) {
    const key = event.key;

    // Previne scroll da página com as setas
    if (key.startsWith('Arrow')) {
      event.preventDefault();
    }

    // Se game over, só aceita SPACE para reiniciar
    if (this.isGameOver) {
      if (key === ' ') {
        this.restart();
      }
      return;
    }

    // Pausa/Resume com ESC ou P
    if (key === 'Escape' || key === 'p' || key === 'P') {
      this.togglePause();
      return;
    }

    // Muda direção da cobra
    const direction = KEYS[key];
    if (direction && !this.isPaused) {
      this.snake.setDirection(DIRECTIONS[direction]);
    }
  }

  /**
   * Alterna entre pausado e não pausado
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      // Reseta combo ao pausar
      this.scoreManager.resetCombo();
      
      // Pausa power-ups
      this.powerUpManager.pause();
      
      this.render();
    } else {
      // Resume power-ups
      this.powerUpManager.resume();
    }
  }

  /**
   * Marca o fim do jogo
   */
  gameOver() {
    this.isGameOver = true;

    const stats = this.scoreManager.getStats();

    // Incrementa jogos jogados
    StorageManager.incrementGamesPlayed();

    // Salva melhor streak
    StorageManager.saveBestStreak(stats.currentStreak);

    // Tenta salvar high score
    this.isNewRecord = StorageManager.saveHighScore(stats.score);

    // Limpa power-ups
    this.powerUpManager.clearAll();

    // Log de estatísticas
    console.log('📊 Estatísticas da partida:', stats);
    console.log('📊 Estatísticas globais:', StorageManager.getAllStats());
  }

  /**
   * Reinicia o jogo
   */
  restart() {
    // Reseta componentes
    this.isGameOver = false;
    this.isPaused = false;
    this.isNewRecord = false;
    this.showLevelUpAnimation = false;
    this.showPowerUpNotification = false;
    
    this.snake.reset();
    this.scoreManager.reset();
    this.powerUpManager.clearAll();
    this.food.spawn(this.snake.body);
    
    // Atualiza high score
    this.highScore = StorageManager.getHighScore();
    
    // Reinicia loop com velocidade inicial
    this.startGameLoop();
    
    this.render();
  }

  /**
   * Retorna o score atual
   */
  getScore() {
    return this.scoreManager.score;
  }

  /**
   * Retorna estatísticas completas
   */
  getStats() {
    return {
      ...this.scoreManager.getStats(),
      highScore: this.highScore,
      globalStats: StorageManager.getAllStats(),
      powerUps: this.powerUpManager.getDebugInfo(),
    };
  }
}