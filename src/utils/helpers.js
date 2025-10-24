// ============================================
// 🎲 FUNÇÕES AUXILIARES
// ============================================

/**
 * Gera um número aleatório entre min e max (inclusive)
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Número aleatório
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Verifica se duas posições são iguais
 * @param {Object} pos1 - Primeira posição {x, y}
 * @param {Object} pos2 - Segunda posição {x, y}
 * @returns {boolean} True se forem iguais
 */
export function isSamePosition(pos1, pos2) {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * Verifica se uma posição está dentro de uma lista de posições
 * @param {Object} position - Posição a verificar {x, y}
 * @param {Array} positions - Array de posições [{x, y}, ...]
 * @returns {boolean} True se a posição estiver na lista
 */
export function isPositionInList(position, positions) {
  return positions.some(pos => isSamePosition(pos, position));
}

/**
 * Clona um objeto profundamente (útil para copiar posições)
 * @param {Object} obj - Objeto a ser clonado
 * @returns {Object} Cópia do objeto
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Converte coordenadas do grid para pixels do canvas
 * @param {number} gridCoord - Coordenada no grid (0-19)
 * @param {number} cellSize - Tamanho da célula em pixels
 * @returns {number} Coordenada em pixels
 */
export function gridToPixel(gridCoord, cellSize) {
  return gridCoord * cellSize;
}

/**
 * Converte pixels do canvas para coordenadas do grid
 * @param {number} pixelCoord - Coordenada em pixels
 * @param {number} cellSize - Tamanho da célula em pixels
 * @returns {number} Coordenada no grid
 */
export function pixelToGrid(pixelCoord, cellSize) {
  return Math.floor(pixelCoord / cellSize);
}