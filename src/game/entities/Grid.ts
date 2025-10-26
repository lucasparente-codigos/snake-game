// ============================================
// 🎲 GRID - Sistema de Coordenadas
// ============================================

import { GRID_SIZE, CELL_SIZE, COLORS } from '../utils/constants';
import { gridToPixel } from '../utils/helpers';
import type { Position } from '../types';

export class Grid {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public gridSize: number;
  public cellSize: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Não foi possível obter contexto 2D do canvas');
    }
    
    this.ctx = context;
    this.gridSize = GRID_SIZE;
    this.cellSize = CELL_SIZE;
  }

  /**
   * Desenha o fundo e as linhas do grid
   */
  draw(): void {
    // Limpa o canvas
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Desenha as linhas do grid (opcional, deixa o jogo mais "retrô")
    this.ctx.strokeStyle = COLORS.grid;
    this.ctx.lineWidth = 1;

    // Linhas verticais
    for (let x = 0; x <= this.gridSize; x++) {
      const pixelX = gridToPixel(x, this.cellSize);
      this.ctx.beginPath();
      this.ctx.moveTo(pixelX, 0);
      this.ctx.lineTo(pixelX, this.canvas.height);
      this.ctx.stroke();
    }

    // Linhas horizontais
    for (let y = 0; y <= this.gridSize; y++) {
      const pixelY = gridToPixel(y, this.cellSize);
      this.ctx.beginPath();
      this.ctx.moveTo(0, pixelY);
      this.ctx.lineTo(this.canvas.width, pixelY);
      this.ctx.stroke();
    }
  }

  /**
   * Desenha uma célula na posição do grid
   * @param position - Posição no grid
   * @param color - Cor da célula
   * @param isHead - Se é a cabeça da cobra (desenha diferente)
   */
  drawCell(position: Position, color: string, isHead: boolean = false): void {
    const pixelX = gridToPixel(position.x, this.cellSize);
    const pixelY = gridToPixel(position.y, this.cellSize);

    // Desenha a célula com um pequeno espaçamento (dá efeito de "blocos")
    const padding = 2;
    
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      pixelX + padding,
      pixelY + padding,
      this.cellSize - padding * 2,
      this.cellSize - padding * 2
    );

    // Se for a cabeça da cobra, adiciona um detalhe visual
    if (isHead) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.fillRect(
        pixelX + padding * 2,
        pixelY + padding * 2,
        this.cellSize - padding * 4,
        this.cellSize - padding * 4
      );
    }
  }

  /**
   * Verifica se uma posição está dentro dos limites do grid
   * @param position - Posição a verificar
   * @returns True se estiver dentro dos limites
   */
  isWithinBounds(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x < this.gridSize &&
      position.y >= 0 &&
      position.y < this.gridSize
    );
  }

  /**
   * Gera uma posição aleatória válida no grid
   * @returns Posição aleatória
   */
  getRandomPosition(): Position {
    return {
      x: Math.floor(Math.random() * this.gridSize),
      y: Math.floor(Math.random() * this.gridSize),
    };
  }
}