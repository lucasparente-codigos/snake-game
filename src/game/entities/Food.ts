// ============================================
// 🍎 FOOD - Lógica da Comida COM TRAIL ✨
// ============================================

import { isPositionInList } from '../../utils/helpers';
import { selectRandomFoodType } from '../../utils/foodTypes';
import type { Position, FoodType } from '../../types';
import type { Grid } from './Grid';
import type { ParticleSystem } from '../effects/ParticleSystem';

export class Food {
  private grid: Grid;
  public position: Position | null;
  public type: FoodType | null;
  
  // Animação de pulso
  private animationTime: number;
  
  // 🆕 Trail para comidas raras
  private particleSystem: ParticleSystem | null = null;
  private lastTrailTime: number = 0;
  private trailInterval: number = 100; // ms entre cada trail particle

  constructor(grid: Grid, particleSystem?: ParticleSystem) {
    this.grid = grid;
    this.position = null;
    this.type = null;
    this.animationTime = 0;
    this.particleSystem = particleSystem || null;
  }

  /**
   * Gera uma nova posição para a comida
   */
  spawn(snakeBody: Position[]): void {
    let newPosition: Position;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      newPosition = this.grid.getRandomPosition();
      attempts++;

      if (attempts >= maxAttempts) {
        console.warn('Não conseguiu encontrar posição válida para a comida');
        break;
      }
    } while (isPositionInList(newPosition, snakeBody));

    this.position = newPosition;
    this.type = selectRandomFoodType();
    this.animationTime = Date.now();
    
    console.log(`🍎 Comida spawnou: ${this.type.name} (${this.type.pointsBase} pts)`);
  }

  /**
   * Verifica se a comida foi comida pela cobra
   */
  isEaten(snakeHead: Position): boolean {
    if (!this.position) return false;

    return (
      snakeHead.x === this.position.x &&
      snakeHead.y === this.position.y
    );
  }

  /**
   * Atualiza a comida (trail particles)
   */
  update(): void {
    if (!this.position || !this.type || !this.particleSystem) return;

    // 🆕 Apenas comidas especiais tem trail
    const shouldHaveTrail = this.type.id === 'diamond' || this.type.id === 'golden';
    
    if (!shouldHaveTrail) return;

    // Limita frequência do trail
    const now = Date.now();
    if (now - this.lastTrailTime < this.trailInterval) return;
    
    this.lastTrailTime = now;

    // Cria trail na posição da comida
    const pixelX = this.position.x * this.grid.cellSize + this.grid.cellSize / 2;
    const pixelY = this.position.y * this.grid.cellSize + this.grid.cellSize / 2;
    
    this.particleSystem.createTrail(pixelX, pixelY, this.type.color);
  }

  /**
   * Desenha a comida no canvas
   */
  draw(): void {
    if (!this.position || !this.type) return;

    const ctx = this.grid.ctx;
    const pixelX = this.position.x * this.grid.cellSize;
    const pixelY = this.position.y * this.grid.cellSize;
    const centerX = pixelX + this.grid.cellSize / 2;
    const centerY = pixelY + this.grid.cellSize / 2;
    
    // Animação de pulso
    const elapsed = (Date.now() - this.animationTime) / 1000;
    const pulse = 1 + Math.sin(elapsed * 3) * 0.1;
    
    const baseRadius = this.grid.cellSize / 3;
    const radius = baseRadius * pulse;

    // Desenha círculo principal
    ctx.fillStyle = this.type.color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Brilho
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
    
    // Anel para comidas especiais
    if (this.type.id !== 'normal') {
      ctx.strokeStyle = this.type.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    
    // Brilhos extras para diamond
    if (this.type.id === 'diamond') {
      const sparkleTime = (Date.now() / 200) % (Math.PI * 2);
      const sparkleSize = 2 + Math.sin(sparkleTime) * 1;
      
      ctx.fillStyle = '#ffffff';
      
      const sparklePositions = [
        { x: centerX, y: centerY - radius * 1.3 },
        { x: centerX + radius * 1.3, y: centerY },
        { x: centerX, y: centerY + radius * 1.3 },
        { x: centerX - radius * 1.3, y: centerY },
      ];
      
      sparklePositions.forEach(pos => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, sparkleSize, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  getPosition(): Position | null {
    return this.position;
  }
  
  getType(): FoodType | null {
    return this.type;
  }
  
  getPowerUp(): string | null {
    return this.type?.powerUp || null;
  }
}