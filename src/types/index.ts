// ============================================
// 🔷 TYPES - Barrel Export (ponto central)
// ============================================

// Game Types
export type {
  Position,
  Direction,
  DirectionName,
  DirectionMap,
  KeyMap,
  Colors,
  FoodType,
  FoodTypeMap,
  PowerUp,
  ActivePowerUp,
  PowerUpMap,
  Difficulty,
  DifficultySettings,
  DifficultySettingsMap,
  GameStats,
  EatFoodResult,
  PowerUpDebugInfo,
  GameStateData,
} from './game.types';

// UI Types
export {
  GameState, // Enum
} from './ui.types';

export type {
  MenuItem,
  MenuRenderOptions,
  StatsDisplayData,
  ScreenTransition,
  AnimationConfig,
  ScreenPosition,
  Dimensions,
  Rectangle,
  FontConfig,
  Theme,
  StateChangeCallback,
  StateEnterCallback,
} from './ui.types';

// Storage Types
export {
  StorageKey, // Enum
} from './storage.types';

export type {
  GlobalStats,
  GameSettings,
  StorageOperationResult,
  SaveOptions,
  LoadOptions,
  SaveMetadata,
  SaveData,
  GameHistory,
  Achievement,
  PlayerProfile,
} from './storage.types';