/**
 * GEditor Clone - Canvas Manager
 * Handles block rendering, selection, and drag-drop on the canvas
 */

import { store } from '../core/state.js';
import { eventBus, Events } from '../core/events.js';
import { blockRegistry } from './block-registry.js';
import { history } from '../core/history.js';

class CanvasManager {
  constructor() {
    this.canvas = null;
    this.blocksContainer = null;
    this.emptyState = null;
    this.sortable = null;
    this.isDragging = false;

    this._init();
  }

  /**
   * Initialize the canvas
   * @private
   */
  _init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._setup());
    } else {
      this._setup();
    }
  }

  /**
   * Setup canvas elements and events
   * @private
   */
  _setup() {
    this.canvas = document.getElementById('canvas');
    this.blocksContainer = document.getElementById('canvasBlocks');
    this.emptyState = document.getElementById('canvasEmpty');

    if (!this.canvas || !this.blocksContainer) {
      console.error('Canvas elements not found');
      return;
    }

    // Setup event listeners
    this._setupEventListeners();

    // Setup drag-drop for reordering
    this._setupSortable();

    // Subscribe to state changes
    this._setupStoreSubscription();

    // Initial render
    this.render();
  }

  /**
   * Setup DOM event listeners
   * @private
   */
  _setupEventListeners() {
    // Click on canvas to deselect
    this.canvas.addEventListener('click', (e) => {
      if (e.target === this.canvas || e.target === this.blocksContainer || e.target === this.emptyState) {
        store.selectBlock(null);
      }
    });

    // Click on block to select
    this.blocksContainer.addEventListener('click', (e) => {
      const blockEl = e.target.closest('[data-block-id]');
      if (blockEl) {
        e.stopPropagation();
        const blockId = blockEl.dataset.blockId;
        store.selectBlock(blockId);
      }
    });

    // Double-click for inline editing (text blocks)
    this.blocksContainer.addEventListener('dblclick', (e) => {
      const blockEl = e.target.closest('.block-text');
      if (blockEl) {
        this._enableInlineEdit(blockEl);
      }
    });

    // Drag over canvas for external drops
    this.canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.canvas.classList.add('drag-over');
    });

    this.canvas.addEventListener('dragleave', (e) => {
      if (!this.canvas.contains(e.relatedTarget)) {
        this.canvas.classList.remove('drag-over');
      }
    });

    // Drop from external (library panel)
    this.canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      this.canvas.classList.remove('drag-over');

      const blockType = e.dataTransfer.getData('text/block-type');
      if (blockType) {
        this._handleBlockDrop(blockType, e);
      }
    });

    // Context menu
    this.blocksContainer.addEventListener('contextmenu', (e) => {
      const blockEl = e.target.closest('[data-block-id]');
      if (blockEl) {
        e.preventDefault();
        const blockId = blockEl.dataset.blockId;
        store.selectBlock(blockId);
        this._showContextMenu(e, blockId);
      }
    });
  }

  /**
   * Setup SortableJS for block reordering
   * @private
   */
  _setupSortable() {
    if (typeof Sortable === 'undefined') {
      console.warn('SortableJS not loaded');
      return;
    }

    this.sortable = new Sortable(this.blocksContainer, {
      animation: 150,
      ghostClass: 'block-ghost',
      dragClass: 'block-dragging',
      handle: '.block',
      filter: '.block-toolbar',
      onStart: () => {
        this.isDragging = true;
        history.captureState();
      },
      onEnd: (evt) => {
        this.isDragging = false;

        if (evt.oldIndex !== evt.newIndex) {
          // Get new order from DOM
          const blockElements = this.blocksContainer.querySelectorAll('[data-block-id]');
          const newOrder = Array.from(blockElements).map(el => el.dataset.blockId);
          store.reorderBlocks(newOrder);
        }
      }
    });
  }

  /**
   * Setup store subscription
   * @private
   */
  _setupStoreSubscription() {
    // Watch for block changes
    store.watch('blocks', () => {
      this.render();
    });

    // Watch for selection changes
    store.watch('selectedBlockId', (selectedId) => {
      this._updateSelection(selectedId);
    });

    // Listen for render requests
    eventBus.on(Events.CANVAS_RENDER, () => {
      this.render();
    });
  }

  /**
   * Render all blocks
   */
  render() {
    const blocks = store.getBlocks();

    // Show/hide empty state
    if (blocks.length === 0) {
      this.emptyState.classList.remove('hidden');
      this.blocksContainer.innerHTML = '';
      return;
    }

    this.emptyState.classList.add('hidden');

    // Render blocks
    const html = blocks.map(block => {
      const blockHtml = blockRegistry.renderBlock(block);
      return this._wrapBlock(block, blockHtml);
    }).join('');

    this.blocksContainer.innerHTML = html;

    // Restore selection
    const selectedId = store.get('selectedBlockId');
    if (selectedId) {
      this._updateSelection(selectedId);
    }

    eventBus.emit(Events.CANVAS_RENDER, { blockCount: blocks.length });
  }

  /**
   * Wrap block HTML with toolbar and controls
   * @private
   */
  _wrapBlock(block, innerHtml) {
    const isSelected = store.get('selectedBlockId') === block.id;
    const selectedClass = isSelected ? 'selected' : '';

    // Parse inner HTML to add wrapper
    const temp = document.createElement('div');
    temp.innerHTML = innerHtml.trim();
    const blockEl = temp.firstElementChild;

    if (blockEl) {
      blockEl.classList.toggle('selected', isSelected);

      // Add toolbar
      const toolbar = `
        <div class="block-toolbar">
          <button class="block-toolbar-btn" data-action="move-up" title="위로 이동">
            <span class="material-symbols-outlined">arrow_upward</span>
          </button>
          <button class="block-toolbar-btn" data-action="move-down" title="아래로 이동">
            <span class="material-symbols-outlined">arrow_downward</span>
          </button>
          <div class="block-toolbar-divider"></div>
          <button class="block-toolbar-btn" data-action="duplicate" title="복제">
            <span class="material-symbols-outlined">content_copy</span>
          </button>
          <button class="block-toolbar-btn danger" data-action="delete" title="삭제">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      `;

      blockEl.insertAdjacentHTML('afterbegin', toolbar);

      // Add toolbar event listeners via event delegation
      return blockEl.outerHTML;
    }

    return innerHtml;
  }

  /**
   * Update block selection visuals
   * @private
   */
  _updateSelection(selectedId) {
    // Remove selection from all blocks
    this.blocksContainer.querySelectorAll('.block.selected').forEach(el => {
      el.classList.remove('selected');
    });

    // Add selection to selected block
    if (selectedId) {
      const blockEl = this.blocksContainer.querySelector(`[data-block-id="${selectedId}"]`);
      if (blockEl) {
        blockEl.classList.add('selected');
      }
    }
  }

  /**
   * Handle block drop from library
   * @private
   */
  _handleBlockDrop(blockType, event) {
    try {
      const block = blockRegistry.createBlock(blockType);
      store.addBlock(block);
      store.selectBlock(block.id);

      eventBus.emit(Events.TOAST_SHOW, {
        type: 'success',
        message: '블록이 추가되었습니다'
      });
    } catch (error) {
      console.error('Failed to add block:', error);
      eventBus.emit(Events.TOAST_SHOW, {
        type: 'error',
        message: '블록 추가에 실패했습니다'
      });
    }
  }

  /**
   * Enable inline text editing
   * @private
   */
  _enableInlineEdit(blockEl) {
    const blockId = blockEl.dataset.blockId;
    const block = store.getBlock(blockId);

    if (!block || block.type !== 'text') return;

    blockEl.setAttribute('contenteditable', 'true');
    blockEl.classList.add('editing');
    blockEl.focus();

    // Select all text
    const range = document.createRange();
    range.selectNodeContents(blockEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    // Handle blur to save
    const handleBlur = () => {
      blockEl.setAttribute('contenteditable', 'false');
      blockEl.classList.remove('editing');

      // Save content
      const content = blockEl.innerHTML;
      store.updateBlock(blockId, { props: { ...block.props, content } });

      blockEl.removeEventListener('blur', handleBlur);
    };

    // Handle escape to cancel
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        blockEl.innerHTML = block.props.content; // Restore original
        blockEl.blur();
      }
    };

    blockEl.addEventListener('blur', handleBlur);
    blockEl.addEventListener('keydown', handleKeydown);
  }

  /**
   * Show context menu
   * @private
   */
  _showContextMenu(event, blockId) {
    // Remove existing context menu
    const existing = document.querySelector('.context-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
      <button class="context-menu-item" data-action="duplicate">
        <span class="material-symbols-outlined">content_copy</span>
        <span>복제</span>
        <span class="shortcut">Ctrl+D</span>
      </button>
      <button class="context-menu-item" data-action="move-up">
        <span class="material-symbols-outlined">arrow_upward</span>
        <span>위로 이동</span>
      </button>
      <button class="context-menu-item" data-action="move-down">
        <span class="material-symbols-outlined">arrow_downward</span>
        <span>아래로 이동</span>
      </button>
      <div class="context-menu-divider"></div>
      <button class="context-menu-item danger" data-action="delete">
        <span class="material-symbols-outlined">delete</span>
        <span>삭제</span>
        <span class="shortcut">Delete</span>
      </button>
    `;

    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;

    document.body.appendChild(menu);

    // Handle menu item clicks
    menu.addEventListener('click', (e) => {
      const item = e.target.closest('[data-action]');
      if (item) {
        this._handleBlockAction(item.dataset.action, blockId);
        menu.remove();
      }
    });

    // Close on click outside
    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  }

  /**
   * Handle block toolbar/context actions
   * @param {string} action - Action name
   * @param {string} blockId - Block ID
   */
  _handleBlockAction(action, blockId) {
    const blocks = store.getBlocks();
    const index = blocks.findIndex(b => b.id === blockId);

    switch (action) {
      case 'move-up':
        if (index > 0) {
          store.moveBlock(blockId, index - 1);
        }
        break;

      case 'move-down':
        if (index < blocks.length - 1) {
          store.moveBlock(blockId, index + 1);
        }
        break;

      case 'duplicate':
        const newBlock = store.duplicateBlock(blockId);
        if (newBlock) {
          store.selectBlock(newBlock.id);
        }
        break;

      case 'delete':
        store.removeBlock(blockId);
        break;
    }
  }

  /**
   * Add a block by type
   * @param {string} type - Block type
   * @param {number} [index] - Insert index
   */
  addBlock(type, index) {
    const block = blockRegistry.createBlock(type);
    store.addBlock(block, index);
    store.selectBlock(block.id);
    return block;
  }

  /**
   * Set view mode (desktop/mobile)
   * @param {string} mode - 'desktop' or 'mobile'
   */
  setViewMode(mode) {
    store.set('ui.viewMode', mode);
    this.canvas.classList.toggle('mobile-view', mode === 'mobile');

    const widthDisplay = document.getElementById('canvasWidthDisplay');
    if (widthDisplay) {
      widthDisplay.textContent = mode === 'mobile' ? '375px' : '860px';
    }
  }

  /**
   * Clear all blocks
   */
  clear() {
    history.captureState();
    store.set('blocks', []);
    store.selectBlock(null);
    eventBus.emit(Events.CANVAS_CLEAR);
  }
}

// Export singleton instance
export const canvasManager = new CanvasManager();

export default canvasManager;
