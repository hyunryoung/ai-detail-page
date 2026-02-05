/**
 * GEditor Clone - Panel Manager
 * Handles left panel tab switching and state
 */

import { store } from '../core/state.js';
import { eventBus, Events } from '../core/events.js';

class PanelManager {
  constructor() {
    this.iconBar = null;
    this.leftPanel = null;
    this.panels = new Map();

    this._init();
  }

  /**
   * Initialize the panel manager
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
   * Setup panel elements and events
   * @private
   */
  _setup() {
    this.iconBar = document.getElementById('iconBar');
    this.leftPanel = document.getElementById('leftPanel');

    if (!this.iconBar || !this.leftPanel) {
      console.error('Panel elements not found');
      return;
    }

    // Collect all panel content elements
    this.leftPanel.querySelectorAll('[data-panel]').forEach(panel => {
      this.panels.set(panel.dataset.panel, panel);
    });

    this._setupEventListeners();
    this._setupStoreSubscription();

    // Set initial active panel
    this._showPanel(store.get('ui.activePanel') || 'ai');
  }

  /**
   * Setup event listeners
   * @private
   */
  _setupEventListeners() {
    // Icon bar buttons
    this.iconBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.icon-btn');
      if (btn && btn.dataset.panel) {
        this.switchPanel(btn.dataset.panel);
      }
    });

    // Close panel buttons
    this.leftPanel.addEventListener('click', (e) => {
      if (e.target.closest('[data-close-panel]')) {
        this.collapseLeft();
      }
    });

    // Right panel toggle
    const toggleRightBtn = document.getElementById('toggleRightPanel');
    if (toggleRightBtn) {
      toggleRightBtn.addEventListener('click', () => {
        this.toggleRight();
      });
    }
  }

  /**
   * Setup store subscription
   * @private
   */
  _setupStoreSubscription() {
    store.watch('ui.activePanel', (panelId) => {
      this._showPanel(panelId);
    });

    store.watch('ui.leftPanelCollapsed', (collapsed) => {
      this.leftPanel.classList.toggle('collapsed', collapsed);
    });

    store.watch('ui.rightPanelCollapsed', (collapsed) => {
      const rightPanel = document.getElementById('rightPanel');
      if (rightPanel) {
        rightPanel.classList.toggle('collapsed', collapsed);
      }
    });
  }

  /**
   * Switch to a panel
   * @param {string} panelId - Panel identifier
   */
  switchPanel(panelId) {
    if (!this.panels.has(panelId)) {
      console.warn(`Panel not found: ${panelId}`);
      return;
    }

    // Expand left panel if collapsed
    if (store.get('ui.leftPanelCollapsed')) {
      store.set('ui.leftPanelCollapsed', false);
    }

    store.set('ui.activePanel', panelId);
    eventBus.emit(Events.PANEL_CHANGE, { panelId });
  }

  /**
   * Show a panel (internal)
   * @private
   */
  _showPanel(panelId) {
    // Update icon bar active state
    this.iconBar.querySelectorAll('.icon-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.panel === panelId);
    });

    // Show/hide panel content
    this.panels.forEach((panel, id) => {
      panel.classList.toggle('hidden', id !== panelId);
    });
  }

  /**
   * Collapse left panel
   */
  collapseLeft() {
    store.set('ui.leftPanelCollapsed', true);
  }

  /**
   * Expand left panel
   */
  expandLeft() {
    store.set('ui.leftPanelCollapsed', false);
  }

  /**
   * Toggle left panel
   */
  toggleLeft() {
    const collapsed = store.get('ui.leftPanelCollapsed');
    store.set('ui.leftPanelCollapsed', !collapsed);
  }

  /**
   * Collapse right panel
   */
  collapseRight() {
    store.set('ui.rightPanelCollapsed', true);
  }

  /**
   * Expand right panel
   */
  expandRight() {
    store.set('ui.rightPanelCollapsed', false);
  }

  /**
   * Toggle right panel
   */
  toggleRight() {
    const collapsed = store.get('ui.rightPanelCollapsed');
    store.set('ui.rightPanelCollapsed', !collapsed);
    eventBus.emit(Events.PANEL_TOGGLE, { panel: 'right', collapsed: !collapsed });
  }

  /**
   * Get active panel ID
   * @returns {string}
   */
  getActivePanel() {
    return store.get('ui.activePanel');
  }
}

// Export singleton
export const panelManager = new PanelManager();

export default panelManager;
