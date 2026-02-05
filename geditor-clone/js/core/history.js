/**
 * GEditor Clone - History Manager (Undo/Redo)
 * Snapshot-based history with configurable depth
 */

import { deepClone } from './utils.js';
import { eventBus, Events } from './events.js';
import { store } from './state.js';

class HistoryManager {
  constructor(options = {}) {
    this.maxHistory = options.maxHistory || 50;
    this.undoStack = [];
    this.redoStack = [];
    this._isPerformingAction = false;

    // Subscribe to state changes for auto-snapshots
    this._setupAutoCapture();
  }

  /**
   * Setup automatic state capture on changes
   * @private
   */
  _setupAutoCapture() {
    // Debounced capture to batch rapid changes
    let captureTimeout = null;
    let pendingCapture = null;

    store.subscribe(({ path, newValue, oldValue }) => {
      // Skip UI-only changes and during undo/redo
      if (this._isPerformingAction) return;
      if (path.startsWith('ui.') || path === 'clipboard' || path === 'selectedBlockId') return;

      // Clear pending capture
      if (captureTimeout) {
        clearTimeout(captureTimeout);
      }

      // Batch captures within 300ms
      if (!pendingCapture) {
        pendingCapture = this._createSnapshot();
      }

      captureTimeout = setTimeout(() => {
        this.push(pendingCapture);
        pendingCapture = null;
        captureTimeout = null;
      }, 300);
    });
  }

  /**
   * Create a snapshot of current state
   * @private
   * @returns {Object} State snapshot
   */
  _createSnapshot() {
    return {
      blocks: store.get('blocks'),
      theme: store.get('theme'),
      project: {
        name: store.get('project.name')
      },
      timestamp: Date.now()
    };
  }

  /**
   * Apply a snapshot to state
   * @private
   * @param {Object} snapshot - Snapshot to apply
   */
  _applySnapshot(snapshot) {
    this._isPerformingAction = true;

    if (snapshot.blocks) {
      store.set('blocks', snapshot.blocks, true);
    }
    if (snapshot.theme) {
      store.set('theme', snapshot.theme, true);
    }
    if (snapshot.project) {
      store.update('project', snapshot.project);
    }

    // Trigger canvas re-render
    eventBus.emit(Events.CANVAS_RENDER);

    this._isPerformingAction = false;
  }

  /**
   * Push current state to history
   * @param {Object} [snapshot] - Optional pre-created snapshot
   */
  push(snapshot) {
    if (this._isPerformingAction) return;

    const snap = snapshot || this._createSnapshot();

    // Don't push if identical to last snapshot
    if (this.undoStack.length > 0) {
      const last = this.undoStack[this.undoStack.length - 1];
      if (JSON.stringify(last.blocks) === JSON.stringify(snap.blocks)) {
        return;
      }
    }

    this.undoStack.push(deepClone(snap));

    // Trim history if exceeds max
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }

    // Clear redo stack on new action
    this.redoStack = [];

    this._emitChange();
    eventBus.emit(Events.HISTORY_PUSH);
  }

  /**
   * Undo last action
   * @returns {boolean} Success
   */
  undo() {
    if (!this.canUndo()) return false;

    // Save current state to redo stack
    const currentSnapshot = this._createSnapshot();
    this.redoStack.push(currentSnapshot);

    // Pop and apply previous state
    const previousSnapshot = this.undoStack.pop();
    this._applySnapshot(previousSnapshot);

    this._emitChange();
    eventBus.emit(Events.HISTORY_UNDO);

    return true;
  }

  /**
   * Redo last undone action
   * @returns {boolean} Success
   */
  redo() {
    if (!this.canRedo()) return false;

    // Save current state to undo stack
    const currentSnapshot = this._createSnapshot();
    this.undoStack.push(currentSnapshot);

    // Pop and apply redo state
    const redoSnapshot = this.redoStack.pop();
    this._applySnapshot(redoSnapshot);

    this._emitChange();
    eventBus.emit(Events.HISTORY_REDO);

    return true;
  }

  /**
   * Check if undo is available
   * @returns {boolean}
   */
  canUndo() {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   * @returns {boolean}
   */
  canRedo() {
    return this.redoStack.length > 0;
  }

  /**
   * Clear all history
   */
  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this._emitChange();
  }

  /**
   * Get history info
   * @returns {Object} History status
   */
  getStatus() {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }

  /**
   * Emit history change event
   * @private
   */
  _emitChange() {
    eventBus.emit(Events.HISTORY_CHANGE, this.getStatus());
  }

  /**
   * Perform an action without capturing to history
   * @param {Function} action - Action to perform
   */
  withoutCapture(action) {
    this._isPerformingAction = true;
    try {
      action();
    } finally {
      this._isPerformingAction = false;
    }
  }

  /**
   * Capture current state explicitly (before a destructive action)
   */
  captureState() {
    this.push(this._createSnapshot());
  }
}

// Create and export singleton instance
export const history = new HistoryManager();

export default history;
