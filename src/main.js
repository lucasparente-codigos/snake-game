import './styles/main.css';
import { GameEngine } from './game/GameEngine.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './utils/constants.js';

// ============================================
// 🎮 MAIN - Entry Point do Jogo
// ============================================

/**
 * Inicializa o jogo
 */
function init() {
  // Pega o container do app
  const app = document.querySelector('#app');

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
        <p>Eat the green circles to grow!</p>
        <p>Don't hit the walls or yourself!</p>
      </div>
    </div>
  `;

  // Pega o canvas
  const canvas = document.getElementById('gameCanvas');

  // Verifica se o canvas foi criado
  if (!canvas) {
    console.error('Canvas não encontrado!');
    return;
  }

  // Cria e inicia o game engine
  const game = new GameEngine(canvas);
  game.start();

  // Log de inicialização
  console.log('🐍 Snake Game iniciado!');
  console.log('📊 Canvas size:', CANVAS_WIDTH, 'x', CANVAS_HEIGHT);

  // Expõe o game no window para debug (remover em produção)
  if (import.meta.env.DEV) {
    window.game = game;
    console.log('🔧 Debug mode: acesse "window.game" no console');
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