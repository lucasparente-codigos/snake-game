// ============================================
// 📈 FLOATING TEXT - Textos Flutuantes (Score Popups)
// ============================================

export interface FloatingTextConfig {
  text: string;
  x: number;
  y: number;
  color?: string;
  fontSize?: number;
  velocity?: { x: number; y: number };
  life?: number;
  fadeDelay?: number;
}

export class FloatingText {
  // Texto
  public text: string;
  public color: string;
  public fontSize: number;
  public fontWeight: string;
  
  // Posição
  public x: number;
  public y: number;
  
  // Movimento
  private vx: number;
  private vy: number;
  
  // Vida útil
  public life: number;
  private maxLife: number;
  private fadeDelay: number;
  public alpha: number;
  
  // Estado
  public isDead: boolean = false;

  constructor(config: FloatingTextConfig) {
    this.text = config.text;
    this.x = config.x;
    this.y = config.y;
    this.color = config.color ?? '#ffffff';
    this.fontSize = config.fontSize ?? 20;
    this.fontWeight = 'bold';
    
    // Velocidade (padrão: sobe devagar)
    this.vx = config.velocity?.x ?? 0;
    this.vy = config.velocity?.y ?? -1;
    
    // Vida
    this.life = config.life ?? 60;
    this.maxLife = this.life;
    this.fadeDelay = config.fadeDelay ?? 0.5; // 50% do tempo antes de começar a fade
    this.alpha = 1;
  }

  /**
   * Atualiza o texto flutuante
   */
  update(deltaTime: number = 1): void {
    if (this.isDead) return;

    // Move
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    
    // Diminui vida
    this.life -= deltaTime;
    
    // Calcula alpha (fade out na segunda metade da vida)
    const lifeRatio = this.life / this.maxLife;
    const fadeStart = this.fadeDelay;
    
    if (lifeRatio < fadeStart) {
      this.alpha = lifeRatio / fadeStart;
    } else {
      this.alpha = 1;
    }
    
    // Marca como morto
    if (this.life <= 0) {
      this.isDead = true;
    }
  }

  /**
   * Desenha o texto
   */
  draw(ctx: CanvasRenderingContext2D): void {
    if (this.isDead) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.font = `${this.fontWeight} ${this.fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Sombra para legibilidade
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillText(this.text, this.x, this.y);
    
    ctx.restore();
  }

  /**
   * Verifica se está vivo
   */
  isAlive(): boolean {
    return !this.isDead;
  }
}

// ============================================
// 🎨 FLOATING TEXT SYSTEM - Gerenciador
// ============================================

export class FloatingTextSystem {
  private texts: FloatingText[] = [];
  private ctx: CanvasRenderingContext2D;
  private maxTexts: number;
  private enabled: boolean = true;

  constructor(ctx: CanvasRenderingContext2D, maxTexts: number = 50) {
    this.ctx = ctx;
    this.maxTexts = maxTexts;
  }

  /**
   * Cria um novo texto flutuante
   */
  add(config: FloatingTextConfig): void {
    if (!this.enabled) return;

    const text = new FloatingText(config);
    this.texts.push(text);
    
    // Remove textos antigos se exceder limite
    if (this.texts.length > this.maxTexts) {
      this.texts = this.texts.slice(-this.maxTexts);
    }
  }

  /**
   * Atualiza todos os textos
   */
  update(deltaTime: number = 1): void {
    if (!this.enabled) return;

    this.texts.forEach(text => text.update(deltaTime));
    this.texts = this.texts.filter(text => text.isAlive());
  }

  /**
   * Desenha todos os textos
   */
  draw(): void {
    if (!this.enabled) return;

    this.texts.forEach(text => text.draw(this.ctx));
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
   * Limpa todos os textos
   */
  clear(): void {
    this.texts = [];
  }

  /**
   * Retorna quantidade de textos ativos
   */
  getTextCount(): number {
    return this.texts.length;
  }

  // ============================================
  // 🎯 ATALHOS PARA TEXTOS COMUNS
  // ============================================

  /**
   * Mostra pontos ganhos
   */
  showPoints(x: number, y: number, points: number): void {
    const color = points >= 100 ? '#4dabf7' : points >= 50 ? '#ffd700' : '#e0e0e0';
    
    this.add({
      text: `+${points}`,
      x,
      y,
      color,
      fontSize: points >= 100 ? 28 : points >= 50 ? 24 : 20,
      velocity: { x: 0, y: -1.5 },
      life: 40,
    });
  }

  /**
   * Mostra combo
   */
  showCombo(x: number, y: number, streak: number): void {
    if (streak <= 1) return;

    this.add({
      text: `COMBO x${streak}!`,
      x,
      y: y - 30,
      color: '#ffd43b',
      fontSize: 24,
      velocity: { x: 0, y: -1 },
      life: 50,
    });
  }

  /**
   * Mostra level up
   */
  showLevelUp(x: number, y: number, level: number): void {
    this.add({
      text: `LEVEL ${level}!`,
      x,
      y,
      color: '#51cf66',
      fontSize: 32,
      velocity: { x: 0, y: -0.8 },
      life: 80,
    });
  }

  /**
   * Mostra high score
   */
  showHighScore(x: number, y: number): void {
    this.add({
      text: 'NEW HIGH SCORE!',
      x,
      y,
      color: '#ff6b6b',
      fontSize: 28,
      velocity: { x: 0, y: -1 },
      life: 100,
    });
  }

  /**
   * Mostra power-up ativado
   */
  showPowerUp(x: number, y: number, name: string, emoji: string): void {
    this.add({
      text: `${emoji} ${name}`,
      x,
      y,
      color: '#ffd43b',
      fontSize: 22,
      velocity: { x: 0, y: -1.2 },
      life: 60,
    });
  }

  /**
   * Mostra mensagem customizada
   */
  showMessage(x: number, y: number, message: string, color: string = '#ffffff'): void {
    this.add({
      text: message,
      x,
      y,
      color,
      fontSize: 20,
      velocity: { x: 0, y: -1 },
      life: 60,
    });
  }
}