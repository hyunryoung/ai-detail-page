/**
 * GEditor Clone - Autosave Service
 */

import { store } from '../core/state.js';
import { eventBus, Events } from '../core/events.js';
import { projectStorage, localStorage as ls } from '../core/storage.js';

class AutosaveService {
  constructor() {
    this.interval = null;
    this.isEnabled = true;
    this.saveInterval = 60000; // 60 seconds
    this.lastSaveTime = null;

    this._init();
  }

  /**
   * Initialize autosave service
   * @private
   */
  _init() {
    // Load settings
    this.isEnabled = store.get('settings.autosaveEnabled') !== false;
    this.saveInterval = store.get('settings.autosaveInterval') || 60000;

    // Start autosave timer
    if (this.isEnabled) {
      this.start();
    }

    // Save on page unload
    window.addEventListener('beforeunload', (e) => {
      if (store.get('project.isDirty')) {
        this.save();
        // Show warning for unsaved changes
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // Watch for settings changes
    store.watch('settings.autosaveEnabled', (enabled) => {
      this.isEnabled = enabled;
      if (enabled) {
        this.start();
      } else {
        this.stop();
      }
    });

    // Listen for manual save requests
    eventBus.on(Events.SHORTCUT_SAVE, () => {
      this.save();
    });
  }

  /**
   * Start autosave timer
   */
  start() {
    this.stop(); // Clear existing interval

    this.interval = setInterval(() => {
      if (store.get('project.isDirty')) {
        this.save();
      }
    }, this.saveInterval);

    console.log('Autosave started:', this.saveInterval / 1000, 'seconds');
  }

  /**
   * Stop autosave timer
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Save project
   */
  async save() {
    try {
      // Update status
      this._updateStatus('saving');

      const projectData = store.toJSON();
      const projectId = await projectStorage.save(projectData);

      // Update project ID if new
      if (!store.get('project.id')) {
        store.set('project.id', projectId, true);
      }

      // Mark as saved
      store.set('project.isDirty', false, true);
      this.lastSaveTime = new Date();

      // Remember last project
      projectStorage.setLastProjectId(projectId);

      // Update status
      this._updateStatus('saved');

      eventBus.emit(Events.PROJECT_SAVE, { projectId });

      console.log('Project saved:', projectId);
    } catch (error) {
      console.error('Failed to save project:', error);
      this._updateStatus('error');

      eventBus.emit(Events.TOAST_SHOW, {
        type: 'error',
        message: '저장에 실패했습니다'
      });
    }
  }

  /**
   * Load a project
   * @param {string} projectId - Project ID
   */
  async load(projectId) {
    try {
      const projectData = await projectStorage.load(projectId);

      if (!projectData) {
        throw new Error('Project not found');
      }

      store.fromJSON(projectData);
      store.set('project.isDirty', false, true);

      this._updateStatus('saved');

      eventBus.emit(Events.PROJECT_LOAD, { projectId });
      eventBus.emit(Events.CANVAS_RENDER);

      return projectData;
    } catch (error) {
      console.error('Failed to load project:', error);

      eventBus.emit(Events.TOAST_SHOW, {
        type: 'error',
        message: '프로젝트를 불러올 수 없습니다'
      });

      return null;
    }
  }

  /**
   * Create a new project
   */
  newProject() {
    store.reset();
    store.set('project.id', null);
    store.set('project.name', '새 프로젝트');
    store.set('project.createdAt', new Date().toISOString());
    store.set('project.isDirty', false);

    this._updateStatus('saved');

    eventBus.emit(Events.PROJECT_NEW);
    eventBus.emit(Events.CANVAS_RENDER);
  }

  /**
   * Update save status in UI
   * @private
   */
  _updateStatus(status) {
    const statusEl = document.getElementById('projectStatus');
    if (!statusEl) return;

    const dot = statusEl.querySelector('.dot');
    const text = statusEl.querySelector('span:last-child');

    switch (status) {
      case 'saving':
        statusEl.classList.add('saving');
        if (text) text.textContent = '저장 중...';
        break;

      case 'saved':
        statusEl.classList.remove('saving');
        if (text) text.textContent = '저장됨';
        if (dot) dot.style.background = 'var(--color-success)';
        break;

      case 'unsaved':
        statusEl.classList.remove('saving');
        if (text) text.textContent = '수정됨';
        if (dot) dot.style.background = 'var(--color-warning)';
        break;

      case 'error':
        statusEl.classList.remove('saving');
        if (text) text.textContent = '저장 실패';
        if (dot) dot.style.background = 'var(--color-danger)';
        break;
    }
  }

  /**
   * Get save status info
   * @returns {Object}
   */
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      isDirty: store.get('project.isDirty'),
      lastSaveTime: this.lastSaveTime
    };
  }

  /**
   * Set autosave interval
   * @param {number} ms - Interval in milliseconds
   */
  setInterval(ms) {
    this.saveInterval = ms;
    store.set('settings.autosaveInterval', ms);

    if (this.isEnabled) {
      this.start(); // Restart with new interval
    }
  }
}

// Export singleton
export const autosaveService = new AutosaveService();

export default autosaveService;
