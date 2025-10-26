// ============================================
// 🎮 MAIN - Entry Point do Jogo
// ============================================

import './styles/main.css';
import { GameEngine } from './game/GameEngine';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './utils/constants';
import { StorageManager } from './utils/StorageManager';

/**
 * Inicializa o jogo
 */
function init(): void {
  console.log('🔧 Iniciando aplicação...');

  // Pega o container do app
  const app = document.querySelector<HTMLDivElement>('#app');
  
  if (!app) {
    console.error('❌ Elemento #app não encontrado!');
    return;
  }

  // Pega estatísticas globais
  const globalStats = StorageManager.getAllStats();
  console.log('📊 Estatísticas carregadas:', globalStats);

  // Cria a estrutura HTML
  app.innerHTML = `
    <div class="game-container">
      <h1 class="game-title">🐍 Snake Game</h1>
      
      <div class="game-wrapper">
        <canvas id="gameCanvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
      </div>
      
      <div class="game-controls">
        <div class="controls-section">
          <h3>🕹️ Controls</h3>
          <p><strong>Arrow Keys</strong> or <strong>WASD</strong> - Move</p>
          <p><strong>ESC</strong> or <strong>P</strong> - Pause</p>
          <p><strong>SPACE</strong> - Restart (when game over)</p>
        </div>
      </div>
      
      <div class="game-info">
        <h3>📊 Statistics</h3>
        <p>High Score: <strong>${globalStats.highScore}</strong></p>
        <p>Games Played: <strong>${globalStats.gamesPlayed}</strong></p>
        <p>Total Food Eaten: <strong>${globalStats.totalFoodEaten}</strong></p>
      </div>
    </div>
  `;

  console.log('✅ HTML criado');

  // Pega o canvas
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;

  // Verifica se o canvas foi criado
  if (!canvas) {
    console.error('❌ Canvas não encontrado!');
    return;
  }

  console.log('✅ Canvas encontrado');

  try {
    // Cria e inicia o game engine
    const game = new GameEngine(canvas);
    console.log('✅ GameEngine criado');
    
    game.start();
    console.log('✅ Jogo iniciado!');

    // Log de inicialização
    console.log('🐍 Snake Game iniciado com sucesso!');
    console.log('📊 Canvas size:', CANVAS_WIDTH, 'x', CANVAS_HEIGHT);

    // Expõe o game no window para debug (remover em produção)
    if (import.meta.env.DEV) {
      (window as any).game = game;
      console.log('🔧 Debug mode: acesse "window.game" no console');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar o jogo:', error);
  }
}

// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', init);

// Para compatibilidade, também chama se o DOM já estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}