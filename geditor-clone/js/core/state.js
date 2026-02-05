/**
 * GEditor Clone - Reactive State Store
 * Observable state management with path-based subscriptions
 */

import { deepClone, deepMerge, getByPath, setByPath } from './utils.js';
import { eventBus, Events } from './events.js';

/**
 * Initial state structure
 */
const initialState = {
  // Project metadata
  project: {
    id: null,
    name: '새 프로젝트',
    createdAt: null,
    updatedAt: null,
    isDirty: false
  },

  // Canvas blocks
  blocks: [],

  // Currently selected block ID
  selectedBlockId: null,

  // UI state
  ui: {
    activePanel: 'ai',
    leftPanelCollapsed: false,
    rightPanelCollapsed: false,
    viewMode: 'desktop', // 'desktop' | 'mobile'
    zoom: 100,
    isLoading: false,
    loadingMessage: ''
  },

  // Theme settings
  theme: {
    primaryColor: '#4A90E2',
    secondaryColor: '#7C3AED',
    backgroundColor: '#FFFFFF',
    textColor: '#1A202C'
  },

  // Editor settings
  settings: {
    openaiApiKey: '',
    autosaveEnabled: true,
    autosaveInterval: 60000, // 60 seconds
    showGrid: false
  },

  // Clipboard for copy/paste
  clipboard: null
};

/**
 * Reactive State Store
 */
class Store {
  constructor(initialData = {}) {
    this._state = deepMerge(deepClone(initialState), initialData);
    this._subscribers = new Map();
    this._pathSubscribers = new Map();
  }

  /**
   * Get current state or value at path
   * @param {string} [path] - Optional dot-notation path
   * @returns {*} State or value at path
   */
  get(path) {
    if (!path) {
      return deepClone(this._state);
    }
    return deepClone(getByPath(this._state, path));
  }

  /**
   * Set state value at path
   * @param {string} path - Dot-notation path
   * @param {*} value - Value to set
   * @param {boolean} [silent=false] - Skip notifications
   */
  set(path, value, silent = false) {
    const oldValue = getByPath(this._state, path);

    // Skip if value hasn't changed
    if (JSON.stringify(oldValue) === JSON.stringify(value)) {
      return;
    }

    setByPath(this._state, path, deepClone(value));

    // Mark project as dirty
    if (!path.startsWith('ui.') && !path.startsWith('clipboard')) {
      this._state.project.isDirty = true;
      this._state.project.updatedAt = new Date().toISOString();
    }

    if (!silent) {
      this._notify(path, value, oldValue);
    }
  }

  /**
   * Update state with partial object
   * @param {string} path - Base path
   * @param {Object} updates - Partial updates
   */
  update(path, updates) {
    const current = this.get(path) || {};
    const merged = deepMerge(current, updates);
    this.set(path, merged);
  }

  /**
   * Reset state to initial values
   */
  reset() {
    this._state = deepClone(initialState);
    eventBus.emit(Events.STATE_RESET);
    this._notifyAll();
  }

  /**
   * Subscribe to all state changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    const id = Symbol();
    this._subscribers.set(id, callback);
    return () => this._subscribers.delete(id);
  }

  /**
   * Subscribe to changes at specific path
   * @param {string} path - Path to watch
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  watch(path, callback) {
    if (!this._pathSubscribers.has(path)) {
      this._pathSubscribers.set(path, new Set());
    }
    this._pathSubscribers.get(path).add(callback);

    return () => {
      const subs = this._pathSubscribers.get(path);
      if (subs) {
        subs.delete(callback);
      }
    };
  }

  /**
   * Notify subscribers of change
   * @private
   */
  _notify(path, newValue, oldValue) {
    const change = { path, newValue, oldValue };

    // Notify global subscribers
    this._subscribers.forEach(callback => {
      try {
        callback(change);
      } catch (error) {
        console.error('Store subscriber error:', error);
      }
    });

    // Notify path-specific subscribers
    this._pathSubscribers.forEach((subscribers, watchPath) => {
      // Match exact path or parent paths
      if (path === watchPath || path.startsWith(watchPath + '.')) {
        subscribers.forEach(callback => {
          try {
            callback(this.get(watchPath), change);
          } catch (error) {
            console.error(`Store watcher error for "${watchPath}":`, error);
          }
        });
      }
    });

    // Emit global event
    eventBus.emit(Events.STATE_CHANGE, change);
  }

  /**
   * Notify all subscribers (used after reset)
   * @private
   */
  _notifyAll() {
    this._subscribers.forEach(callback => {
      try {
        callback({ path: '', newValue: this._state, oldValue: null });
      } catch (error) {
        console.error('Store subscriber error:', error);
      }
    });
  }

  // ============================================
  // Block-specific convenience methods
  // ============================================

