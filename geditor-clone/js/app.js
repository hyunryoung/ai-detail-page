/**
 * GEditor Clone - Main Application Entry Point
 * Initializes all modules and sets up the editor
 */

// Core modules
import { store } from './core/state.js';
import { eventBus, Events } from './core/events.js';
import { history } from './core/history.js';
import { localStorage as ls, projectStorage } from './core/storage.js';

// Editor modules
import { canvasManager } from './editor/canvas.js';
import { blockRegistry } from './editor/block-registry.js';

// Panel modules
import { panelManager } from './panels/panel-manager.js';
import { blockPanel } from './panels/block-panel.js';
import { propertyPanel } from './panels/property-panel.js';
import { aiPanel } from './panels/ai-panel.js';

// AI modules
import { aiService } from './ai/ai-service.js';

// Service modules
import { toastService } from './services/toast-service.js';
import { keyboardService } from './services/keyboard-service.js';
import { autosaveService } from './services/autosave-service.js';
import { exportService } from './services/export-service.js';

/**
 * Main Application Class
 */
class GEditorApp {
  constructor() {
    this.isInitialized = false;
    this.version = '1.0.0';
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.isInitialized) return;

    console.log('GEditor Clone v' + this.version + ' initializing...');

    try {
      // Show loading overlay
      this._showLoading(true);

      // Load saved settings
      await this._loadSettings();

      // Setup UI event handlers
      this._setupUIEvents();

      // Setup history button states
      this._setupHistoryButtons();

      // Load last project or create new
      await this._loadOrCreateProject();

      // Hide loading overlay
      this._showLoading(false);

      this.isInitialized = true;
      console.log('GEditor Clone initialized successfully');

      // Show welcome toast
      toastService.success('에디터가 준비되었습니다');

    } catch (error) {
      console.error('Failed to initialize GEditor:', error);
      this._showLoading(false);
      toastService.error('초기화에 실패했습니다');
    }
  }

  /**
   * Load saved settings
   * @private
   */
  async _loadSettings() {
    // Load API key from localStorage
    const apiKey = ls.get('openaiApiKey', '');
    if (apiKey) {
      store.set('settings.openaiApiKey', apiKey);
      const input = document.getElementById('openaiApiKey');
      if (input) input.value = apiKey;
    }

    // Load autosave setting
    const autosaveEnabled = ls.get('autosaveEnabled', true);
    store.set('settings.autosaveEnabled', autosaveEnabled);
  }

  /**
   * Load last project or create new
   * @private
   */
  async _loadOrCreateProject() {
    const lastProjectId = projectStorage.getLastProjectId();

    if (lastProjectId) {
      const loaded = await autosaveService.load(lastProjectId);
      if (loaded) {
        // Update project name in UI
        const nameEl = document.getElementById('projectName');
        if (nameEl) {
          nameEl.textContent = loaded.project?.name || '새 프로젝트';
        }
        return;
      }
    }

    // Create new project
    autosaveService.newProject();
  }

  /**
   * Setup UI event handlers
   * @private
   */
  _setupUIEvents() {
    // Header buttons
    this._setupHeaderButtons();

    // Canvas toolbar
    this._setupCanvasToolbar();

    // Dropdown menus
    this._setupDropdowns();

    // Empty state buttons
    this._setupEmptyStateButtons();

    // Settings
    this._setupSettings();

    // Project name editing
    this._setupProjectName();
  }

  /**
   * Setup header button handlers
   * @private
   */
  _setupHeaderButtons() {
    // Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        autosaveService.save();
        toastService.success('저장되었습니다');
      });
    }

    // Preview button
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        exportService.preview();
      });
    }

    // Publish button
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
      publishBtn.addEventListener('click', () => {
        exportService.download();
      });
    }

    // Undo/Redo buttons
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    if (undoBtn) {
      undoBtn.addEventListener('click', () => history.undo());
    }
    if (redoBtn) {
      redoBtn.addEventListener('click', () => history.redo());
    }
  }

  /**
   * Setup history button states
   * @private
   */
  _setupHistoryButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    const updateButtons = (status) => {
      if (undoBtn) undoBtn.disabled = !status.canUndo;
      if (redoBtn) redoBtn.disabled = !status.canRedo;
    };

    // Initial state
    updateButtons(history.getStatus());

    // Subscribe to history changes
    eventBus.on(Events.HISTORY_CHANGE, updateButtons);
  }

  /**
   * Setup canvas toolbar handlers
   * @private
   */
  _setupCanvasToolbar() {
    // View mode toggle
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        canvasManager.setViewMode(btn.dataset.view);
      });
    });

    // Zoom controls
    let zoom = 100;
    const zoomValue = document.getElementById('zoomValue');
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    const canvas = document.getElementById('canvas');

    const updateZoom = (value) => {
      zoom = Math.min(200, Math.max(50, value));
      if (zoomValue) zoomValue.textContent = zoom + '%';
      if (canvas) canvas.style.transform = `scale(${zoom / 100})`;
      store.set('ui.zoom', zoom);
    };

    if (zoomIn) {
      zoomIn.addEventListener('click', () => updateZoom(zoom + 10));
    }
    if (zoomOut) {
      zoomOut.addEventListener('click', () => updateZoom(zoom - 10));
    }
  }

  /**
   * Setup dropdown menus
   * @private
   */
  _setupDropdowns() {
    // Toggle dropdowns
    document.querySelectorAll('[data-dropdown]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = btn.closest('.dropdown');
        const isOpen = dropdown.classList.contains('open');

        // Close all dropdowns
        document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));

        // Toggle this one
        if (!isOpen) {
          dropdown.classList.add('open');
        }
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
    });

    // File menu items
    document.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const text = item.textContent.trim();

        if (text.includes('새 프로젝트')) {
          autosaveService.newProject();
          toastService.info('새 프로젝트가 생성되었습니다');
        } else if (text.includes('저장')) {
          autosaveService.save();
          toastService.success('저장되었습니다');
        } else if (text.includes('HTML 내보내기')) {
          exportService.download();
        }
      });
    });
  }

  /**
   * Setup empty state button handlers
   * @private
   */
  _setupEmptyStateButtons() {
    // Add block button
    const addBlockBtn = document.getElementById('addBlockBtn');
    if (addBlockBtn) {
      addBlockBtn.addEventListener('click', () => {
        panelManager.switchPanel('block');
      });
    }

    // AI create button
    const aiCreateBtn = document.getElementById('aiCreateBtn');
    if (aiCreateBtn) {
      aiCreateBtn.addEventListener('click', () => {
        panelManager.switchPanel('ai');
      });
    }
  }

  /**
   * Setup settings panel handlers
   * @private
   */
  _setupSettings() {
    // API key input
    const apiKeyInput = document.getElementById('openaiApiKey');
    if (apiKeyInput) {
      apiKeyInput.addEventListener('change', (e) => {
        const value = e.target.value.trim();
        store.set('settings.openaiApiKey', value);
        ls.set('openaiApiKey', value);
        toastService.success('API 키가 저장되었습니다');
      });
    }

    // Autosave toggle
    const autosaveToggle = document.getElementById('autosaveToggle');
    if (autosaveToggle) {
      autosaveToggle.addEventListener('click', () => {
        const isActive = autosaveToggle.classList.toggle('active');
        store.set('settings.autosaveEnabled', isActive);
        ls.set('autosaveEnabled', isActive);
        toastService.info(isActive ? '자동 저장 활성화' : '자동 저장 비활성화');
      });
    }
  }

  /**
   * Setup project name editing
   * @private
   */
  _setupProjectName() {
    const projectInfo = document.getElementById('projectInfo');
    const projectName = document.getElementById('projectName');

    if (projectInfo && projectName) {
      projectInfo.addEventListener('click', () => {
        const currentName = store.get('project.name') || '새 프로젝트';
        const newName = prompt('프로젝트 이름:', currentName);

        if (newName && newName.trim()) {
          store.set('project.name', newName.trim());
          projectName.textContent = newName.trim();
        }
      });
    }
  }

  /**
   * Show/hide loading overlay
   * @private
   */
  _showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      if (show) {
        overlay.classList.add('visible');
      } else {
        overlay.classList.remove('visible');
        // Completely hide after animation
        setTimeout(() => {
          overlay.style.display = 'none';
        }, 300);
      }
    }
  }
}

// Initialize application when DOM is ready
const app = new GEditorApp();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Export for debugging
window.GEditor = {
  app,
  store,
  eventBus,
  history,
  blockRegistry,
  canvasManager,
  panelManager,
  toastService,
  exportService,
  autosaveService,
  aiService
};
