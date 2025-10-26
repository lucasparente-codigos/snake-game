// ============================================
// 🎨 UI TYPES - Tipos relacionados à interface
// ============================================

/**
 * Estados possíveis da aplicação
 */
export enum GameState {
  MENU = 'MENU',
  SETTINGS = 'SETTINGS',
  STATS = 'STATS',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

/**
 * Item de menu
 */
export interface MenuItem {
  text: string;
  action: () => void;
  enabled?: boolean;
}

/**
 * Configurações de renderização de menu
 */
export interface MenuRenderOptions {
  showTitle?: boolean;
  showFooter?: boolean;
  animated?: boolean;
}

/**
 * Dados para renderização de estatísticas
 */
export interface StatsDisplayData {
  label: string;
  value: string | number;
  highlight?: boolean;
}

/**
 * Transição entre telas
 */
export interface ScreenTransition {
  from: GameState;
  to: GameState;
  duration: number;
  type: 'fade' | 'slide' | 'none';
}

/**
 * Configuração de animação
 */
export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  loop?: boolean;
}

/**
 * Posição na tela (pixels)
 */
export interface ScreenPosition {
  x: number;
  y: number;
}

/**
 * Dimensões
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Área retangular
 */
export interface Rectangle extends ScreenPosition, Dimensions {}

/**
 * Configuração de fonte
 */
export interface FontConfig {
  family: string;
  size: number;
  weight: 'normal' | 'bold';
  color: string;
}

/**
 * Tema de cores
 */
export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textMuted: string;
  success: string;
  error: string;
  warning: string;
}

/**
 * Callback de mudança de estado
 */
export type StateChangeCallback = (from: GameState, to: GameState) => void;

/**
 * Callback de entrada em estado
 */
export type StateEnterCallback = () => void;