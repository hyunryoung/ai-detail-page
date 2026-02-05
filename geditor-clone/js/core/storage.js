/**
 * GEditor Clone - Storage Service
 * localStorage + IndexedDB for persistent storage
 */

import { generateId } from './utils.js';

// ============================================
// LocalStorage Wrapper
// ============================================

const STORAGE_PREFIX = 'geditor_';

export const localStorage = {
  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Stored value or default
   */
  get(key, defaultValue = null) {
    try {
      const item = window.localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('LocalStorage get error:', error);
      return defaultValue;
    }
  },

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   */
  set(key, value) {
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error('LocalStorage set error:', error);
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      window.localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error('LocalStorage remove error:', error);
    }
  },

  /**
   * Get all keys with prefix
   * @returns {string[]} Array of keys
   */
  keys() {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keys.push(key.substring(STORAGE_PREFIX.length));
      }
    }
    return keys;
  },

  /**
   * Clear all items with prefix
   */
  clear() {
    const keys = this.keys();
    keys.forEach(key => this.remove(key));
  }
};


// ============================================
// IndexedDB Wrapper (for images/blobs)
// ============================================

const DB_NAME = 'geditor_db';
const DB_VERSION = 1;
const STORES = {
  IMAGES: 'images',
  PROJECTS: 'projects'
};

class IndexedDBService {
  constructor() {
    this.db = null;
    this._initPromise = null;
  }

  /**
   * Initialize IndexedDB
   * @returns {Promise<IDBDatabase>}
   */
  async init() {
    if (this.db) return this.db;
    if (this._initPromise) return this._initPromise;

    this._initPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create images store
        if (!db.objectStoreNames.contains(STORES.IMAGES)) {
          const imageStore = db.createObjectStore(STORES.IMAGES, { keyPath: 'id' });
          imageStore.createIndex('name', 'name', { unique: false });
          imageStore.createIndex('folder', 'folder', { unique: false });
          imageStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create projects store
        if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
          const projectStore = db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
          projectStore.createIndex('name', 'name', { unique: false });
          projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });

    return this._initPromise;
  }

  /**
   * Get object store
   * @param {string} storeName - Store name
   * @param {string} mode - Transaction mode
   * @returns {IDBObjectStore}
   */
  async _getStore(storeName, mode = 'readonly') {
    const db = await this.init();
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  /**
   * Add item to store
   * @param {string} storeName - Store name
   * @param {Object} item - Item to add
   * @returns {Promise<string>} Item ID
   */
  async add(storeName, item) {
    const store = await this._getStore(storeName, 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.add(item);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get item by ID
   * @param {string} storeName - Store name
   * @param {string} id - Item ID
   * @returns {Promise<Object|null>}
   */
  async get(storeName, id) {
    const store = await this._getStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all items from store
   * @param {string} storeName - Store name
   * @returns {Promise<Array>}
   */
  async getAll(storeName) {
    const store = await this._getStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update item
   * @param {string} storeName - Store name
   * @param {Object} item - Item to update (must have id)
   * @returns {Promise<void>}
   */
  async update(storeName, item) {
    const store = await this._getStore(storeName, 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete item by ID
   * @param {string} storeName - Store name
   * @param {string} id - Item ID
   * @returns {Promise<void>}
   */
  async delete(storeName, id) {
    const store = await this._getStore(storeName, 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all items from store
   * @param {string} storeName - Store name
   * @returns {Promise<void>}
   */
  async clear(storeName) {
    const store = await this._getStore(storeName, 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Query items by index
   * @param {string} storeName - Store name
   * @param {string} indexName - Index name
   * @param {*} value - Index value to match
   * @returns {Promise<Array>}
   */
  async queryByIndex(storeName, indexName, value) {
    const store = await this._getStore(storeName);
    const index = store.index(indexName);

    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDB = new IndexedDBService();


// ============================================
// Image Storage
// ============================================

export const imageStorage = {
  /**
   * Save image to IndexedDB
   * @param {File|Blob} file - Image file
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Saved image info
   */
  async save(file, metadata = {}) {
    const id = generateId('img');

    // Read file as base64 for simplicity
    // In production, store as Blob for efficiency
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const imageData = {
      id,
      name: metadata.name || file.name,
      type: file.type,
      size: file.size,
      data: base64,
      folder: metadata.folder || 'default',
      createdAt: new Date().toISOString(),
      ...metadata
    };

    await indexedDB.add(STORES.IMAGES, imageData);

    // Return info without the blob data
    const { data, ...info } = imageData;
    return { ...info, url: data };
  },

  /**
   * Get image by ID
   * @param {string} id - Image ID
   * @returns {Promise<Object|null>}
   */
  async get(id) {
    const image = await indexedDB.get(STORES.IMAGES, id);
    if (!image) return null;

    return {
      ...image,
      url: image.data
    };
  },

  /**
   * Get all images
   * @param {string} [folder] - Optional folder filter
   * @returns {Promise<Array>}
   */
  async getAll(folder) {
    let images;
    if (folder) {
      images = await indexedDB.queryByIndex(STORES.IMAGES, 'folder', folder);
    } else {
      images = await indexedDB.getAll(STORES.IMAGES);
    }

    return images.map(img => ({
      id: img.id,
      name: img.name,
      type: img.type,
      size: img.size,
      folder: img.folder,
      createdAt: img.createdAt,
      url: img.data
    }));
  },

  /**
   * Delete image
   * @param {string} id - Image ID
   */
  async delete(id) {
    await indexedDB.delete(STORES.IMAGES, id);
  },

  /**
   * Update image metadata
   * @param {string} id - Image ID
   * @param {Object} updates - Metadata updates
   */
  async update(id, updates) {
    const existing = await indexedDB.get(STORES.IMAGES, id);
    if (!existing) return;

    await indexedDB.update(STORES.IMAGES, {
      ...existing,
      ...updates
    });
  }
};


// ============================================
// Project Storage
// ============================================

export const projectStorage = {
  /**
   * Save project
   * @param {Object} project - Project data
   * @returns {Promise<string>} Project ID
   */
  async save(project) {
    const existingId = project.id;
    const projectData = {
      ...project,
      id: existingId || generateId('proj'),
      updatedAt: new Date().toISOString()
    };

    if (!projectData.createdAt) {
      projectData.createdAt = projectData.updatedAt;
    }

    await indexedDB.update(STORES.PROJECTS, projectData);

    // Also save to localStorage for quick access
    localStorage.set(`project_${projectData.id}`, {
      id: projectData.id,
      name: projectData.name,
      updatedAt: projectData.updatedAt
    });

    return projectData.id;
  },

  /**
   * Load project by ID
   * @param {string} id - Project ID
   * @returns {Promise<Object|null>}
   */
  async load(id) {
    return await indexedDB.get(STORES.PROJECTS, id);
  },

  /**
   * Get all projects (metadata only)
   * @returns {Promise<Array>}
   */
  async list() {
    const projects = await indexedDB.getAll(STORES.PROJECTS);
    return projects.map(p => ({
      id: p.id,
      name: p.name,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    })).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  /**
   * Delete project
   * @param {string} id - Project ID
   */
  async delete(id) {
    await indexedDB.delete(STORES.PROJECTS, id);
    localStorage.remove(`project_${id}`);
  },

  /**
   * Get last edited project ID
   * @returns {string|null}
   */
  getLastProjectId() {
    return localStorage.get('lastProjectId', null);
  },

  /**
   * Set last edited project ID
   * @param {string} id - Project ID
   */
  setLastProjectId(id) {
    localStorage.set('lastProjectId', id);
  }
};

export { STORES };
