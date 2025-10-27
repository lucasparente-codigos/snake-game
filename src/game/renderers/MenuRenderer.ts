// ============================================
// 🎨 MENU RENDERER - Renderiza Menus no Canvas
// ============================================

import { COLORS } from '../../utils/styles.constants';
import type { GlobalStats } from '../../types';

interface MenuItem {
  text: string;
  action: () => void;
  enabled?: boolean;
}

export class MenuRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private selectedIndex: number = 0;
  private menuItems: MenuItem[] = [];
  
  // Animação
  private pulseTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Não foi possível obter contexto 2D');
    }
    
    this.ctx = context;
  }

  /**
   * Define os itens do menu
   */
  setMenuItems(items: MenuItem[]): void {
    this.menuItems = items;
    this.selectedIndex = 0;
  }

  /**
   * Move seleção para cima
   */
  moveUp(): void {
    if (this.menuItems.length === 0) return;
    
    this.selectedIndex = (this.selectedIndex - 1 + this.menuItems.length) % this.menuItems.length;
  }

  /**
   * Move seleção para baixo
   */
  moveDown(): void {
    if (this.menuItems.length === 0) return;
    
    this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length;
  }

  /**
   * Executa ação do item selecionado
   */
  select(): void {
    const item = this.menuItems[this.selectedIndex];
    
    if (item && item.enabled !== false) {
      item.action();
    }
  }

  /**
   * Renderiza o menu principal
   */
  renderMainMenu(stats: GlobalStats): void {
    this.clearCanvas();
    
    // Título
    this.drawTitle('🐍 SNAKE GAME');
    
    // Subtítulo com high score
    this.ctx.fillStyle = '#888';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      `High Score: ${stats.highScore}`,
      this.canvas.width / 2,
      this.canvas.height / 2 - 80
    );
    
    // Menu items
    const menuY = this.canvas.height / 2 - 20;
    const spacing = 50;
    
    this.menuItems.forEach((item, index) => {
      const y = menuY + (index * spacing);
      const isSelected = index === this.selectedIndex;
      
      this.drawMenuItem(item.text, y, isSelected);
    });
    
    // Footer
    this.drawFooter('Use ↑↓ or WS to navigate • ENTER or SPACE to select');
  }

  /**
   * Renderiza tela de estatísticas
   */
  renderStatsScreen(stats: GlobalStats): void {
    this.clearCanvas();
    
    this.drawTitle('📊 STATISTICS');
    
    const centerX = this.canvas.width / 2;
    const startY = this.canvas.height / 2 - 60;
    const lineHeight = 40;
    
    const statsToShow = [
      { label: 'High Score', value: stats.highScore },
      { label: 'Games Played', value: stats.gamesPlayed },
      { label: 'Total Food Eaten', value: stats.totalFoodEaten },
      { label: 'Best Streak', value: stats.bestStreak },
    ];
    
    this.ctx.textAlign = 'center';
    
    statsToShow.forEach((stat, index) => {
      const y = startY + (index * lineHeight);
      
      // Label
      this.ctx.fillStyle = '#888';
      this.ctx.font = '14px monospace';
      this.ctx.fillText(stat.label, centerX, y);
      
      // Value
      this.ctx.fillStyle = COLORS.text;
      this.ctx.font = 'bold 24px monospace';
      this.ctx.fillText(stat.value.toString(), centerX, y + 20);
    });
    
    this.drawFooter('Press ESC to go back');
  }

  /**
   * Renderiza tela de configurações
   */
  renderSettingsScreen(): void {
    this.clearCanvas();
    
    this.drawTitle('⚙️ SETTINGS');
    
    const startY = this.canvas.height / 2 - 40;
    const spacing = 50;
    
    this.menuItems.forEach((item, index) => {
      const y = startY + (index * spacing);
      const isSelected = index === this.selectedIndex;
      
      this.drawMenuItem(item.text, y, isSelected);
    });
    
    this.drawFooter('Use ↑↓ to navigate • ←→ to change • ESC to go back');
  }

  /**
   * Limpa o canvas
   */
  private clearCanvas(): void {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Desenha título
   */
  private drawTitle(text: string): void {
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = 'bold 32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2 - 120);
  }

  /**
   * Desenha item de menu
   */
  private drawMenuItem(text: string, y: number, isSelected: boolean): void {
    const centerX = this.canvas.width / 2;
    
    if (isSelected) {
      // Animação de pulso
      this.pulseTime += 0.1;
      const pulse = 1 + Math.sin(this.pulseTime) * 0.05;
      
      // Fundo do item selecionado
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      const width = 200;
      const height = 35;
      this.ctx.fillRect(
        centerX - width / 2,
        y - height / 2 - 5,
        width,
        height
      );
      
      // Indicador
      this.ctx.fillStyle = COLORS.text;
      this.ctx.font = '20px monospace';
      this.ctx.fillText('▶', centerX - 100, y + 3);
      
      // Texto com escala
      this.ctx.save();
      this.ctx.translate(centerX, y);
      this.ctx.scale(pulse, pulse);
      this.ctx.fillStyle = COLORS.text;
      this.ctx.font = 'bold 20px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(text, 0, 0);
      this.ctx.restore();
    } else {
      // Texto normal
      this.ctx.fillStyle = '#666';
      this.ctx.font = '18px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(text, centerX, y);
    }
  }

  /**
   * Desenha rodapé com instruções
   */
  private drawFooter(text: string): void {
    this.ctx.fillStyle = '#444';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height - 30);
  }

  /**
   * Atualiza animações (chamar no loop)
   */
  updateAnimations(): void {
    this.pulseTime += 0.1;
  }
}