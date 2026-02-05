/**
 * GEditor Clone - Toast Notification Service
 */

import { eventBus, Events } from '../core/events.js';

class ToastService {
  constructor() {
    this.container = null;
    this.toasts = [];
    this.defaultDuration = 3000;

    this._init();
  }

  /**
   * Initialize toast service
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
   * Setup toast container and event listeners
   * @private
   */
  _setup() {
    this.container = document.getElementById('toastContainer');

    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.id = 'toastContainer';
      document.body.appendChild(this.container);
    }

    // Listen for toast events
    eventBus.on(Events.TOAST_SHOW, (data) => {
      this.show(data);
    });
  }

  /**
   * Show a toast notification
   * @param {Object} options - Toast options
   * @param {string} options.message - Toast message
   * @param {string} [options.type='info'] - Toast type (success, error, warning, info)
   * @param {number} [options.duration] - Duration in ms (0 for persistent)
   */
  show({ message, type = 'info', duration }) {
    const id = Date.now();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.dataset.toastId = id;

    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    toast.innerHTML = `
      <span class="toast-icon">
        <span class="material-symbols-outlined">${icons[type] || icons.info}</span>
      </span>
      <span class="toast-message">${message}</span>
      <button class="toast-close">
        <span class="material-symbols-outlined">close</span>
      </button>
    `;

    // Add close handler
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.hide(id);
    });

    this.container.appendChild(toast);
    this.toasts.push({ id, toast });

    // Auto-hide after duration
    const actualDuration = duration !== undefined ? duration : this.defaultDuration;
    if (actualDuration > 0) {
      setTimeout(() => this.hide(id), actualDuration);
    }

    return id;
  }

  /**
   * Hide a toast by ID
   * @param {number} id - Toast ID
   */
  hide(id) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index === -1) return;

    const { toast } = this.toasts[index];
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';

    setTimeout(() => {
      toast.remove();
      this.toasts.splice(index, 1);
    }, 200);
  }

  /**
   * Clear all toasts
   */
  clear() {
    this.toasts.forEach(({ toast }) => toast.remove());
    this.toasts = [];
  }

  // Convenience methods
  success(message, duration) {
    return this.show({ message, type: 'success', duration });
  }

  error(message, duration) {
    return this.show({ message, type: 'error', duration });
  }

  warning(message, duration) {
    return this.show({ message, type: 'warning', duration });
  }

  info(message, duration) {
    return this.show({ message, type: 'info', duration });
  }
}

// Export singleton
export const toastService = new ToastService();

export default toastService;
