// ============================================
// 🍎 FOOD TYPES - Tipos de Comida e Power-ups
// ============================================

/**
 * Tipos de comida disponíveis
 * weight = Raridade (quanto maior, mais comum)
 */
export const FOOD_TYPES = {
  normal: {
    id: 'normal',
    name: 'Normal',
    emoji: '🍎',
    color: '#e0e0e0',
    pointsBase: 10,
    pointsMultiplier: 1,
    weight: 70, // 70% de chance
    powerUp: null,
  },
  
  golden: {
    id: 'golden',
    name: 'Golden Apple',
    emoji: '⭐',
    color: '#ffd700',
    pointsBase: 50,
    pointsMultiplier: 1,
    weight: 15, // 15% de chance
    powerUp: null,
  },
  
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    emoji: '💎',
    color: '#4dabf7',
    pointsBase: 100,
    pointsMultiplier: 1,
    weight: 5, // 5% de chance (super rara!)
    powerUp: null,
  },
  
  berry: {
    id: 'berry',
    name: 'Magic Berry',
    emoji: '🍓',
    color: '#ff6b6b',
    pointsBase: 20,
    pointsMultiplier: 1,
    weight: 10, // 10% de chance
    powerUp: 'double_points', // Ativa power-up!
  },
};

/**
 * Power-ups disponíveis
 */
export const POWER_UPS = {
  double_points: {
    id: 'double_points',
    name: 'Double Points',
    emoji: '2️⃣',
    color: '#ffd43b',
    duration: 8000, // 8 segundos
    description: 'Pontos x2',
  },
  
  shield: {
    id: 'shield',
    name: 'Shield',
    emoji: '🛡️',
    color: '#51cf66',
    duration: 3000, // 3 segundos
    description: 'Invencível',
  },
  
  slow_motion: {
    id: 'slow_motion',
    name: 'Slow Motion',
    emoji: '🐌',
    color: '#748ffc',
    duration: 6000, // 6 segundos
    description: 'Mais devagar',
  },
  
  speed_boost: {
    id: 'speed_boost',
    name: 'Speed Boost',
    emoji: '⚡',
    color: '#ff8787',
    duration: 5000, // 5 segundos
    description: 'Mais rápido',
  },
};

/**
 * Seleciona um tipo de comida aleatório baseado no peso
 * @returns {Object} Tipo de comida selecionado
 */
export function selectRandomFoodType() {
  // Calcula peso total
  const totalWeight = Object.values(FOOD_TYPES).reduce(
    (sum, type) => sum + type.weight,
    0
  );

  // Gera número aleatório
  let random = Math.random() * totalWeight;

  // Seleciona baseado no peso
  for (const type of Object.values(FOOD_TYPES)) {
    random -= type.weight;
    if (random <= 0) {
      return type;
    }
  }

  // Fallback (não deve acontecer)
  return FOOD_TYPES.normal;
}

/**
 * Retorna informações de um power-up pelo ID
 * @param {string} powerUpId - ID do power-up
 * @returns {Object|null} Power-up ou null
 */
export function getPowerUp(powerUpId) {
  return POWER_UPS[powerUpId] || null;
}

/**
 * Calcula pontos considerando tipo de comida e multiplicadores
 * @param {Object} foodType - Tipo da comida
 * @param {number} levelMultiplier - Multiplicador do nível
 * @param {boolean} hasDoublePoints - Se tem power-up de pontos x2
 * @returns {number} Pontos calculados
 */
export function calculateFoodPoints(foodType, levelMultiplier = 1, hasDoublePoints = false) {
  let points = foodType.pointsBase * foodType.pointsMultiplier;
  
  // Aplica multiplicador de nível
  points *= levelMultiplier;
  
  // Aplica power-up de pontos x2
  if (hasDoublePoints) {
    points *= 2;
  }
  
  return Math.floor(points);
}