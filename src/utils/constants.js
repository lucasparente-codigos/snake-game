// ============================================
// 🎮 CONFIGURAÇÕES DO JOGO
// ============================================

// Tamanho do grid (quantas células)
export const GRID_SIZE = 20;

// Tamanho de cada célula em pixels
export const CELL_SIZE = 25;

// Tamanho total do canvas
export const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE;
export const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE;

// Velocidade do jogo (ms entre cada movimento)
// Quanto MENOR, mais rápido
export const GAME_SPEED = 150;

// ============================================
// 🎨 CORES - TEMA MINIMALISTA DARK
// ============================================

export const COLORS = {
  background: '#0a0a0a',
  grid: '#1a1a1a',
  snake: '#333333',
  snakeHead: '#ffffff',
  food: '#e0e0e0',
  text: '#ffffff',
};

// ============================================
// 🕹️ DIREÇÕES
// ============================================

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// ============================================
// ⌨️ TECLAS
// ============================================

export const KEYS = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP',
  s: 'DOWN',
  a: 'LEFT',
  d: 'RIGHT',
};