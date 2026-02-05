/**
 * GEditor Clone - Keyboard Shortcuts Service
 */

import { store } from '../core/state.js';
import { eventBus, Events } from '../core/events.js';
import { history } from '../core/history.js';

class KeyboardService {
  constructor() {
    this.shortcuts = new Map();
    this._init();
  }

  /**
   * Initialize keyboard service
   * @private
   */
  _init() {
    this._registerDefaultShortcuts();

    document.addEventListener('keydown', (e) => this._handleKeydown(e));
  }

  /**
   * Register default keyboard shortcuts
   * @private
   */
  _registerDefaultShortcuts() {
    // Undo/Redo
    this.register('ctrl+z', () => {
      history.undo();
      eventBus.emit(Events.SHORTCUT_UNDO);
    });

    this.register('ctrl+y', () => {
      history.redo();
      eventBus.emit(Events.SHORTCUT_REDO);
    });

    this.register('ctrl+shift+z', () => {
      history.redo();
      eventBus.emit(Events.SHORTCUT_REDO);
    });

    // Save
    this.register('ctrl+s', () => {
      eventBus.emit(Events.SHORTCUT_SAVE);
      eventBus.emit(Events.TOAST_SHOW, {
        type: 'success',
        message: '저장되었습니다'
      });
    });

    // Delete
    this.register('delete', () => {
      const selectedId = store.get('selectedBlockId');
      if (selectedId) {
        store.removeBlock(selectedId);
        eventBus.emit(Events.SHORTCUT_DELETE);
      }
    });

    this.register('backspace', () => {
      // Only when not in input
      const selectedId = store.get('selectedBlockId');
      if (selectedId) {
        store.removeBlock(selectedId);
        eventBus.emit(Events.SHORTCUT_DELETE);
      }
    });

    // Duplicate
    this.register('ctrl+d', () => {
      const selectedId = store.get('selectedBlockId');
      if (selectedId) {
        const newBlock = store.duplicateBlock(selectedId);
        if (newBlock) {
          store.selectBlock(newBlock.id);
          eventBus.emit(Events.SHORTCUT_DUPLICATE);
        }
      }
    });

    // Escape (deselect)
    this.register('escape', () => {
      store.selectBlock(null);
      eventBus.emit(Events.SHORTCUT_ESCAPE);
    });

    // Arrow keys for block navigation
    this.register('arrowup', () => {
      const selectedId = store.get('selectedBlockId');
      if (selectedId) {
        const blocks = store.getBlocks();
        const index = blocks.findIndex(b => b.id === selectedId);
        if (index > 0) {
          store.selectBlock(blocks[index - 1].id);
        }
      }
    });

    this.register('arrowdown', () => {
      const selectedId = store.get('selectedBlockId');
      if (selectedId) {
        const blocks = store.getBlocks();
        const index = blocks.findIndex(b => b.id === selectedId);
        if (index < blocks.length - 1) {
          store.selectBlock(blocks[index + 1].id);
        }
      }
    });

    // Move block up/down with Ctrl+Arrow
    this.register('ctrl+arrowup', () => {
      const selectedId = store.get('selectedBlockId');
      if (selectedId) {
        const blocks = store.getBlocks();
        const index = blocks.findIndex(b => b.id === selectedId);
        if (index > 0) {
          store.moveBlock(selectedId, index - 1);
        }
      }
    });

    this.register('ctrl+arrowdown', () => {
      const selectedId = store.get('selectedBlockId');
      if (selectedId) {
        const blocks = store.getBlocks();
        const index = blocks.findIndex(b => b.id === selectedId);
        if (index < blocks.length - 1) {
          store.moveBlock(selectedId, index + 1);
        }
      }
    });
  }

  /**
   * Register a keyboard shortcut
   * @param {string} combo - Key combination (e.g., 'ctrl+s', 'delete')
   * @param {Function} handler - Callback function
   */
  register(combo, handler) {
    this.shortcuts.set(combo.toLowerCase(), handler);
  }

  /**
   * Unregister a keyboard shortcut
   * @param {string} combo - Key combination
   */
  unregister(combo) {
    this.shortcuts.delete(combo.toLowerCase());
  }

  /**
   * Handle keydown event
   * @private
   */
  _handleKeydown(e) {
    // Skip if typing in input/textarea
    const target = e.target;
    if (target.matches('input, textarea, [contenteditable="true"]')) {
      // Allow save shortcut even in inputs
      if (e.key.toLowerCase() === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const handler = this.shortcuts.get('ctrl+s');
        if (handler) handler(e);
      }
      return;
    }

    // Build combo string
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey) parts.push('alt');

    const key = e.key.toLowerCase();
    if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
      parts.push(key);
    }

    const combo = parts.join('+');

    // Check for handler
    const handler = this.shortcuts.get(combo);
    if (handler) {
      e.preventDefault();
      handler(e);
    }
  }

  /**
   * Get all registered shortcuts
   * @returns {Map}
   */
  getAll() {
    return this.shortcuts;
  }
}

// Export singleton
export const keyboardService = new KeyboardService();

export default keyboardService;
