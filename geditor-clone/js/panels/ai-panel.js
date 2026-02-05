/**
 * GEditor Clone - AI Panel
 * UI for AI-powered page generation
 */

import { store } from '../core/state.js';
import { eventBus, Events } from '../core/events.js';
import { aiService } from '../ai/ai-service.js';
import { toastService } from '../services/toast-service.js';

class AIPanel {
  constructor() {
    this.urlInput = null;
    this.nameInput = null;
    this.descInput = null;
    this.generateBtn = null;

    this._init();
  }

  /**
   * Initialize AI panel
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
    this.urlInput = document.getElementById('aiUrlInput');
    this.nameInput = document.getElementById('aiProductName');
    this.descInput = document.getElementById('aiProductDesc');
    this.generateBtn = document.getElementById('aiGenerateBtn');

    if (!this.generateBtn) return;

    // Generate button click
    this.generateBtn.addEventListener('click', () => this._handleGenerate());

    // Enter key in URL input
    if (this.urlInput) {
      this.urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this._handleGenerate();
        }
      });
    }

    // Event listeners
    eventBus.on(Events.AI_GENERATE_START, () => this._setLoading(true));
    eventBus.on(Events.AI_GENERATE_COMPLETE, () => this._setLoading(false));
    eventBus.on(Events.AI_GENERATE_ERROR, () => this._setLoading(false));
  }

  /**
   * Handle generate button click
   * @private
   */
  async _handleGenerate() {
    const url = this.urlInput?.value.trim();
    const name = this.nameInput?.value.trim();
    const desc = this.descInput?.value.trim();

    // Check API key
    if (!store.get('settings.openaiApiKey')) {
      toastService.error('설정에서 OpenAI API 키를 입력하세요');
      return;
    }

    // Validate input
    if (!url && !name && !desc) {
      toastService.warning('URL을 입력하거나 상품 정보를 입력하세요');
      return;
    }

    try {
      let blocks;

      if (url) {
        // Generate from URL
        toastService.info('URL에서 상품 정보를 가져오는 중...');
        blocks = await aiService.generateFromUrl(url);
      } else {
        // Generate from manual input
        toastService.info('AI가 상세페이지를 생성하는 중...');
        blocks = await aiService.generateProductPage({
          name: name || '상품',
          description: desc || ''
        });
      }

      // Clear existing blocks and add new ones
      store.set('blocks', []);
      blocks.forEach(block => store.addBlock(block));

      // Select first block
      if (blocks.length > 0) {
        store.selectBlock(blocks[0].id);
      }

      // Trigger canvas render
      eventBus.emit(Events.CANVAS_RENDER);

      toastService.success('상세페이지가 생성되었습니다!');

      // Clear inputs
      if (this.urlInput) this.urlInput.value = '';
      if (this.nameInput) this.nameInput.value = '';
      if (this.descInput) this.descInput.value = '';

    } catch (error) {
      console.error('AI generation error:', error);
      toastService.error(error.message || 'AI 생성에 실패했습니다');
    }
  }

  /**
   * Set loading state
   * @private
   */
  _setLoading(isLoading) {
    if (!this.generateBtn) return;

    if (isLoading) {
      this.generateBtn.disabled = true;
      this.generateBtn.innerHTML = `
        <span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span>
        <span>생성 중...</span>
      `;
    } else {
      this.generateBtn.disabled = false;
      this.generateBtn.innerHTML = `
        <span class="material-symbols-outlined">auto_awesome</span>
        <span>AI로 생성하기</span>
      `;
    }
  }
}

// Export singleton
export const aiPanel = new AIPanel();

export default aiPanel;
