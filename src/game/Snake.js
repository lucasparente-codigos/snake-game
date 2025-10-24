import { DIRECTIONS, COLORS } from '../utils/constants.js';
import { isSamePosition, isPositionInList } from '../utils/helpers.js';

// ============================================
// 🐍 SNAKE - Lógica da Cobra
// ============================================

export class Snake {
  constructor(grid) {
    this.grid = grid;
    this.reset();
  }

  /**
   * Reseta a cobra para o estado inicial
   */
  reset() {
    // Posição inicial no centro do grid
    const center = Math.floor(this.grid.gridSize / 2);
    
    // Corpo da cobra (array de posições)
    // Começa com 3 segmentos
    this.body = [
      { x: center, y: center },     // Cabeça
      { x: center - 1, y: center }, // Corpo
      { x: center - 2, y: center }, // Cauda
    ];

    // Direção inicial (movendo para direita)
    this.direction = DIRECTIONS.RIGHT;
    
    // Próxima direção (buffer para evitar viradas impossíveis)
    this.nextDirection = DIRECTIONS.RIGHT;
    
    // Flag que indica se a cobra cresceu neste frame
    this.justAte = false;
  }

  /**
   * Muda a direção da cobra
   * @param {Object} newDirection - Nova direção {x, y}
   */
  setDirection(newDirection) {
    // Impede virar 180° (não pode ir pra direção oposta)
    const isOpposite = 
      this.direction.x + newDirection.x === 0 &&
      this.direction.y + newDirection.y === 0;

    if (!isOpposite) {
      this.nextDirection = newDirection;
    }
  }

  /**
   * Move a cobra uma célula na direção atual
   */
  move() {
    // Atualiza a direção atual (usa o buffer)
    this.direction = this.nextDirection;

    // Calcula a nova posição da cabeça
    const head = this.getHead();
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y,
    };

    // Adiciona a nova cabeça no início do array
    this.body.unshift(newHead);

    // Se não comeu, remove a cauda (mantém o tamanho)
    // Se comeu, mantém a cauda (cobra cresce)
    if (!this.justAte) {
      this.body.pop();
    } else {
      this.justAte = false;
    }
  }

  /**
   * Marca que a cobra comeu (vai crescer no próximo movimento)
   */
  eat() {
    this.justAte = true;
  }

  /**
   * Retorna a posição da cabeça
   * @returns {Object} Posição da cabeça {x, y}
   */
  getHead() {
    return this.body[0];
  }

  /**
   * Retorna o corpo sem a cabeça
   * @returns {Array} Array de posições do corpo
   */
  getBodyWithoutHead() {
    return this.body.slice(1);
  }

  /**
   * Verifica se a cobra colidiu consigo mesma
   * @returns {boolean} True se colidiu
   */
  checkSelfCollision() {
    const head = this.getHead();
    const body = this.getBodyWithoutHead();
    return isPositionInList(head, body);
  }

  /**
   * Verifica se a cobra colidiu com a parede
   * @returns {boolean} True se colidiu
   */
  checkWallCollision() {
    const head = this.getHead();
    return !this.grid.isWithinBounds(head);
  }

  /**
   * Verifica se a cobra colidiu com algo (parede ou si mesma)
   * @returns {boolean} True se colidiu
   */
  checkCollision() {
    return this.checkWallCollision() || this.checkSelfCollision();
  }

  /**
   * Desenha a cobra no canvas
   */
  draw() {
    // Desenha cada segmento do corpo
    this.body.forEach((segment, index) => {
      const isHead = index === 0;
      const color = isHead ? COLORS.snakeHead : COLORS.snake;
      this.grid.drawCell(segment, color, isHead);
    });
  }

  /**
   * Retorna o tamanho atual da cobra
   * @returns {number} Tamanho da cobra
   */
  getLength() {
    return this.body.length;
  }
}