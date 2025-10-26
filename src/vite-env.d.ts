// ============================================
// 🔷 VITE ENVIRONMENT TYPES
// ============================================
// Arquivo: src/vite-env.d.ts
// 
// Este arquivo declara tipos para recursos que o TypeScript
// não reconhece nativamente, mas que o Vite processa.

/// <reference types="vite/client" />

// ============================================
// 📦 IMPORTS DE ASSETS
// ============================================

/**
 * Permite importar arquivos CSS
 * Exemplo: import './styles/main.css'
 */
declare module '*.css' {
  const content: string;
  export default content;
}

/**
 * Permite importar arquivos SCSS/SASS
 */
declare module '*.scss' {
  const content: string;
  export default content;
}

declare module '*.sass' {
  const content: string;
  export default content;
}

/**
 * Permite importar imagens
 */
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

/**
 * Permite importar fontes
 */
declare module '*.woff' {
  const content: string;
  export default content;
}

declare module '*.woff2' {
  const content: string;
  export default content;
}

// ============================================
// 🌍 VARIÁVEIS DE AMBIENTE DO VITE
// ============================================

/**
 * Define as variáveis de ambiente disponíveis
 * em import.meta.env
 */
interface ImportMetaEnv {
  /**
   * Modo de desenvolvimento?
   * true em 'vite dev'
   * false em 'vite build'
   */
  readonly DEV: boolean;

  /**
   * Modo de produção?
   * true em 'vite build'
   * false em 'vite dev'
   */
  readonly PROD: boolean;

  /**
   * Modo atual: 'development' ou 'production'
   */
  readonly MODE: string;

  /**
   * URL base do app (definido em vite.config)
   */
  readonly BASE_URL: string;

  /**
   * SSR (Server-Side Rendering)?
   */
  readonly SSR: boolean;

  // Adicione suas próprias variáveis de ambiente aqui
  // Exemplo:
  // readonly VITE_API_URL: string;
  // readonly VITE_APP_TITLE: string;
}

/**
 * Estende o tipo ImportMeta para incluir env
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ============================================
// 🎮 TIPOS GLOBAIS CUSTOMIZADOS (Opcional)
// ============================================

/**
 * Exemplo: Se você quiser adicionar propriedades
 * ao objeto window para debug
 */
// interface Window {
//   gameController?: import('./game/controllers/GameController').GameController;
// }