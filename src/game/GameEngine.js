import { Grid } from './Grid.js';
import { Snake } from './Snake.js';
import { Food } from './Food.js';
import { GAME_SPEED, DIRECTIONS, KEYS, COLORS } from '../utils/constants.js';

// ============================================
// 🎮 GAME ENGINE - Orquestrador do Jogo
// ============================================

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Inicializa os componentes
    this.grid = new Grid(canvas);
    this.snake = new Snake(this.grid);
    this.food = new Food(this.grid);

    // Estado do jogo
    this.score = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.gameLoopInterval = null;

    // Bind dos métodos (necessário para event listeners)
    this.handleKeyPress = this.handleKeyPress.bind(this);

    // Spawna a primeira comida
    this.food.spawn(this.snake.body);
  }

  /**
   * Inicia o jogo
   */
  start() {
    // Adiciona listener de teclado
    document.addEventListener('keydown', this.handleKeyPress);

    // Inicia o game loop
    this.gameLoopInterval = setInterval(() => {
      if (!this.isPaused && !this.isGameOver) {
        this.update();
        this.render();
      }
    }, GAME_SPEED);

    // Renderiza o primeiro frame
    this.render();
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
      this.snake.eat();
      this.score += 10;
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

    // Desenha o HUD (score, etc)
    this.drawHUD();

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
   * Desenha o HUD (pontuação)
   */
  drawHUD() {
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    this.ctx.fillText(`Length: ${this.snake.getLength()}`, 10, 55);
  }

  /**
   * Desenha a tela de Game Over
   */
  drawGameOver() {
    // Overlay semi-transparente
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Texto "GAME OVER"
    this.ctx.fillStyle = COLORS.snakeHead;
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'GAME OVER',
      this.canvas.width / 2,
      this.canvas.height / 2 - 40
    );

    // Score final
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText(
      `Final Score: ${this.score}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 10
    );

    // Instruções
    this.ctx.font = '18px Arial';
    this.ctx.fillText(
      'Press SPACE to restart',
      this.canvas.width / 2,
      this.canvas.height / 2 + 50
    );
  }

  /**
   * Desenha o indicador de pausa
   */
  drawPaused() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'PAUSED',
      this.canvas.width / 2,
      this.canvas.height / 2
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
      this.render(); // Renderiza o estado de pausa
    }
  }

  /**
   * Marca o fim do jogo
   */
  gameOver() {
    this.isGameOver = true;
  }

  /**
   * Reinicia o jogo
   */
  restart() {
    this.score = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.snake.reset();
    this.food.spawn(this.snake.body);
    this.render();
  }

  /**
   * Retorna o score atual
   */
  getScore() {
    return this.score;
  }
}