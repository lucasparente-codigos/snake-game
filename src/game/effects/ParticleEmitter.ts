// ============================================
// 🎆 PARTICLE EMITTER - Criador de Efeitos
// ============================================

import { Particle } from './Particle';

export type EmitterPreset = 
  | 'explosion'
  | 'sparkle' 
  | 'confetti'
  | 'trail'
  | 'burst'
  | 'shimmer';

interface EmitterOptions {
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

export class ParticleEmitter {
  /**
   * Cria partículas baseado em um preset
   */
  static emit(preset: EmitterPreset, options: EmitterOptions): Particle[] {
    switch (preset) {
      case 'explosion':
        return this.createExplosion(options);
      case 'sparkle':
        return this.createSparkle(options);
      case 'confetti':
        return this.createConfetti(options);
      case 'trail':
        return this.createTrail(options);
      case 'burst':
        return this.createBurst(options);
      case 'shimmer':
        return this.createShimmer(options);
      default:
        return [];
    }
  }

  /**
   * EXPLOSÃO - Partículas em todas as direções
   */
  private static createExplosion(options: EmitterOptions): Particle[] {
    const particles: Particle[] = [];
    const count = options.count ?? 12;
    const speed = options.speed ?? 3;
    const color = options.color ?? '#ffffff';
    const size = options.size ?? 4;
    const life = options.life ?? 30;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const velocity = speed * (0.8 + Math.random() * 0.4);
      
      particles.push(new Particle({
        x: options.x,
        y: options.y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: size * (0.8 + Math.random() * 0.4),
        color: color,
        life: life * (0.8 + Math.random() * 0.4),
        gravity: 0.15,
        friction: 0.96,
      }));
    }

    return particles;
  }

  /**
   * SPARKLE - Brilho sutil (para comidas raras)
   */
  private static createSparkle(options: EmitterOptions): Particle[] {
    const particles: Particle[] = [];
    const count = options.count ?? 3;
    const color = options.color ?? '#ffd700';
    const size = options.size ?? 3;
    const life = options.life ?? 20;
    const spread = options.spread ?? 15;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * spread;
      
      particles.push(new Particle({
        x: options.x + Math.cos(angle) * distance,
        y: options.y + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: size * (0.5 + Math.random() * 0.5),
        color: color,
        life: life,
        gravity: 0,
        friction: 0.99,
      }));
    }

    return particles;
  }

  /**
   * CONFETTI - Celebração (high score, level up)
   */
  private static createConfetti(options: EmitterOptions): Particle[] {
    const particles: Particle[] = [];
    const count = options.count ?? 20;
    const colors = options.colors ?? ['#ff6b6b', '#ffd43b', '#51cf66', '#4dabf7', '#ff8787'];
    const size = options.size ?? 5;
    const life = options.life ?? 60;

    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3;
      const speed = 4 + Math.random() * 4;
      
      particles.push(new Particle({
        x: options.x,
        y: options.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size * (0.6 + Math.random() * 0.8),
        color: colors[Math.floor(Math.random() * colors.length)],
        life: life * (0.8 + Math.random() * 0.4),
        gravity: 0.2,
        friction: 0.98,
      }));
    }

    return particles;
  }

  /**
   * TRAIL - Rastro contínuo (comidas especiais)
   */
  private static createTrail(options: EmitterOptions): Particle[] {
    const particles: Particle[] = [];
    const count = options.count ?? 2;
    const color = options.color ?? '#ffffff';
    const size = options.size ?? 2;
    const life = options.life ?? 15;

    for (let i = 0; i < count; i++) {
      particles.push(new Particle({
        x: options.x + (Math.random() - 0.5) * 8,
        y: options.y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: size,
        color: color,
        life: life,
        gravity: 0,
        friction: 0.95,
        alpha: 0.6,
      }));
    }

    return particles;
  }

  /**
   * BURST - Rajada rápida (power-ups)
   */
  private static createBurst(options: EmitterOptions): Particle[] {
    const particles: Particle[] = [];
    const count = options.count ?? 8;
    const speed = options.speed ?? 5;
    const color = options.color ?? '#ffffff';
    const size = options.size ?? 6;
    const life = options.life ?? 25;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      
      particles.push(new Particle({
        x: options.x,
        y: options.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size * (0.7 + Math.random() * 0.6),
        color: color,
        life: life,
        gravity: 0.05,
        friction: 0.94,
      }));
    }

    return particles;
  }

  /**
   * SHIMMER - Brilho suave pulsante
   */
  private static createShimmer(options: EmitterOptions): Particle[] {
    const particles: Particle[] = [];
    const count = options.count ?? 4;
    const color = options.color ?? '#ffffff';
    const size = options.size ?? 4;
    const life = options.life ?? 40;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 5 + Math.random() * 10;
      
      particles.push(new Particle({
        x: options.x + Math.cos(angle) * distance,
        y: options.y + Math.sin(angle) * distance,
        vx: Math.cos(angle) * 0.2,
        vy: Math.sin(angle) * 0.2,
        size: size * (0.8 + Math.random() * 0.4),
        color: color,
        life: life,
        gravity: 0,
        friction: 0.97,
        alpha: 0.8,
      }));
    }

    return particles;
  }
}