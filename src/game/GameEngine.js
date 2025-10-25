import { Grid } from './Grid.js';
import { Snake } from './Snake.js';
import { Food } from './Food.js';
import { DIRECTIONS, KEYS, COLORS } from '../utils/constants.js';
import { ScoreManager } from '../utils/ScoreManager.js';
import { StorageManager } from '../utils/StorageManager.js';

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

    // Estado do jogo
    this.isGameOver = false;
    this.isPaused = false;
    this.gameLoopInterval = null;
    this.isNewRecord = false;

    // Animação de level up
    this.showLevelUpAnimation = false;
    this.levelUpAnimationTime = 0;

    // Bind dos métodos
    this.handleKeyPress = this.handleKeyPress.bind(this);

    // Spawna a primeira comida
    this.food.spawn(this.snake.body);

    // Carrega high score
    this.highScore = StorageManager.getHighScore();
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

    // Pega a velocidade atual do ScoreManager
    const speed = this.scoreManager.getGameSpeed();

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

    // Verifica colisões
    if (this.snake.checkCollision()) {
      this.gameOver();
      return;
    }

    // Verifica se comeu a comida
    if (this.food.isEaten(this.snake.getHead())) {
      // Marca que a cobra comeu
      this.snake.eat();

      // Atualiza pontuação e recebe feedback
      const scoreInfo = this.scoreManager.eatFood();

      // Atualiza estatísticas globais
      StorageManager.addFoodEaten(1);

      // Se subiu de nível, reinicia o loop com nova velocidade
      if (scoreInfo.leveledUp) {
        this.showLevelUpAnimation = true;
        this.levelUpAnimationTime = Date.now();
        this.startGameLoop(); // Atualiza velocidade!
        console.log('🎉 LEVEL UP! Nível:', scoreInfo.currentLevel);
      }

      // Log de combo (debug)
      if (scoreInfo.isCombo) {
        console.log('🔥 COMBO x' + scoreInfo.comboStreak);
      }

      // Spawna nova comida
      this.food.spawn(this.snake.body);
    }
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

    // Animação de Level Up
    if (this.showLevelUpAnimation) {
      this.drawLevelUpAnimation();
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
      this.render();
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
    
    this.snake.reset();
    this.scoreManager.reset();
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
    };
  }
}