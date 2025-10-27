import type { DirectionMap, KeyMap } from '../types';

// ============================================
// 🕹️ DIREÇÕES
// ============================================

export const DIRECTIONS: DirectionMap = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// ============================================
// ⌨️ TECLAS
// ============================================

export const KEYS: KeyMap = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP',
  s: 'DOWN',
  a: 'LEFT',
  d: 'RIGHT',
};