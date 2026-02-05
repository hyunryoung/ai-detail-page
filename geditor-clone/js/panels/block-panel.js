/**
 * GEditor Clone - Block Library Panel
 * Displays available blocks for drag-and-drop
 */

import { blockRegistry } from '../editor/block-registry.js';
import { eventBus, Events } from '../core/events.js';

class BlockPanel {
  constructor() {
    this.container = null;
    this.searchInput = null;
    this.tabs = null;
    this.currentCategory = 'all';
    this.searchQuery = '';

    this._init();
  }

  /**
   * Initialize the block panel
   * @private
   */
  _init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._setup());
    } else {
      this._setup();
    }
  }

  /**
   * Setup panel elements
   * @private
   */
  _setup() {
    this.container = document.getElementById('blockLibrary');
    const panelBlock = document.getElementById('panelBlock');

    if (!this.container || !panelBlock) return;

    // Setup search
    this.searchInput = panelBlock.querySelector('.search-input');
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.render();
      });
    }

    // Setup tabs
    this.tabs = panelBlock.querySelectorAll('.panel-tab');
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const text = tab.textContent.trim();
        this.currentCategory = this._getCategoryFromText(text);
        this.render();
      });
    });

    // Initial render
    this.render();
  }

  /**
   * Get category key from tab text
   * @private
   */
  _getCategoryFromText(text) {
    const map = {
      '전체': 'all',
      '기본': 'basic',
      '레이아웃': 'layout',
      '상품': 'product',
      '기타': 'other'
    };
    return map[text] || 'all';
  }

  /**
   * Render block library
   */
  render() {
    if (!this.container) return;

    // Get all block types
    const allTypes = blockRegistry.getAll();
    let blocks = [];

    allTypes.forEach((config, type) => {
      blocks.push({ type, ...config });
    });

    // Filter by category
    if (this.currentCategory !== 'all') {
      blocks = blocks.filter(b => b.category === this.currentCategory);
    }

    // Filter by search
    if (this.searchQuery) {
      blocks = blocks.filter(b =>
        b.name.toLowerCase().includes(this.searchQuery) ||
        b.description.toLowerCase().includes(this.searchQuery)
      );
    }

    // Group by category
    const grouped = this._groupByCategory(blocks);

    // Render HTML
    let html = '';

    for (const [category, categoryBlocks] of Object.entries(grouped)) {
      const categoryName = this._getCategoryName(category);

      html += `
        <div class="category-section">
          <div class="category-header">
            <span class="category-title">${categoryName}</span>
            <span class="category-count">${categoryBlocks.length}</span>
          </div>
          <div class="item-grid">
            ${categoryBlocks.map(block => this._renderBlockCard(block)).join('')}
          </div>
        </div>
      `;
    }

    if (blocks.length === 0) {
      html = `
        <div class="panel-empty">
          <span class="material-symbols-outlined">search_off</span>
          <div class="panel-empty-title">검색 결과 없음</div>
          <div class="panel-empty-desc">다른 검색어를 입력해보세요.</div>
        </div>
      `;
    }

    this.container.innerHTML = html;

    // Setup drag events
    this._setupDragEvents();
  }

  /**
   * Group blocks by category
   * @private
   */
  _groupByCategory(blocks) {
    const grouped = {};

    blocks.forEach(block => {
      const cat = block.category || 'other';
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(block);
    });

    return grouped;
  }

  /**
   * Get display name for category
   * @private
   */
  _getCategoryName(category) {
    const names = {
      basic: '기본',
      layout: '레이아웃',
      product: '상품',
      social: 'SNS',
      other: '기타'
    };
    return names[category] || category;
  }

  /**
   * Render a single block card
   * @private
   */
  _renderBlockCard(block) {
    return `
      <div class="item-card" draggable="true" data-block-type="${block.type}">
        <div class="item-card-thumb">
          <span class="material-symbols-outlined">${block.icon}</span>
        </div>
        <div class="item-card-info">
          <span class="item-card-name">${block.name}</span>
        </div>
        <button class="item-card-favorite" title="즐겨찾기">
          <span class="material-symbols-outlined">star</span>
        </button>
      </div>
    `;
  }

  /**
   * Setup drag events for block cards
   * @private
   */
  _setupDragEvents() {
    const cards = this.container.querySelectorAll('.item-card[draggable]');

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        const blockType = card.dataset.blockType;
        e.dataTransfer.setData('text/block-type', blockType);
        e.dataTransfer.effectAllowed = 'copy';

        // Add dragging visual
        card.classList.add('dragging');

        eventBus.emit(Events.DRAG_START, { type: 'block', blockType });
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        eventBus.emit(Events.DRAG_END);
      });
    });

    // Favorite button click
    this.container.addEventListener('click', (e) => {
      const favBtn = e.target.closest('.item-card-favorite');
      if (favBtn) {
        e.stopPropagation();
        favBtn.classList.toggle('active');

        // TODO: Save to favorites
        eventBus.emit(Events.TOAST_SHOW, {
          type: 'success',
          message: favBtn.classList.contains('active')
            ? '즐겨찾기에 추가되었습니다'
            : '즐겨찾기에서 제거되었습니다'
        });
      }
    });
  }
}

// Export singleton
export const blockPanel = new BlockPanel();

export default blockPanel;
