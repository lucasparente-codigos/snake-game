import { COLORS } from '../utils/constants.js';
import { isPositionInList } from '../utils/helpers.js';

// ============================================
// 🍎 FOOD - Lógica da Comida
// ============================================

export class Food {
  constructor(grid) {
    this.grid = grid;
    this.position = null;
  }

  /**
   * Gera uma nova posição para a comida
   * Garante que não spawna em cima da cobra
   * @param {Array} snakeBody - Array com as posições da cobra
   */
  spawn(snakeBody) {
    let newPosition;
    let attempts = 0;
    const maxAttempts = 100;

    // Tenta encontrar uma posição válida
    do {
      newPosition = this.grid.getRandomPosition();
      attempts++;

      // Previne loop infinito (caso improvável do grid estar cheio)
      if (attempts >= maxAttempts) {
        console.warn('Não conseguiu encontrar posição válida para a comida');
        break;
      }
    } while (isPositionInList(newPosition, snakeBody));

    this.position = newPosition;
  }

  /**
   * Verifica se a comida foi comida pela cobra
   * @param {Object} snakeHead - Posição da cabeça da cobra {x, y}
   * @returns {boolean} True se foi comida
   */
  isEaten(snakeHead) {
    if (!this.position) return false;

    return (
      snakeHead.x === this.position.x &&
      snakeHead.y === this.position.y
    );
  }

  /**
   * Desenha a comida no canvas
   */
  draw() {
    if (!this.position) return;

    // Desenha a comida como um círculo (diferente da cobra quadrada)
    const pixelX = this.position.x * this.grid.cellSize;
    const pixelY = this.position.y * this.grid.cellSize;
    const centerX = pixelX + this.grid.cellSize / 2;
    const centerY = pixelY + this.grid.cellSize / 2;
    const radius = this.grid.cellSize / 3;

    const ctx = this.grid.ctx;

    // Desenha círculo principal
    ctx.fillStyle = COLORS.food;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Adiciona um brilho (efeito visual)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(
      centerX - radius / 3,
      centerY - radius / 3,
      radius / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  /**
   * Retorna a posição atual da comida
   * @returns {Object|null} Posição {x, y} ou null
   */
  getPosition() {
    return this.position;
  }
}