  /**
   * Get all blocks
   * @returns {Array} Blocks array
   */
  getBlocks() {
    return this.get('blocks') || [];
  }

  /**
   * Get block by ID
   * @param {string} id - Block ID
   * @returns {Object|null} Block object or null
   */
  getBlock(id) {
    const blocks = this.getBlocks();
    return blocks.find(b => b.id === id) || null;
  }

  /**
   * Add a block
   * @param {Object} block - Block object
   * @param {number} [index] - Insert index (default: end)
   */
  addBlock(block, index) {
    const blocks = this.getBlocks();
    const idx = index !== undefined ? index : blocks.length;
    blocks.splice(idx, 0, block);
    this.set('blocks', blocks);
    eventBus.emit(Events.BLOCK_ADD, { block, index: idx });
  }

  /**
   * Update a block
   * @param {string} id - Block ID
   * @param {Object} updates - Partial updates
   */
  updateBlock(id, updates) {
    const blocks = this.getBlocks();
    const index = blocks.findIndex(b => b.id === id);

    if (index === -1) return;

    blocks[index] = deepMerge(blocks[index], updates);
    this.set('blocks', blocks);
    eventBus.emit(Events.BLOCK_UPDATE, { id, updates, block: blocks[index] });
  }

  /**
   * Remove a block
   * @param {string} id - Block ID
   */
  removeBlock(id) {
    const blocks = this.getBlocks();
    const index = blocks.findIndex(b => b.id === id);

    if (index === -1) return;

    const removed = blocks.splice(index, 1)[0];
    this.set('blocks', blocks);

    // Clear selection if removed block was selected
    if (this.get('selectedBlockId') === id) {
      this.set('selectedBlockId', null);
    }

    eventBus.emit(Events.BLOCK_REMOVE, { block: removed, index });
  }

  /**
   * Move block to new index
   * @param {string} id - Block ID
   * @param {number} newIndex - New index
   */
  moveBlock(id, newIndex) {
    const blocks = this.getBlocks();
    const oldIndex = blocks.findIndex(b => b.id === id);

    if (oldIndex === -1) return;

    const [block] = blocks.splice(oldIndex, 1);
    blocks.splice(newIndex, 0, block);
    this.set('blocks', blocks);
    eventBus.emit(Events.BLOCK_MOVE, { id, oldIndex, newIndex });
  }

  /**
   * Reorder blocks (after drag-drop)
   * @param {Array} newOrder - Array of block IDs in new order
   */
  reorderBlocks(newOrder) {
    const blocks = this.getBlocks();
    const blockMap = new Map(blocks.map(b => [b.id, b]));
    const reordered = newOrder.map(id => blockMap.get(id)).filter(Boolean);
    this.set('blocks', reordered);
    eventBus.emit(Events.BLOCK_REORDER, { order: newOrder });
  }

  /**
   * Get selected block
   * @returns {Object|null} Selected block or null
   */
  getSelectedBlock() {
    const id = this.get('selectedBlockId');
    return id ? this.getBlock(id) : null;
  }

  /**
   * Select a block
   * @param {string|null} id - Block ID or null to deselect
   */
  selectBlock(id) {
    const previousId = this.get('selectedBlockId');

    if (previousId === id) return;

    if (previousId) {
      eventBus.emit(Events.BLOCK_DESELECT, { id: previousId });
    }

    this.set('selectedBlockId', id);

    if (id) {
      eventBus.emit(Events.BLOCK_SELECT, { id, block: this.getBlock(id) });
    }
  }

  /**
   * Duplicate a block
   * @param {string} id - Block ID to duplicate
   * @returns {Object|null} Duplicated block or null
   */
  duplicateBlock(id) {
    const block = this.getBlock(id);
    if (!block) return null;

    const blocks = this.getBlocks();
    const index = blocks.findIndex(b => b.id === id);

    const newBlock = {
      ...deepClone(block),
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.addBlock(newBlock, index + 1);
    eventBus.emit(Events.BLOCK_DUPLICATE, { original: block, duplicate: newBlock });

    return newBlock;
  }

  // ============================================
  // Serialization
  // ============================================

  /**
   * Export state for saving
   * @returns {Object} Serializable state
   */
  toJSON() {
    return {
      project: this.get('project'),
      blocks: this.get('blocks'),
      theme: this.get('theme'),
      settings: this.get('settings')
    };
  }

  /**
   * Import state from saved data
   * @param {Object} data - Saved state data
   */
  fromJSON(data) {
    if (data.project) this.set('project', data.project);
    if (data.blocks) this.set('blocks', data.blocks);
    if (data.theme) this.set('theme', data.theme);
    if (data.settings) this.set('settings', data.settings);
  }
}

// Create and export singleton instance
export const store = new Store();

export default store;
