/**
 * GEditor Clone - Event Bus (Pub/Sub)
 * Global event system for decoupled component communication
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
    this.onceListeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event once
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  once(event, callback) {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    this.onceListeners.get(event).add(callback);

    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
    if (this.onceListeners.has(event)) {
      this.onceListeners.get(event).delete(callback);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    // Regular listeners
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });
    }

    // Once listeners
    if (this.onceListeners.has(event)) {
      const callbacks = this.onceListeners.get(event);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in once listener for "${event}":`, error);
        }
      });
      callbacks.clear();
    }

    // Wildcard listeners (listen to all events)
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(callback => {
        try {
          callback({ event, data });
        } catch (error) {
          console.error(`Error in wildcard listener:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event or all events
   * @param {string} [event] - Event name (optional)
   */
  clear(event) {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  /**
   * Get count of listeners for an event
   * @param {string} event - Event name
   * @returns {number} Listener count
   */
  listenerCount(event) {
    const regular = this.listeners.has(event) ? this.listeners.get(event).size : 0;
    const once = this.onceListeners.has(event) ? this.onceListeners.get(event).size : 0;
    return regular + once;
  }
}

// Create singleton instance
export const eventBus = new EventBus();

// Event name constants for type safety and autocomplete
export const Events = {
  // State events
  STATE_CHANGE: 'state:change',
  STATE_RESET: 'state:reset',

  // Block events
  BLOCK_ADD: 'block:add',
  BLOCK_REMOVE: 'block:remove',
  BLOCK_UPDATE: 'block:update',
  BLOCK_SELECT: 'block:select',
  BLOCK_DESELECT: 'block:deselect',
  BLOCK_MOVE: 'block:move',
  BLOCK_DUPLICATE: 'block:duplicate',
  BLOCK_REORDER: 'block:reorder',

  // Canvas events
  CANVAS_RENDER: 'canvas:render',
  CANVAS_DROP: 'canvas:drop',
  CANVAS_CLEAR: 'canvas:clear',

  // History events
  HISTORY_PUSH: 'history:push',
  HISTORY_UNDO: 'history:undo',
  HISTORY_REDO: 'history:redo',
  HISTORY_CHANGE: 'history:change',

  // Project events
  PROJECT_NEW: 'project:new',
  PROJECT_LOAD: 'project:load',
  PROJECT_SAVE: 'project:save',
  PROJECT_EXPORT: 'project:export',
  PROJECT_CHANGE: 'project:change',

  // Panel events
  PANEL_CHANGE: 'panel:change',
  PANEL_TOGGLE: 'panel:toggle',

  // Property events
  PROPERTY_CHANGE: 'property:change',

  // UI events
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',
  TOAST_SHOW: 'toast:show',
  LOADING_START: 'loading:start',
  LOADING_END: 'loading:end',

  // AI events
  AI_GENERATE_START: 'ai:generate:start',
  AI_GENERATE_COMPLETE: 'ai:generate:complete',
  AI_GENERATE_ERROR: 'ai:generate:error',

  // Keyboard events
  SHORTCUT_UNDO: 'shortcut:undo',
  SHORTCUT_REDO: 'shortcut:redo',
  SHORTCUT_SAVE: 'shortcut:save',
  SHORTCUT_DELETE: 'shortcut:delete',
  SHORTCUT_DUPLICATE: 'shortcut:duplicate',
  SHORTCUT_ESCAPE: 'shortcut:escape',

  // Drag and drop events
  DRAG_START: 'drag:start',
  DRAG_END: 'drag:end',
  DRAG_OVER: 'drag:over',
  DROP: 'drop',

  // View events
  VIEW_CHANGE: 'view:change',
  ZOOM_CHANGE: 'zoom:change'
};

export default eventBus;
