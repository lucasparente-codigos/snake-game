// ============================================
// 💥 SCREEN EFFECTS - Efeitos de Câmera/Tela
// ============================================

export interface ScreenOffset {
  x: number;
  y: number;
}

export class ScreenEffects {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  // Screen Shake
  private isShaking: boolean = false;
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;
  private shakeStartTime: number = 0;
  
  // Flash
  private isFlashing: boolean = false;
  private flashOpacity: number = 0;
  private flashColor: string = '#ffffff';
  private flashDuration: number = 0;
  private flashStartTime: number = 0;
  
  // Freeze Frame
  private isFrozen: boolean = false;
  private freezeDuration: number = 0;
  private freezeStartTime: number = 0;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  /**
   * Atualiza todos os efeitos
   */
  update(): void {
    this.updateShake();
    this.updateFlash();
    this.updateFreeze();
  }

  /**
   * Retorna o offset atual da tela (para shake)
   */
  getOffset(): ScreenOffset {
    if (!this.isShaking) {
      return { x: 0, y: 0 };
    }

    const elapsed = Date.now() - this.shakeStartTime;
    const progress = elapsed / this.shakeDuration;
    
    // Diminui a intensidade com o tempo
    const currentIntensity = this.shakeIntensity * (1 - progress);
    
    return {
      x: (Math.random() - 0.5) * currentIntensity,
      y: (Math.random() - 0.5) * currentIntensity,
    };
  }

  /**
   * Desenha overlay de flash
   */
  drawFlash(): void {
    if (!this.isFlashing || this.flashOpacity <= 0) return;

    this.ctx.save();
    this.ctx.fillStyle = this.flashColor;
    this.ctx.globalAlpha = this.flashOpacity;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  // ============================================
  // 📳 SCREEN SHAKE
  // ============================================

  /**
   * Ativa screen shake
   * @param intensity - Intensidade do shake (pixels)
   * @param duration - Duração em ms
   */
  shake(intensity: number = 8, duration: number = 300): void {
    this.isShaking = true;
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeStartTime = Date.now();
  }

  /**
   * Atualiza screen shake
   */
  private updateShake(): void {
    if (!this.isShaking) return;

    const elapsed = Date.now() - this.shakeStartTime;
    
    if (elapsed >= this.shakeDuration) {
      this.isShaking = false;
      this.shakeIntensity = 0;
    }
  }

  // ============================================
  // ⚡ FLASH
  // ============================================

  /**
   * Ativa flash na tela
   * @param color - Cor do flash
   * @param duration - Duração em ms
   * @param intensity - Opacidade máxima (0-1)
   */
  flash(color: string = '#ffffff', duration: number = 200, intensity: number = 0.6): void {
    this.isFlashing = true;
    this.flashColor = color;
    this.flashDuration = duration;
    this.flashOpacity = intensity;
    this.flashStartTime = Date.now();
  }

  /**
   * Atualiza flash
   */
  private updateFlash(): void {
    if (!this.isFlashing) return;

    const elapsed = Date.now() - this.flashStartTime;
    const progress = elapsed / this.flashDuration;
    
    // Fade out
    this.flashOpacity = Math.max(0, 0.6 * (1 - progress));
    
    if (elapsed >= this.flashDuration) {
      this.isFlashing = false;
      this.flashOpacity = 0;
    }
  }

  // ============================================
  // ❄️ FREEZE FRAME
  // ============================================

  /**
   * Congela o jogo por alguns frames (hit stop)
   * @param duration - Duração em ms
   */
  freeze(duration: number = 100): void {
    this.isFrozen = true;
    this.freezeDuration = duration;
    this.freezeStartTime = Date.now();
  }

  /**
   * Atualiza freeze
   */
  private updateFreeze(): void {
    if (!this.isFrozen) return;

    const elapsed = Date.now() - this.freezeStartTime;
    
    if (elapsed >= this.freezeDuration) {
      this.isFrozen = false;
    }
  }

  /**
   * Verifica se está congelado
   */
  isFreezeActive(): boolean {
    return this.isFrozen;
  }

  // ============================================
  // 🎯 ATALHOS PARA EFEITOS COMUNS
  // ============================================

  /**
   * Efeito ao comer comida normal
   */
  onFoodEaten(): void {
    // Apenas um leve pulse
  }

  /**
   * Efeito ao comer comida dourada
   */
  onGoldenFoodEaten(): void {
    this.flash('#ffd700', 150, 0.4);
  }

  /**
   * Efeito ao comer diamante
   */
  onDiamondEaten(): void {
    this.flash('#4dabf7', 200, 0.6);
    this.shake(6, 200);
    this.freeze(80);
  }

  /**
   * Efeito ao ativar power-up
   */
  onPowerUpActivated(color: string): void {
    this.flash(color, 150, 0.3);
  }

  /**
   * Efeito de game over
   */
  onGameOver(): void {
    this.shake(12, 500);
    this.flash('#ff6b6b', 400, 0.7);
  }

  /**
   * Efeito de level up
   */
  onLevelUp(): void {
    this.flash('#ffd43b', 250, 0.5);
    this.shake(4, 250);
  }

  /**
   * Efeito de high score
   */
  onHighScore(): void {
    this.flash('#51cf66', 300, 0.6);
    this.shake(8, 400);
  }

  /**
   * Limpa todos os efeitos
   */
  clear(): void {
    this.isShaking = false;
    this.isFlashing = false;
    this.isFrozen = false;
    this.shakeIntensity = 0;
    this.flashOpacity = 0;
  }

  /**
   * Informações de debug
   */
  getDebugInfo() {
    return {
      shaking: this.isShaking,
      flashing: this.isFlashing,
      frozen: this.isFrozen,
      shakeIntensity: this.shakeIntensity,
      flashOpacity: this.flashOpacity,
    };
  }
}