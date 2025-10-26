// ============================================
// 🐍 SNAKE - Lógica da Cobra
// ============================================

import { DIRECTIONS, COLORS } from '../../utils/constants';
import { isSamePosition, isPositionInList } from '../../utils/helpers';
import type { Position, Direction } from '../../types';
import type { Grid } from './Grid';

export class Snake {
  private grid: Grid;
  public body: Position[];
  private direction: Direction;
  private nextDirection: Direction;
  private justAte: boolean;

  constructor(grid: Grid) {
    this.grid = grid;
    this.body = [];
    this.direction = DIRECTIONS.RIGHT;
    this.nextDirection = DIRECTIONS.RIGHT;
    this.justAte = false;
    this.reset();
  }

  /**
   * Reseta a cobra para o estado inicial
   */
  reset(): void {
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
   * @param newDirection - Nova direção
   */
  setDirection(newDirection: Direction): void {
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
  move(): void {
    // Atualiza a direção atual (usa o buffer)
    this.direction = this.nextDirection;

    // Calcula a nova posição da cabeça
    const head = this.getHead();
    const newHead: Position = {
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
  eat(): void {
    this.justAte = true;
  }

  /**
   * Retorna a posição da cabeça
   * @returns Posição da cabeça
   */
  getHead(): Position {
    return this.body[0];
  }

  /**
   * Retorna o corpo sem a cabeça
   * @returns Array de posições do corpo
   */
  getBodyWithoutHead(): Position[] {
    return this.body.slice(1);
  }

  /**
   * Verifica se a cobra colidiu consigo mesma
   * @returns True se colidiu
   */
  checkSelfCollision(): boolean {
    const head = this.getHead();
    const body = this.getBodyWithoutHead();
    return isPositionInList(head, body);
  }

  /**
   * Verifica se a cobra colidiu com a parede
   * @returns True se colidiu
   */
  checkWallCollision(): boolean {
    const head = this.getHead();
    return !this.grid.isWithinBounds(head);
  }

  /**
   * Verifica se a cobra colidiu com algo (parede ou si mesma)
   * @returns True se colidiu
   */
  checkCollision(): boolean {
    return this.checkWallCollision() || this.checkSelfCollision();
  }

  /**
   * Desenha a cobra no canvas
   */
  draw(): void {
    // Desenha cada segmento do corpo
    this.body.forEach((segment, index) => {
      const isHead = index === 0;
      const color = isHead ? COLORS.snakeHead : COLORS.snake;
      this.grid.drawCell(segment, color, isHead);
    });
  }

  /**
   * Retorna o tamanho atual da cobra
   * @returns Tamanho da cobra
   */
  getLength(): number {
    return this.body.length;
  }
}