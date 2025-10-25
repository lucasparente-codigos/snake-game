import { COLORS } from '../utils/constants.js';
import { isPositionInList } from '../utils/helpers.js';
import { selectRandomFoodType } from '../utils/foodTypes.js';

// ============================================
// 🍎 FOOD - Lógica da Comida
// ============================================

export class Food {
  constructor(grid) {
    this.grid = grid;
    this.position = null;
    this.type = null;
    
    // Animação de pulso (fica mais vistosa)
    this.animationTime = 0;
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
    
    // Seleciona tipo aleatório baseado em raridade
    this.type = selectRandomFoodType();
    
    // Reseta animação
    this.animationTime = Date.now();
    
    console.log(`🍎 Comida spawnou: ${this.type.name} (${this.type.pointsBase} pts)`);
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
    if (!this.position || !this.type) return;

    const ctx = this.grid.ctx;
    const pixelX = this.position.x * this.grid.cellSize;
    const pixelY = this.position.y * this.grid.cellSize;
    const centerX = pixelX + this.grid.cellSize / 2;
    const centerY = pixelY + this.grid.cellSize / 2;
    
    // Animação de pulso (oscila entre 0.9 e 1.1)
    const elapsed = (Date.now() - this.animationTime) / 1000;
    const pulse = 1 + Math.sin(elapsed * 3) * 0.1;
    
    const baseRadius = this.grid.cellSize / 3;
    const radius = baseRadius * pulse;

    // Desenha círculo principal com cor do tipo
    ctx.fillStyle = this.type.color;
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
    
    // Se for comida especial (não normal), desenha um anel externo
    if (this.type.id !== 'normal') {
      ctx.strokeStyle = this.type.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    
    // Se for comida MUITO rara (diamond), adiciona efeito de brilho extra
    if (this.type.id === 'diamond') {
      const sparkleTime = (Date.now() / 200) % (Math.PI * 2);
      const sparkleSize = 2 + Math.sin(sparkleTime) * 1;
      
      ctx.fillStyle = '#ffffff';
      
      // Brilhos nas 4 direções
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

  /**
   * Retorna a posição atual da comida
   * @returns {Object|null} Posição {x, y} ou null
   */
  getPosition() {
    return this.position;
  }
  
  /**
   * Retorna o tipo atual da comida
   * @returns {Object|null} Tipo da comida ou null
   */
  getType() {
    return this.type;
  }
  
  /**
   * Retorna se a comida tem um power-up
   * @returns {string|null} ID do power-up ou null
   */
  getPowerUp() {
    return this.type?.powerUp || null;
  }
}