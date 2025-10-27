// ============================================
// 🎮 MAIN - Entry Point do Jogo
// ============================================

import './styles/main.css';
import { GameController } from './game/controllers/GameController';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './utils/game.constants';

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

  // Cria a estrutura HTML simplificada (só canvas)
  app.innerHTML = `
    <div class="game-container">
      <div class="game-wrapper">
        <canvas id="gameCanvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
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
    // Cria e inicia o game controller
    const gameController = new GameController(canvas);
    console.log('✅ GameController criado');
    
    gameController.start();
    console.log('✅ Jogo iniciado!');

    // Log de inicialização
    console.log('🐍 Snake Game iniciado com sucesso!');
    console.log('📊 Canvas size:', CANVAS_WIDTH, 'x', CANVAS_HEIGHT);

    // Expõe o controller no window para debug
    if (import.meta.env.DEV) {
      (window as any).gameController = gameController;
      console.log('🔧 Debug mode: acesse "window.gameController" no console');
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