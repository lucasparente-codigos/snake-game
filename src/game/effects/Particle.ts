// ============================================
// ✨ PARTICLE - Partícula Individual
// ============================================

import type { Position } from '../../types';

export interface ParticleConfig {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  gravity?: number;
  friction?: number;
  alpha?: number;
  fadeRate?: number;
  shrinkRate?: number;
}

export class Particle {
  // Posição
  public x: number;
  public y: number;
  
  // Velocidade
  private vx: number;
  private vy: number;
  
  // Visual
  public size: number;
  public color: string;
  public alpha: number;
  
  // Física
  private gravity: number;
  private friction: number;
  
  // Vida útil
  public life: number;
  private maxLife: number;
  private fadeRate: number;
  private shrinkRate: number;
  
  // Estado
  public isDead: boolean = false;

  constructor(config: ParticleConfig) {
    this.x = config.x;
    this.y = config.y;
    this.vx = config.vx;
    this.vy = config.vy;
    this.size = config.size;
    this.color = config.color;
    this.life = config.life;
    this.maxLife = config.life;
    
    // Valores padrão
    this.gravity = config.gravity ?? 0.1;
    this.friction = config.friction ?? 0.98;
    this.alpha = config.alpha ?? 1;
    this.fadeRate = config.fadeRate ?? 0.02;
    this.shrinkRate = config.shrinkRate ?? 0.95;
  }

  /**
   * Atualiza a partícula (física + vida)
   */
  update(deltaTime: number = 1): void {
    if (this.isDead) return;

    // Aplica física
    this.vy += this.gravity;
    this.vx *= this.friction;
    this.vy *= this.friction;
    
    // Atualiza posição
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    
    // Diminui vida
    this.life -= deltaTime;
    
    // Fade out baseado na vida restante
    const lifeRatio = this.life / this.maxLife;
    this.alpha = lifeRatio;
    
    // Encolhe com o tempo
    this.size *= this.shrinkRate;
    
    // Marca como morta se acabou a vida
    if (this.life <= 0 || this.size < 0.5) {
      this.isDead = true;
    }
  }

  /**
   * Desenha a partícula no canvas
   */
  draw(ctx: CanvasRenderingContext2D): void {
    if (this.isDead) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  /**
   * Retorna se a partícula ainda está viva
   */
  isAlive(): boolean {
    return !this.isDead;
  }
}