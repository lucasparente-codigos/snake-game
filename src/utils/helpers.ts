// ============================================
// 🎲 FUNÇÕES AUXILIARES
// ============================================

import type { Position } from '../types';

/**
 * Gera um número aleatório entre min e max (inclusive)
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @returns Número aleatório
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Verifica se duas posições são iguais
 * @param pos1 - Primeira posição
 * @param pos2 - Segunda posição
 * @returns True se forem iguais
 */
export function isSamePosition(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * Verifica se uma posição está dentro de uma lista de posições
 * @param position - Posição a verificar
 * @param positions - Array de posições
 * @returns True se a posição estiver na lista
 */
export function isPositionInList(position: Position, positions: Position[]): boolean {
  return positions.some(pos => isSamePosition(pos, position));
}

/**
 * Clona um objeto profundamente (útil para copiar posições)
 * @param obj - Objeto a ser clonado
 * @returns Cópia do objeto
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Converte coordenadas do grid para pixels do canvas
 * @param gridCoord - Coordenada no grid (0-19)
 * @param cellSize - Tamanho da célula em pixels
 * @returns Coordenada em pixels
 */
export function gridToPixel(gridCoord: number, cellSize: number): number {
  return gridCoord * cellSize;
}

/**
 * Converte pixels do canvas para coordenadas do grid
 * @param pixelCoord - Coordenada em pixels
 * @param cellSize - Tamanho da célula em pixels
 * @returns Coordenada no grid
 */
export function pixelToGrid(pixelCoord: number, cellSize: number): number {
  return Math.floor(pixelCoord / cellSize);
}