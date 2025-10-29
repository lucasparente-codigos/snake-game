// ============================================
// 🌟 PARTICLE SYSTEM - Gerenciador Central
// ============================================

import { Particle } from './Particle';
import { ParticleEmitter, EmitterPreset } from './ParticleEmitter';

interface EmitOptions {
  x: number;
  y: number;
  color?: string;
  colors?: string[];
  count?: number;
  speed?: number;
  size?: number;
  life?: number;
  spread?: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private ctx: CanvasRenderingContext2D;
  private maxParticles: number;
  private enabled: boolean = true;

  constructor(ctx: CanvasRenderingContext2D, maxParticles: number = 500) {
    this.ctx = ctx;
    this.maxParticles = maxParticles;
  }

  /**
   * Emite um efeito de partículas
   */
  emit(preset: EmitterPreset, options: EmitOptions): void {
    if (!this.enabled) return;

    const newParticles = ParticleEmitter.emit(preset, options);
    
    // Adiciona as novas partículas
    this.particles.push(...newParticles);
    
    // Remove partículas antigas se exceder o limite
    if (this.particles.length > this.maxParticles) {
      this.particles = this.particles.slice(-this.maxParticles);
    }
  }

  /**
   * Atualiza todas as partículas
   */
  update(deltaTime: number = 1): void {
    if (!this.enabled) return;

    // Atualiza cada partícula
    this.particles.forEach(particle => particle.update(deltaTime));
    
    // Remove partículas mortas
    this.particles = this.particles.filter(particle => particle.isAlive());
  }

  /**
   * Desenha todas as partículas
   */
  draw(): void {
    if (!this.enabled) return;

    this.particles.forEach(particle => particle.draw(this.ctx));
  }

  /**
   * Ativa/desativa o sistema
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    if (!enabled) {
      this.clear();
    }
  }

  /**
   * Verifica se está ativado
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Limpa todas as partículas
   */
  clear(): void {
    this.particles = [];
  }

  /**
   * Retorna quantidade de partículas ativas
   */
  getParticleCount(): number {
    return this.particles.length;
  }

  /**
   * Retorna informações de debug
   */
  getDebugInfo() {
    return {
      count: this.particles.length,
      maxParticles: this.maxParticles,
      enabled: this.enabled,
    };
  }

  // ============================================
  // 🎯 ATALHOS PARA EFEITOS COMUNS
  // ============================================

  /**
   * Explosão ao comer comida normal
   */
  foodEaten(x: number, y: number, color: string = '#e0e0e0'): void {
    this.emit('explosion', { x, y, color, count: 8, speed: 2.5, size: 3 });
  }

  /**
   * Explosão especial para comida dourada
   */
  goldenFoodEaten(x: number, y: number): void {
    this.emit('explosion', { 
      x, y, 
      color: '#ffd700', 
      count: 12, 
      speed: 3, 
      size: 4 
    });
    this.emit('sparkle', { x, y, color: '#ffd700', count: 5 });
  }

  /**
   * Explosão épica para diamante
   */
  diamondEaten(x: number, y: number): void {
    this.emit('burst', { 
      x, y, 
      color: '#4dabf7', 
      count: 16, 
      speed: 4, 
      size: 5 
    });
    this.emit('shimmer', { 
      x, y, 
      color: '#74c0fc', 
      count: 8,
      life: 50
    });
  }

  /**
   * Efeito de power-up ativado
   */
  powerUpActivated(x: number, y: number, color: string): void {
    this.emit('burst', { x, y, color, count: 10, speed: 4 });
  }

  /**
   * Confete de celebração (high score, level up)
   */
  celebration(x: number, y: number): void {
    this.emit('confetti', { 
      x, y, 
      count: 30,
      colors: ['#ff6b6b', '#ffd43b', '#51cf66', '#4dabf7', '#ff8787']
    });
  }

  /**
   * Trail contínuo para comidas especiais
   */
  createTrail(x: number, y: number, color: string): void {
    this.emit('trail', { x, y, color, count: 2, size: 2 });
  }

  /**
   * Game Over explosion
   */
  gameOver(x: number, y: number): void {
    this.emit('explosion', {
      x, y,
      color: '#ff6b6b',
      count: 20,
      speed: 4,
      size: 6,
      life: 40
    });
  }
}